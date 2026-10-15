import api from './api';

const LOCAL_STORAGE_KEY = 'asv_saved_label_templates';

// Fallback presets in case backend is offline or during initial state
export const DEFAULT_LABEL_TEMPLATES = [
  {
    _id: 'default-spec-trending',
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
    _id: 'default-iphone-battery',
    name: 'Used iPhone Spec & Battery Tag',
    shopTitle: 'TRENDING MOBILES',
    shopSubtitle: 'TESTED & VERIFIED',
    headerStyle: 'badge',
    labelSize: '50x40',
    customWidthMm: 50,
    customHeightMm: 40,
    isDefault: false,
    fields: [
      { id: 'f-11', label: 'MODEL', value: 'IPHONE 15 PRO', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-12', label: 'STORAGE', value: '256GB', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-13', label: 'COLOR', value: 'NATURAL TITANIUM', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-14', label: 'BATTERY HEALTH', value: '98%', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-15', label: 'FULL KIT', value: 'ORIGINAL BOX', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-16', label: 'WARRANTY', value: 'ASV 6 MONTHS', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-17', label: 'RATE', value: '72,999/-', isHalfWidth: false, isHighlighted: true, fontSize: 'sm' },
    ],
    showBarcode: false,
    barcodeValue: '',
  },
  {
    _id: 'default-barcode-tag',
    name: 'Barcode & Price Tag (70x40)',
    shopTitle: 'ASV MOBILES & ACCESSORIES',
    shopSubtitle: '',
    headerStyle: 'bold',
    labelSize: '70x40',
    customWidthMm: 70,
    customHeightMm: 40,
    isDefault: false,
    fields: [
      { id: 'f-21', label: 'ITEM', value: 'FAST CHARGER 65W GaN', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-22', label: 'WARRANTY', value: '1 YEAR REPLACEMENT', isHalfWidth: false, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-23', label: 'MRP', value: '1,999/-', isHalfWidth: true, isHighlighted: false, fontSize: 'xs' },
      { id: 'f-24', label: 'OFFER RATE', value: '1,299/-', isHalfWidth: true, isHighlighted: true, fontSize: 'sm' },
    ],
    showBarcode: true,
    barcodeValue: '890123456789',
  }
];

const getLocalTemplates = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading local templates', e);
  }
  return DEFAULT_LABEL_TEMPLATES;
};

const saveLocalTemplates = (templates) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Error saving local templates', e);
  }
};

export const getLabelTemplates = async () => {
  try {
    const { data } = await api.get('/label-templates');
    if (Array.isArray(data) && data.length > 0) {
      saveLocalTemplates(data);
      return data;
    }
  } catch (error) {
    console.warn('API getLabelTemplates failed, using local storage fallback:', error.message);
  }
  return getLocalTemplates();
};

export const createLabelTemplate = async (templateData) => {
  try {
    const { data } = await api.post('/label-templates', templateData);
    const locals = getLocalTemplates();
    saveLocalTemplates([data, ...locals]);
    return data;
  } catch (error) {
    console.warn('API createLabelTemplate failed, saving to local storage:', error.message);
    const newTemplate = {
      ...templateData,
      _id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const locals = getLocalTemplates();
    saveLocalTemplates([newTemplate, ...locals]);
    return newTemplate;
  }
};

export const updateLabelTemplate = async (id, templateData) => {
  try {
    const { data } = await api.put(`/label-templates/${id}`, templateData);
    const locals = getLocalTemplates().map(t => (t._id === id ? data : t));
    saveLocalTemplates(locals);
    return data;
  } catch (error) {
    console.warn('API updateLabelTemplate failed, updating locally:', error.message);
    const locals = getLocalTemplates().map(t => {
      if (t._id === id) {
        return { ...t, ...templateData, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    saveLocalTemplates(locals);
    return locals.find(t => t._id === id);
  }
};

export const deleteLabelTemplate = async (id) => {
  try {
    await api.delete(`/label-templates/${id}`);
  } catch (error) {
    console.warn('API deleteLabelTemplate failed, removing from local storage:', error.message);
  }
  const locals = getLocalTemplates().filter(t => t._id !== id);
  saveLocalTemplates(locals);
  return { success: true };
};
