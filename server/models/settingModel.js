import mongoose from 'mongoose';

const settingSchema = mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'ASV Mobiles',
    },
    storeDescription: {
      type: String,
      default: 'One Store. Everything You Need.',
    },
    contactEmail: {
      type: String,
      default: 'support@ASV Mobiles.com',
    },
    phone: {
      type: String,
      default: '+1 234 567 8900',
    },
    address: {
      type: String,
      default: '123 Main Street, City, Country',
    },
    defaultShippingCharge: {
      type: Number,
      default: 10,
    },
    freeShippingThreshold: {
      type: Number,
      default: 50,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
