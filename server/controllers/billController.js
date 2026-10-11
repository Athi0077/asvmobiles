import Bill from '../models/billModel.js';
import Product from '../models/productModel.js';
import Counter from '../models/counterModel.js';
import Service from '../models/serviceModel.js';

// @desc    Search products for POS billing (Both website products & internal stock)
// @route   GET /api/bills/search-products
// @access  Private/Admin
export const searchProductsForBilling = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q) {
      // Return top 15 recently added stock items
      const recentProducts = await Product.find({})
        .select('name price discountPrice stock sku images isActive category')
        .populate('category', 'name')
        .sort({ updatedAt: -1 })
        .limit(15);
      return res.json(recentProducts);
    }

    const regex = new RegExp(q, 'i');
    const products = await Product.find({
      $or: [
        { name: regex },
        { sku: regex },
        { brand: regex }
      ]
    })
      .select('name price discountPrice stock sku images isActive category')
      .populate('category', 'name')
      .limit(20);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new POS Bill & auto-deduct stock
// @route   POST /api/bills
// @access  Private/Admin
export const createBill = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      discount = 0,
      tax = 0,
      paymentMode = 'Cash',
      paymentStatus = 'Paid',
      notes = '',
      serviceRecordId,
      serviceId,
      billType
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Please add at least one item to generate a bill');
    }

    // Verify and format items
    const formattedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const price = Number(item.price);
      const qty = Number(item.qty) || 1;

      if (isNaN(price) || price < 0) {
        res.status(400);
        throw new Error(`Invalid price for item "${item.name}"`);
      }

      if (qty < 1) {
        res.status(400);
        throw new Error(`Quantity must be at least 1 for "${item.name}"`);
      }

      const rowTotal = price * qty;
      calculatedSubtotal += rowTotal;

      formattedItems.push({
        product: item.product || null,
        name: item.name,
        price,
        qty,
        total: rowTotal
      });
    }

    const discountAmount = Number(discount) || 0;
    const taxAmount = Number(tax) || 0;
    const grandTotal = Math.max(0, calculatedSubtotal - discountAmount + taxAmount);

    // Generate unique sequential Bill Number
    let counter = await Counter.findByIdAndUpdate(
      { _id: 'billSeq' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // If counter sequence starts at 101 or default
    if (counter.seq < 1000) {
      counter = await Counter.findByIdAndUpdate(
        { _id: 'billSeq' },
        { $set: { seq: 1001 } },
        { new: true }
      );
    }

    const billNumber = `INV-${String(counter.seq)}`;

    // Auto Deduct Stock from Inventory for inventory products
    for (const item of formattedItems) {
      if (item.product) {
        try {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.qty } }
          );
        } catch (stockErr) {
          console.error(`Failed to deduct stock for product ${item.product}:`, stockErr);
        }
      }
    }

    const bill = new Bill({
      billNumber,
      customerName: customerName?.trim() || 'Walk-in Customer',
      customerPhone: customerPhone?.trim() || '',
      items: formattedItems,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      tax: taxAmount,
      grandTotal,
      paymentMode,
      paymentStatus,
      notes: notes?.trim() || '',
      billedBy: req.user?._id,
      billedByName: req.user?.name || 'Cashier',
      serviceRecordId: serviceRecordId || null,
      serviceId: serviceId || '',
      billType: billType || (serviceRecordId ? 'Service' : 'Product'),
    });

    const savedBill = await bill.save();

    // If this bill is generated for a service repair, update the service record
    if (serviceRecordId) {
      try {
        await Service.findByIdAndUpdate(serviceRecordId, {
          isBilled: true,
          billNumber: savedBill.billNumber,
          billId: savedBill._id
        });
      } catch (svcErr) {
        console.error('Failed to update service with bill details:', svcErr);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill: savedBill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills with pagination & filters
// @route   GET /api/bills
// @access  Private/Admin
export const getBills = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const keyword = req.query.keyword?.trim() || '';
    const paymentMode = req.query.paymentMode || 'All';
    const date = req.query.date; // YYYY-MM-DD

    let query = {};

    if (keyword) {
      query.$or = [
        { billNumber: { $regex: keyword, $options: 'i' } },
        { customerPhone: { $regex: keyword, $options: 'i' } },
        { customerName: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (paymentMode && paymentMode !== 'All') {
      query.paymentMode = paymentMode;
    }

    if (date) {
      const parts = date.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const [year, month, day] = parts;
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate today's overview stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayBills = await Bill.find({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todayRevenue = todayBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
    const cashTotal = todayBills.filter(b => b.paymentMode === 'Cash').reduce((acc, b) => acc + (b.grandTotal || 0), 0);
    const upiTotal = todayBills.filter(b => b.paymentMode === 'UPI').reduce((acc, b) => acc + (b.grandTotal || 0), 0);

    res.json({
      bills,
      total,
      page,
      pages: Math.ceil(total / limit),
      todaySummary: {
        totalRevenue: todayRevenue,
        totalBills: todayBills.length,
        cashTotal,
        upiTotal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill by ID
// @route   GET /api/bills/:id
// @access  Private/Admin
export const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      res.status(404);
      throw new Error('Bill not found');
    }
    res.json(bill);
  } catch (error) {
    next(error);
  }
};
