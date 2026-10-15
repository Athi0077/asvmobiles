import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Smartphone, 
  Tag, 
  Check, 
  Search, 
  Sliders, 
  Eye, 
  Sparkles,
  QrCode,
  Barcode as BarcodeIcon,
  Copy,
  ChevronDown,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import ThermalLabelPreview from '../../components/ThermalLabelPreview';
import { searchBillingProducts } from '../../services/billingService';
import { 
  getLabelTemplates, 
  createLabelTemplate, 
  updateLabelTemplate, 
  deleteLabelTemplate,
  DEFAULT_LABEL_TEMPLATES
} from '../../services/labelTemplateService';

const PRESET_LABEL_SIZES = [
  { label: '50mm × 40mm (Mobile Sticker)', width: 50, height: 40, id: '50x40' },
  { label: '50mm × 30mm (Compact Mobile)', width: 50, height: 30, id: '50x30' },
  { label: '50mm × 50mm (Square Spec)', width: 50, height: 50, id: '50x50' },
  { label: '70mm × 40mm (Standard Tag)', width: 70, height: 40, id: '70x40' },
  { label: '70mm × 50mm (Large Box Tag)', width: 70, height: 50, id: '70x50' },
  { label: '40mm × 30mm (Mini Accessory)', width: 40, height: 30, id: '40x30' },
  { label: 'Custom Dimensions (mm)', width: 50, height: 40, id: 'custom' },
];

const QUICK_FIELD_PRESETS = [
  { label: 'MODEL', placeholder: 'VIVO X300 ,5G' },
  { label: 'RAM', placeholder: '12GB', isHalfWidth: true },
  { label: 'ROM', placeholder: '256GB', isHalfWidth: true },
  { label: 'COLOR', placeholder: 'TITANIUM GREY', isHalfWidth: true },
  { label: 'BATTERY', placeholder: '98% HEALTH', isHalfWidth: true },
  { label: 'FULL KIT', placeholder: 'YES' },
  { label: 'WARRANTY', placeholder: '27/12/2026' },
  { label: 'RATE', placeholder: '58,499-/-', isHighlighted: true },
  { label: 'IMEI', placeholder: '862934061234567' },
  { label: 'CONDITION', placeholder: 'MINT / A+ GRADE' },
];

const LabelPrintingPage = () => {
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Active Label Configuration
  const [templateName, setTemplateName] = useState('Mobile Spec Sticker (Trending Mobiles)');
  const [shopTitle, setShopTitle] = useState('TRENDING MOBILES');
  const [shopSubtitle, setShopSubtitle] = useState('');
  const [headerStyle, setHeaderStyle] = useState('badge'); // 'badge' | 'bold' | 'underlined' | 'none'
  const [selectedSizeId, setSelectedSizeId] = useState('50x40');
  const [widthMm, setWidthMm] = useState(50);
  const [heightMm, setHeightMm] = useState(40);
  const [fontSizeScale, setFontSizeScale] = useState('normal'); // 'compact' | 'normal' | 'large'
  const [borderStyle, setBorderStyle] = useState('rounded'); // 'rounded' | 'square' | 'none'
  const [copies, setCopies] = useState(1);

  // Barcode / QR State
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');

  // Dynamic Fields
  const [fields, setFields] = useState([
    { id: 'f-1', label: 'MODEL', value: 'VIVO X300 ,5G', isHalfWidth: false, isHighlighted: false },
    { id: 'f-2', label: 'RAM', value: '12GB', isHalfWidth: true, isHighlighted: false },
    { id: 'f-3', label: 'ROM', value: '256GB', isHalfWidth: true, isHighlighted: false },
    { id: 'f-4', label: 'FULL KIT', value: 'YES', isHalfWidth: false, isHighlighted: false },
    { id: 'f-5', label: 'WARRANTY', value: '27/12/2026', isHalfWidth: false, isHighlighted: false },
    { id: 'f-6', label: 'RATE', value: '58,499-/-', isHalfWidth: false, isHighlighted: true },
  ]);

  // Preview Mode: Phone mockup vs pure sticker
  const [previewMode, setPreviewMode] = useState('phone'); // 'phone' | 'clean'

  // Save Template Modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplateNameInput, setNewTemplateNameInput] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Product Inventory Search
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchDebounceRef = useRef(null);

  // New Field custom input
  const [customFieldLabel, setCustomFieldLabel] = useState('');

  // Print tips guide modal
  const [showPrintTips, setShowPrintTips] = useState(false);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await getLabelTemplates();
      setTemplates(data || DEFAULT_LABEL_TEMPLATES);
      if (data && data.length > 0) {
        applyTemplate(data[0]);
      }
    } catch (e) {
      console.error(e);
      setTemplates(DEFAULT_LABEL_TEMPLATES);
      applyTemplate(DEFAULT_LABEL_TEMPLATES[0]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const applyTemplate = (template) => {
    if (!template) return;
    setSelectedTemplateId(template._id || '');
    setTemplateName(template.name || 'Untitled Template');
    setShopTitle(template.shopTitle || 'TRENDING MOBILES');
    setShopSubtitle(template.shopSubtitle || '');
    setHeaderStyle(template.headerStyle || 'badge');
    setSelectedSizeId(template.labelSize || '50x40');
    setWidthMm(template.customWidthMm || 50);
    setHeightMm(template.customHeightMm || 40);
    setShowBarcode(!!template.showBarcode);
    setBarcodeValue(template.barcodeValue || '');
    if (Array.isArray(template.fields) && template.fields.length > 0) {
      setFields(
        template.fields.map(f => ({
          ...f,
          id: f.id || `f-${Math.random().toString(36).substr(2, 9)}`,
        }))
      );
    }
  };

  // Product search auto-fill
  useEffect(() => {
    if (!productSearchQuery.trim()) {
      setProductSearchResults([]);
      setIsSearchingProduct(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingProduct(true);
      try {
        const results = await searchBillingProducts(productSearchQuery);
        setProductSearchResults(results || []);
        setShowProductDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingProduct(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [productSearchQuery]);

  const handleSelectProduct = (product) => {
    const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const formattedPrice = `₹${unitPrice.toLocaleString('en-IN')}/-`;

    // Update fields intelligently
    setFields(prev => {
      let updated = [...prev];
      let hasModel = false;
      let hasRate = false;

      updated = updated.map(f => {
        const lbl = f.label.toUpperCase();
        if (lbl === 'MODEL' || lbl === 'NAME' || lbl === 'ITEM') {
          hasModel = true;
          return { ...f, value: product.name };
        }
        if (lbl === 'RATE' || lbl === 'PRICE' || lbl === 'MRP') {
          hasRate = true;
          return { ...f, value: formattedPrice };
        }
        return f;
      });

      if (!hasModel) {
        updated.unshift({
          id: `f-${Date.now()}`,
          label: 'MODEL',
          value: product.name,
          isHalfWidth: false,
          isHighlighted: false,
        });
      }
      if (!hasRate) {
        updated.push({
          id: `f-${Date.now() + 1}`,
          label: 'RATE',
          value: formattedPrice,
          isHalfWidth: false,
          isHighlighted: true,
        });
      }

      return updated;
    });

    if (product.barcode) {
      setBarcodeValue(product.barcode);
      setShowBarcode(true);
    }

    setShowProductDropdown(false);
    setProductSearchQuery('');
    toast.success(`Loaded details for ${product.name}`);
  };

  // Add field
  const handleAddField = (labelName = 'NEW FIELD', isHalf = false, isHighlight = false, defaultVal = '') => {
    const trimmed = labelName.trim().toUpperCase();
    if (!trimmed) return;

    const newField = {
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      label: trimmed,
      value: defaultVal,
      isHalfWidth: isHalf,
      isHighlighted: isHighlight,
    };

    setFields(prev => [...prev, newField]);
    setCustomFieldLabel('');
    toast.success(`Added ${trimmed} field`);
  };

  // Field change
  const handleFieldChange = (id, key, val) => {
    setFields(prev =>
      prev.map(f => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  // Remove field
  const handleRemoveField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  // Move field order
  const handleMoveField = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    setFields(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Size change
  const handleSizeChange = (sizeId) => {
    setSelectedSizeId(sizeId);
    const found = PRESET_LABEL_SIZES.find(s => s.id === sizeId);
    if (found && sizeId !== 'custom') {
      setWidthMm(found.width);
      setHeightMm(found.height);
    }
  };

  // Save template handler
  const handleSaveTemplateSubmit = async (e) => {
    e.preventDefault();
    const finalName = newTemplateNameInput.trim() || templateName;
    if (!finalName) return toast.error('Enter a template name');

    setSavingTemplate(true);
    try {
      const payload = {
        name: finalName,
        shopTitle,
        shopSubtitle,
        headerStyle,
        labelSize: selectedSizeId,
        customWidthMm: Number(widthMm),
        customHeightMm: Number(heightMm),
        fields,
        showBarcode,
        barcodeValue,
      };

      if (!saveAsNew && selectedTemplateId && !selectedTemplateId.startsWith('default-')) {
        // Update existing
        const updated = await updateLabelTemplate(selectedTemplateId, payload);
        toast.success(`Updated template "${finalName}"`);
        setTemplates(prev => prev.map(t => (t._id === selectedTemplateId ? updated : t)));
      } else {
        // Create new
        const created = await createLabelTemplate(payload);
        toast.success(`Saved new template "${finalName}"`);
        setTemplates(prev => [created, ...prev]);
        setSelectedTemplateId(created._id);
        setTemplateName(created.name);
      }
      setShowSaveModal(false);
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  // Delete template
  const handleDeleteSelectedTemplate = async () => {
    if (!selectedTemplateId) return;
    if (selectedTemplateId.startsWith('default-')) {
      return toast.error('Default system preset templates cannot be deleted');
    }

    if (window.confirm(`Are you sure you want to delete template "${templateName}"?`)) {
      try {
        await deleteLabelTemplate(selectedTemplateId);
        toast.success('Template deleted');
        const remaining = templates.filter(t => t._id !== selectedTemplateId);
        setTemplates(remaining);
        if (remaining.length > 0) {
          applyTemplate(remaining[0]);
        }
      } catch (e) {
        toast.error('Failed to delete template');
      }
    }
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // Render multiple copies for printing
  const printCopiesArray = Array.from({ length: Math.max(1, copies) });

  return (
    <div className="labeling-page-root space-y-6">
      {/* ========================================================================= */}
      {/* PRINT-SPECIFIC CSS RULES                                                  */}
      {/* Perfectly calibrated for thermal rolls (20mm - 70mm, 50x40mm, etc.)       */}
      {/* ========================================================================= */}
      <style>{`
        @page {
          size: ${widthMm}mm ${heightMm}mm;
          margin: 0mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${widthMm}mm !important;
            height: ${heightMm}mm !important;
            background: #ffffff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-print-output, #thermal-print-output * {
            visibility: visible !important;
          }
          #thermal-print-output {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${widthMm}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            display: block !important;
          }
          .thermal-page-item {
            width: ${widthMm}mm !important;
            height: ${heightMm}mm !important;
            max-width: ${widthMm}mm !important;
            max-height: ${heightMm}mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: stretch !important;
            justify-content: stretch !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* HIDDEN PRINT CONTAINER (Rendered only during window.print())             */}
      {/* ========================================================================= */}
      <div id="thermal-print-output" className="hidden">
        {printCopiesArray.map((_, idx) => (
          <div key={idx} className="thermal-page-item">
            <ThermalLabelPreview
              shopTitle={shopTitle}
              shopSubtitle={shopSubtitle}
              headerStyle={headerStyle}
              fields={fields}
              showBarcode={showBarcode}
              barcodeValue={barcodeValue}
              widthMm={widthMm}
              heightMm={heightMm}
              fontSizeScale={fontSizeScale}
              borderStyle="none"
              isPrintMode={true}
            />
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SCREEN UI (Hidden when printing)                                         */}
      {/* ========================================================================= */}
      <div className="no-print space-y-6">
        {/* Top Header & Template Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Tag size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  Labeling Studio
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Thermal Printer
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Custom label & sticker printing for mobile phones, specs, warranty & barcodes
                </p>
              </div>
            </div>
          </div>

          {/* Template Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Template Selector Dropdown */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  const t = templates.find(item => item._id === e.target.value);
                  if (t) applyTemplate(t);
                }}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-primary transition-colors appearance-none pr-8 cursor-pointer"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl._id} value={tmpl._id}>
                    📄 {tmpl.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Save Template Button */}
            <Button
              onClick={() => {
                setNewTemplateNameInput(templateName);
                setSaveAsNew(false);
                setShowSaveModal(true);
              }}
              variant="outline"
              className="rounded-xl text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 border-gray-200 hover:border-primary text-gray-700 hover:text-primary"
            >
              <Save size={15} /> Save Template
            </Button>

            {/* Delete Template (Only if custom) */}
            {selectedTemplateId && !selectedTemplateId.startsWith('default-') && (
              <button
                onClick={handleDeleteSelectedTemplate}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete this template"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Help / Tips */}
            <button
              onClick={() => setShowPrintTips(true)}
              className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
              title="Thermal Printer Setup Guide"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        {/* Quick Inventory Auto-Fill Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          <div className="flex items-center gap-2.5 text-blue-900 w-full sm:w-auto">
            <Sparkles size={18} className="text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold">Quick Load From Product Inventory:</span>
          </div>

          <div className="relative w-full sm:w-80">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search phone or product (e.g. Vivo, iPhone)..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                onFocus={() => {
                  if (productSearchResults.length > 0) setShowProductDropdown(true);
                }}
                className="w-full bg-white border border-blue-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-primary shadow-sm"
              />
              {isSearchingProduct && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {showProductDropdown && productSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-gray-100">
                {productSearchResults.map((prod) => (
                  <button
                    key={prod._id}
                    onClick={() => handleSelectProduct(prod)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                      <p className="text-[10px] text-gray-500">Stock: {prod.stock || 0} units</p>
                    </div>
                    <span className="text-xs font-bold text-primary font-mono whitespace-nowrap">
                      ₹{(prod.discountPrice > 0 ? prod.discountPrice : prod.price).toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Form Editor (Left) & Real-time Mockup Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: FIELD EDITOR & SETTINGS (7 COLS)                            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Header & Branding Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={16} className="text-primary" />
                1. Header & Store Badge
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Store / Header Name
                  </label>
                  <input
                    type="text"
                    value={shopTitle}
                    onChange={(e) => setShopTitle(e.target.value)}
                    placeholder="e.g. TRENDING MOBILES"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-primary uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Header Badge Style
                  </label>
                  <select
                    value={headerStyle}
                    onChange={(e) => setHeaderStyle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-primary"
                  >
                    <option value="badge">Dark Pill Badge (Trending Mobiles Style)</option>
                    <option value="bold">Bold Centered Text</option>
                    <option value="underlined">Underlined Header</option>
                    <option value="none">None / Hide Header</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tagline / Sub-note (Optional)
                </label>
                <input
                  type="text"
                  value={shopSubtitle}
                  onChange={(e) => setShopSubtitle(e.target.value)}
                  placeholder="e.g. TESTED & CERTIFIED / ASV QUALITY"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-primary uppercase"
                />
              </div>
            </div>

            {/* 2. Dynamic Custom Fields Builder */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={16} className="text-primary" />
                    2. Customizable Spec Fields
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Add, edit or reorder fields. Toggle 2-column mode to put RAM & ROM on the same line!
                  </p>
                </div>

                <Button
                  onClick={() => handleAddField('NEW FIELD', false, false, '')}
                  className="rounded-xl text-xs py-1.5 px-3 flex items-center gap-1 shadow-sm self-start sm:self-auto"
                >
                  <Plus size={14} /> Add Field
                </Button>
              </div>

              {/* Quick Field Preset Chips */}
              <div>
                <span className="text-[11px] font-bold text-gray-400 block mb-2 uppercase">
                  Quick Add Preset Chips:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FIELD_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAddField(preset.label, !!preset.isHalfWidth, !!preset.isHighlighted, preset.placeholder)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-gray-200/60"
                    >
                      <Plus size={11} /> {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Field Rows List */}
              <div className="space-y-2.5 pt-2">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-200/70 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2 group"
                  >
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1 self-start sm:self-auto text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 1)}
                        disabled={idx === fields.length - 1}
                        className="p-1 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Field Label (Custom Name) */}
                    <div className="w-full sm:w-32 flex-shrink-0">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldChange(field.id, 'label', e.target.value.toUpperCase())}
                        placeholder="FIELD NAME"
                        className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-gray-900 outline-none focus:border-primary uppercase"
                      />
                    </div>

                    <span className="hidden sm:inline text-gray-400 font-bold">:</span>

                    {/* Field Value */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, 'value', e.target.value)}
                        placeholder="Field Value (e.g. VIVO X300 ,5G)"
                        className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-900 outline-none focus:border-primary"
                      />
                    </div>

                    {/* Layout & Style Toggles */}
                    <div className="flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-0">
                      {/* Half width toggle (2 per line) */}
                      <button
                        type="button"
                        onClick={() => handleFieldChange(field.id, 'isHalfWidth', !field.isHalfWidth)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          field.isHalfWidth
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                        title="When enabled, pairs side-by-side with next field on same row (e.g. RAM & ROM)"
                      >
                        {field.isHalfWidth ? '½ Line' : 'Full'}
                      </button>

                      {/* Highlight / Rate toggle */}
                      <button
                        type="button"
                        onClick={() => handleFieldChange(field.id, 'isHighlighted', !field.isHighlighted)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          field.isHighlighted
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                        title="Highlight field with rate underline styling"
                      >
                        Highlight
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Field"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                    <p className="text-xs text-gray-500 mb-2">No fields added yet</p>
                    <Button
                      onClick={() => handleAddField('MODEL', false, false, '')}
                      className="text-xs py-1.5 px-3 rounded-xl"
                    >
                      <Plus size={14} /> Add First Field
                    </Button>
                  </div>
                )}
              </div>

              {/* Add Custom Field by typing */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type any custom field name (e.g. IMEI, DISPLAY, CPU)..."
                  value={customFieldLabel}
                  onChange={(e) => setCustomFieldLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddField(customFieldLabel);
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-primary uppercase"
                />
                <Button
                  onClick={() => handleAddField(customFieldLabel)}
                  variant="outline"
                  className="rounded-xl text-xs py-2 px-3 border-gray-200 hover:border-primary"
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
            </div>

            {/* 3. Barcode & Thermal Roll Sizing */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Printer size={16} className="text-primary" />
                3. Label Dimensions & Barcode
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Size Presets */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Label Roll Size (mm)
                  </label>
                  <select
                    value={selectedSizeId}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-primary"
                  >
                    {PRESET_LABEL_SIZES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Copies */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Print Copies
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-24 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-primary"
                    />
                    <span className="text-xs text-gray-500">copies to print</span>
                  </div>
                </div>
              </div>

              {/* Custom mm if selected */}
              {selectedSizeId === 'custom' && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="100"
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="150"
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Barcode Option */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                    />
                    <BarcodeIcon size={16} className="text-gray-600" />
                    Include Barcode (Code128)
                  </label>

                  {showBarcode && (
                    <span className="text-[10px] text-gray-500">
                      Renders sharp thermal barcode at bottom
                    </span>
                  )}
                </div>

                {showBarcode && (
                  <div>
                    <input
                      type="text"
                      placeholder="Barcode value (e.g. IMEI / SKU / Serial)"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 outline-none focus:border-primary uppercase"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: LIVE VISUAL PREVIEW & PRINT TRIGGER (5 COLS)                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-5">
              {/* Preview Header & View Toggles */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Eye size={16} className="text-primary" />
                    Live Sticker Preview
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Size: {widthMm}mm × {heightMm}mm
                  </span>
                </div>

                {/* View switcher: Phone mockup vs pure sticker */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setPreviewMode('phone')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      previewMode === 'phone'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone size={13} /> On Phone
                  </button>
                  <button
                    onClick={() => setPreviewMode('clean')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      previewMode === 'clean'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Tag size={13} /> Sticker
                  </button>
                </div>
              </div>

              {/* Realistic Preview Display */}
              <div className="bg-gray-900/90 rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[380px] shadow-inner relative overflow-hidden">
                {previewMode === 'phone' ? (
                  /* Phone Back Mockup matching Image 1 */
                  <div className="relative w-64 h-[440px] bg-gradient-to-b from-[#2a303c] via-[#1e232d] to-[#151922] rounded-[42px] border-4 border-[#3d4554] shadow-2xl p-4 flex flex-col items-center justify-between">
                    {/* Camera Bump Mockup (Like Vivo camera circle in Image 1) */}
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-gray-950 via-gray-900 to-black border-2 border-gray-700 shadow-2xl flex items-center justify-center relative mt-1">
                      <div className="w-20 h-20 rounded-full border border-gray-800 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                        </div>
                      </div>
                      <span className="absolute bottom-2 text-[6px] tracking-widest text-blue-400 font-bold uppercase">
                        ZEISS
                      </span>
                    </div>

                    {/* Thermal Sticker Placed on Phone Back */}
                    <div className="w-full my-auto transition-transform duration-200 hover:scale-[1.02]">
                      <div className="bg-white rounded-2xl shadow-2xl p-0.5 border border-gray-200">
                        <ThermalLabelPreview
                          shopTitle={shopTitle}
                          shopSubtitle={shopSubtitle}
                          headerStyle={headerStyle}
                          fields={fields}
                          showBarcode={showBarcode}
                          barcodeValue={barcodeValue}
                          widthMm={widthMm}
                          heightMm={heightMm}
                          fontSizeScale={fontSizeScale}
                          borderStyle="none"
                        />
                      </div>
                    </div>

                    {/* Phone Branding subtle watermark */}
                    <span className="text-[10px] tracking-widest text-gray-600 font-bold mb-1 uppercase">
                      SMARTPHONE
                    </span>
                  </div>
                ) : (
                  /* Clean Sticker Roll View */
                  <div className="max-w-[320px] w-full bg-white rounded-2xl shadow-2xl p-1 border-2 border-dashed border-gray-300">
                    <ThermalLabelPreview
                      shopTitle={shopTitle}
                      shopSubtitle={shopSubtitle}
                      headerStyle={headerStyle}
                      fields={fields}
                      showBarcode={showBarcode}
                      barcodeValue={barcodeValue}
                      widthMm={widthMm}
                      heightMm={heightMm}
                      fontSizeScale={fontSizeScale}
                      borderStyle="none"
                    />
                  </div>
                )}
              </div>

              {/* Font Size & Border Tweaks */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500 font-bold">Font Scale:</span>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  {['compact', 'normal', 'large'].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setFontSizeScale(scale)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-bold text-[11px] transition-all ${
                        fontSizeScale === scale
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Print Button */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handlePrint}
                  className="w-full py-3.5 rounded-2xl text-base font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                >
                  <Printer size={20} />
                  Print Label ({copies} {copies > 1 ? 'Copies' : 'Copy'})
                </Button>

                <p className="text-[11px] text-center text-gray-400">
                  Ready for thermal printer ({widthMm}mm × {heightMm}mm) • 0mm margin
                </p>

                {/* Print Dialog Settings Guide Card */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1.5 mt-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <span>💡</span>
                    <span>Print Dialog-ல் கவனிக்க வேண்டியவை:</span>
                  </div>
                  <ul className="text-[11px] space-y-1 text-amber-900/90 pl-1">
                    <li>
                      <strong>1. Destination:</strong> உங்கள் <strong>Label Printer</strong>-ஐ select செய்யவும் (Microsoft Print to PDF அல்ல).
                    </li>
                    <li>
                      <strong>2. More settings &gt; Margins:</strong> <strong>"None"</strong> என்று வைக்கவும்.
                    </li>
                    <li>
                      <strong>3. More settings &gt; Headers &amp; footers:</strong> <strong>Uncheck</strong> செய்யவும் (URL/Date வராது).
                    </li>
                    <li>
                      <strong>4. Paper size:</strong> <strong>{widthMm}mm × {heightMm}mm</strong> (Roll size) தேர்ந்தெடுக்கவும்.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SAVE / UPDATE TEMPLATE MODAL                                             */}
      {/* ========================================================================= */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Save size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Save Label Template</h3>
                  <p className="text-xs text-gray-500">Save layout for future one-click use</p>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vivo X Series Tag / Used Phone Label"
                  value={newTemplateNameInput}
                  onChange={(e) => setNewTemplateNameInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-primary"
                />
              </div>

              {selectedTemplateId && !selectedTemplateId.startsWith('default-') && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveAsNewCheckbox"
                    checked={saveAsNew}
                    onChange={(e) => setSaveAsNew(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="saveAsNewCheckbox" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Save as a brand new template (don't overwrite "{templateName}")
                  </label>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 space-y-1">
                <p className="font-bold">What will be saved:</p>
                <p>• Store badge: <strong>{shopTitle}</strong></p>
                <p>• Dimensions: <strong>{widthMm}mm × {heightMm}mm</strong></p>
                <p>• All <strong>{fields.length}</strong> custom fields & half-width arrangements</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                  className="rounded-xl text-xs py-2 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingTemplate}
                  className="rounded-xl text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  {savingTemplate ? 'Saving...' : <><Save size={14} /> Save Template</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THERMAL PRINTER GUIDE MODAL                                              */}
      {/* ========================================================================= */}
      {showPrintTips && (
        <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Printer size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Thermal Label Printer Guide</h3>
                  <p className="text-xs text-gray-500">How to get perfect sticker prints</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintTips(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900 mb-1">1. Printer Setup (USB / Bluetooth):</p>
                <p>Ensure your mini label printer is turned on with the correct thermal sticker roll loaded (e.g. 50mm × 40mm).</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900 mb-1">2. Browser Print Dialog Settings:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li><strong>Destination:</strong> Select your Thermal Label Printer.</li>
                  <li><strong>Paper Size:</strong> Choose <strong>50mm x 40mm</strong> (or match your selected roll size).</li>
                  <li><strong>Margins:</strong> Set to <strong>None</strong>.</li>
                  <li><strong>Headers & Footers:</strong> <strong>Uncheck</strong> / Disable.</li>
                  <li><strong>Scale:</strong> Set to <strong>100%</strong> (or "Fit to printable area").</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                <p className="font-bold">✓ Direct Compatibility:</p>
                <p className="mt-0.5">Tested for Niimbot, Phomemo, Zebra, TSC, Xprinter, Gprinter and portable 58mm / 80mm Bluetooth printers.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowPrintTips(false)}
                className="rounded-xl text-xs py-2 px-5"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelPrintingPage;
