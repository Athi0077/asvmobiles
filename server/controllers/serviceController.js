import Service from '../models/serviceModel.js';
import Counter from '../models/counterModel.js';
import crypto from 'crypto';

// Helper function to generate tracking token
const generateTrackingToken = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase(); // e.g. 8FJ29K (12 chars actually, let's use 4 bytes to get 8 chars, or 3 bytes to get 6 chars)
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      deviceType,
      deviceBrand,
      deviceModel,
      serviceName,
      amount,
      notes
    } = req.body;

    // Generate reliable Service ID using counter
    let counter = await Counter.findByIdAndUpdate(
      { _id: 'serviceId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    // Ensure it starts from 1001
    if (counter.seq < 1001) {
      counter = await Counter.findByIdAndUpdate(
        { _id: 'serviceId' },
        { $set: { seq: 1001 } },
        { new: true }
      );
    }
    
    const serviceId = `SV-${counter.seq}`;
    
    let trackingToken;
    let isUnique = false;
    
    // Ensure tracking token is unique
    while (!isUnique) {
      trackingToken = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existingToken = await Service.findOne({ trackingToken });
      if (!existingToken) {
        isUnique = true;
      }
    }

    const service = await Service.create({
      serviceId,
      customerName,
      customerPhone,
      deviceType,
      deviceBrand,
      deviceModel,
      serviceName,
      amount,
      notes,
      status: 'Pending',
      trackingToken,
      statusHistory: [{ status: 'Pending' }]
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Private/Admin
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    next(error);
  }
};

// @desc    Get service by internal ID
// @route   GET /api/services/:id
// @access  Private/Admin
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service details (non-status)
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      deviceType,
      deviceBrand,
      deviceModel,
      serviceName,
      amount,
      notes
    } = req.body;

    const service = await Service.findById(req.params.id);

    if (service) {
      service.customerName = customerName || service.customerName;
      service.customerPhone = customerPhone || service.customerPhone;
      service.deviceType = deviceType || service.deviceType;
      service.deviceBrand = deviceBrand || service.deviceBrand;
      service.deviceModel = deviceModel || service.deviceModel;
      service.serviceName = serviceName || service.serviceName;
      service.amount = amount !== undefined ? amount : service.amount;
      service.notes = notes !== undefined ? notes : service.notes;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404);
      throw new Error('Service not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update service status
// @route   PATCH /api/services/:id/status
// @access  Private/Admin
export const updateServiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Work Started', 'Almost Ready', 'Finished'];
    
    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const service = await Service.findById(req.params.id);

    if (service) {
      // Prevent duplicate status history if same status is selected
      if (service.status !== status) {
        service.status = status;
        service.statusHistory.push({ status });
        const updatedService = await service.save();
        res.json(updatedService);
      } else {
        res.json(service);
      }
    } else {
      res.status(404);
      throw new Error('Service not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }
    
    await Service.deleteOne({ _id: service._id });
    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get safe public tracking info
// @route   GET /api/services/track/:trackingToken
// @access  Public
export const trackService = async (req, res, next) => {
  try {
    const { trackingToken } = req.params;
    
    const service = await Service.findOne({ trackingToken });
    
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }
    
    // Explicitly return ONLY safe fields
    const safeData = {
      serviceId: service.serviceId,
      customerName: service.customerName,
      deviceType: service.deviceType,
      deviceBrand: service.deviceBrand,
      deviceModel: service.deviceModel,
      serviceName: service.serviceName,
      amount: service.amount,
      status: service.status,
      statusHistory: service.statusHistory,
      notes: service.notes,
      updatedAt: service.updatedAt
    };
    
    res.json(safeData);
  } catch (error) {
    next(error);
  }
};
