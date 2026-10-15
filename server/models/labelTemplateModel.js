import mongoose from 'mongoose';

const labelFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    default: '',
    trim: true,
  },
  isHalfWidth: {
    type: Boolean,
    default: false,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
  fontSize: {
    type: String,
    enum: ['xs', 'sm', 'base', 'lg'],
    default: 'xs',
  },
}, { _id: false });

const labelTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shopTitle: {
      type: String,
      default: 'TRENDING MOBILES',
      trim: true,
    },
    shopSubtitle: {
      type: String,
      default: '',
      trim: true,
    },
    headerStyle: {
      type: String,
      enum: ['badge', 'bold', 'underlined', 'none'],
      default: 'badge',
    },
    labelSize: {
      type: String,
      default: '50x40',
    },
    customWidthMm: {
      type: Number,
      default: 50,
    },
    customHeightMm: {
      type: Number,
      default: 40,
    },
    fields: [labelFieldSchema],
    showBarcode: {
      type: Boolean,
      default: false,
    },
    barcodeValue: {
      type: String,
      default: '',
    },
    showQrCode: {
      type: Boolean,
      default: false,
    },
    qrValue: {
      type: String,
      default: '',
    },
    footerText: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const LabelTemplate = mongoose.model('LabelTemplate', labelTemplateSchema);

export default LabelTemplate;
