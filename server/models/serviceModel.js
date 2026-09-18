import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'Pending',
      'Work Started',
      'Almost Ready',
      'Finished'
    ],
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  deviceType: {
    type: String,
    enum: ["Mobile", "Laptop", "Tablet", "Other"],
    required: true
  },
  deviceBrand: {
    type: String,
    trim: true
  },
  deviceModel: {
    type: String,
    trim: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Work Started",
      "Almost Ready",
      "Finished"
    ],
    default: "Pending",
    index: true
  },
  trackingToken: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
