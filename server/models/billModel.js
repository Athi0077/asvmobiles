import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Walk-in Customer',
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    items: [billItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Mixed'],
      default: 'Cash',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Paid',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    billedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    billedByName: {
      type: String,
      default: 'Cashier',
    },
  },
  {
    timestamps: true,
  }
);

billSchema.index({ createdAt: -1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
