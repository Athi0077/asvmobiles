import LabelTemplate from '../models/labelTemplateModel.js';

// Pre-defined default templates
const defaultPresets = [
  {
    name: 'Mobile Spec Sticker (Trending Mobiles)',
    shopTitle: 'TRENDING MOBILES',
    shopSubtitle: '',
    headerStyle: 'badge',
    labelSize: '50x40',
    customWidthMm: 50,
    customHeightMm: 40,
    isDefault: true,
    fields: [
      { id: 'f-1', label: 'MODEL', value: 'VIVO X300 ,5G', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-2', label: 'RAM', value: '12GB', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-3', label: 'ROM', value: '256GB', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-4', label: 'FULL KIT', value: 'YES', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-5', label: 'WARRANTY', value: '27/12/2026', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-6', label: 'RATE', value: '58,499-/-', isHalfWidth: false, isHighlighted: true, fontSize: 'sm' },
    ],
    showBarcode: false,
    barcodeValue: '',
  },
  {
    name: 'Full Spec & Battery Sticker',
    shopTitle: 'ASV MOBILES',
    shopSubtitle: 'TESTED & VERIFIED',
    headerStyle: 'badge',
    labelSize: '50x50',
    customWidthMm: 50,
    customHeightMm: 50,
    isDefault: false,
    fields: [
      { id: 'f-10', label: 'MODEL', value: 'IPHONE 15 PRO', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-11', label: 'STORAGE', value: '128GB', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-12', label: 'COLOR', value: 'NATURAL TITANIUM', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-13', label: 'BATTERY', value: '98% HEALTH', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-14', label: 'FULL KIT', value: 'YES BOX & BILL', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-15', label: 'WARRANTY', value: 'VALID UPTO 6 MOS', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-16', label: 'RATE', value: '72,999/-', isHalfWidth: false, isHighlighted: true, fontSize: 'sm' },
    ],
    showBarcode: false,
    barcodeValue: '',
  },
  {
    name: 'Barcode & Price Tag (70x40)',
    shopTitle: 'ASV MOBILES & ACCESSORIES',
    shopSubtitle: '',
    headerStyle: 'bold',
    labelSize: '70x40',
    customWidthMm: 70,
    customHeightMm: 40,
    isDefault: false,
    fields: [
      { id: 'f-20', label: 'ITEM', value: 'FAST CHARGER 65W GaN', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-21', label: 'WARRANTY', value: '1 YEAR REPLACEMENT', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-22', label: 'MRP', value: '1,999/-', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-23', label: 'OFFER RATE', value: '1,299/-', isHalfWidth: true, isHighlighted: true, fontSize: 'sm' },
    ],
    showBarcode: true,
    barcodeValue: '890123456789',
  }
];

// @desc    Get all label templates (auto-seed if empty)
// @route   GET /api/label-templates
// @access  Private/Admin
export const getLabelTemplates = async (req, res) => {
  try {
    let templates = await LabelTemplate.find().sort({ isDefault: -1, createdAt: -1 });

    if (templates.length === 0) {
      // Seed default presets
      templates = await LabelTemplate.insertMany(
        defaultPresets.map(preset => ({
          ...preset,
          createdBy: req.user?._id,
        }))
      );
    }

    res.json(templates);
  } catch (error) {
    console.error('Error fetching label templates:', error);
    res.status(500).json({ message: 'Failed to fetch label templates', error: error.message });
  }
};

// @desc    Get label template by ID
// @route   GET /api/label-templates/:id
// @access  Private/Admin
export const getLabelTemplateById = async (req, res) => {
  try {
    const template = await LabelTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch template', error: error.message });
  }
};

// @desc    Create a new label template
// @route   POST /api/label-templates
// @access  Private/Admin
export const createLabelTemplate = async (req, res) => {
  try {
    const {
      name,
      shopTitle,
      shopSubtitle,
      headerStyle,
      labelSize,
      customWidthMm,
      customHeightMm,
      fields,
      showBarcode,
      barcodeValue,
      showQrCode,
      qrValue,
      footerText,
      isDefault
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    if (isDefault) {
      await LabelTemplate.updateMany({}, { isDefault: false });
    }

    const template = await LabelTemplate.create({
      name: name.trim(),
      shopTitle: shopTitle || 'TRENDING MOBILES',
      shopSubtitle: shopSubtitle || '',
      headerStyle: headerStyle || 'badge',
      labelSize: labelSize || '50x40',
      customWidthMm: customWidthMm || 50,
      customHeightMm: customHeightMm || 40,
      fields: Array.isArray(fields) ? fields : [],
      showBarcode: !!showBarcode,
      barcodeValue: barcodeValue || '',
      showQrCode: !!showQrCode,
      qrValue: qrValue || '',
      footerText: footerText || '',
      isDefault: !!isDefault,
      createdBy: req.user?._id,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating label template:', error);
    res.status(500).json({ message: 'Failed to save template', error: error.message });
  }
};

// @desc    Update label template
// @route   PUT /api/label-templates/:id
// @access  Private/Admin
export const updateLabelTemplate = async (req, res) => {
  try {
    const template = await LabelTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const {
      name,
      shopTitle,
      shopSubtitle,
      headerStyle,
      labelSize,
      customWidthMm,
      customHeightMm,
      fields,
      showBarcode,
      barcodeValue,
      showQrCode,
      qrValue,
      footerText,
      isDefault
    } = req.body;

    if (name) template.name = name.trim();
    if (shopTitle !== undefined) template.shopTitle = shopTitle;
    if (shopSubtitle !== undefined) template.shopSubtitle = shopSubtitle;
    if (headerStyle !== undefined) template.headerStyle = headerStyle;
    if (labelSize !== undefined) template.labelSize = labelSize;
    if (customWidthMm !== undefined) template.customWidthMm = customWidthMm;
    if (customHeightMm !== undefined) template.customHeightMm = customHeightMm;
    if (fields !== undefined) template.fields = fields;
    if (showBarcode !== undefined) template.showBarcode = showBarcode;
    if (barcodeValue !== undefined) template.barcodeValue = barcodeValue;
    if (showQrCode !== undefined) template.showQrCode = showQrCode;
    if (qrValue !== undefined) template.qrValue = qrValue;
    if (footerText !== undefined) template.footerText = footerText;

    if (isDefault) {
      await LabelTemplate.updateMany({ _id: { $ne: template._id } }, { isDefault: false });
      template.isDefault = true;
    }

    const updated = await template.save();
    res.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Failed to update template', error: error.message });
  }
};

// @desc    Delete label template
// @route   DELETE /api/label-templates/:id
// @access  Private/Admin
export const deleteLabelTemplate = async (req, res) => {
  try {
    const template = await LabelTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await LabelTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Failed to delete template', error: error.message });
  }
};
