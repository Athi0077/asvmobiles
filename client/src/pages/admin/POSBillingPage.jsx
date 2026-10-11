import React, { useState, useEffect, useRef } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  CheckCircle, 
  CreditCard, 
  Banknote, 
  QrCode, 
  RefreshCw, 
  X, 
  ShoppingCart, 
  Clock, 
  Printer, 
  AlertCircle,
  Package,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/getImageUrl';
import { searchBillingProducts, createBill, getBills } from '../../services/billingService';
import InvoiceReceiptModal from '../../components/InvoiceReceiptModal';

const POSBillingPage = () => {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'

  // POS State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Custom Item Modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);

  // Success & Print Modals
  const [completedBill, setCompletedBill] = useState(null);
  const [billToPrint, setBillToPrint] = useState(null);

  // History State
  const [billsList, setBillsList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyKeyword, setHistoryKeyword] = useState('');
  const [historyPaymentMode, setHistoryPaymentMode] = useState('All');
  const [historyDate, setHistoryDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [todaySummary, setTodaySummary] = useState({ totalRevenue: 0, totalBills: 0, cashTotal: 0, upiTotal: 0 });

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const searchDebounceRef = useRef(null);

  // Debounced product search
  useEffect(() => {
    if (activeTab !== 'pos') return;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchBillingProducts(searchQuery);
        setSearchResults(results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, activeTab]);

  // Fetch bills when history tab is opened
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, historyPage, historyKeyword, historyPaymentMode, historyDate]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getBills({
        page: historyPage,
        keyword: historyKeyword,
        paymentMode: historyPaymentMode,
        date: historyDate,
      });
      setBillsList(data.bills || []);
      setHistoryPages(data.pages || 1);
      if (data.todaySummary) {
        setTodaySummary(data.todaySummary);
      }
    } catch (error) {
      toast.error('Failed to load billing history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Add product from search to cart
  const handleAddToCart = (product) => {
    const existingIndex = cartItems.findIndex(item => item.product === product._id);
    const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].qty += 1;
      updated[existingIndex].total = updated[existingIndex].qty * updated[existingIndex].price;
      setCartItems(updated);
      toast.success(`Increased ${product.name} quantity to ${updated[existingIndex].qty}`);
    } else {
      setCartItems(prev => [
        ...prev,
        {
          product: product._id,
          name: product.name,
          price: unitPrice,
          qty: 1,
          total: unitPrice,
          stock: product.stock,
          image: product.images?.[0] || '',
          isActive: product.isActive
        }
      ]);
      toast.success(`Added ${product.name} to bill`);
    }
  };

  // Add custom non-inventory / service charge item
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItemName.trim()) return toast.error('Enter item description');
    const price = Number(customItemPrice);
    if (isNaN(price) || price < 0) return toast.error('Enter valid price');

    const qty = Number(customItemQty) || 1;
    setCartItems(prev => [
      ...prev,
      {
        product: null,
        name: customItemName.trim(),
        price,
        qty,
        total: price * qty,
        stock: null,
        isCustom: true
      }
    ]);

    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty(1);
    setShowCustomModal(false);
    toast.success('Custom charge added to bill');
  };

  // Cart quantity & price updates
  const updateQty = (index, delta) => {
    setCartItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].qty + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].qty = newQty;
      updated[index].total = newQty * updated[index].price;
      return updated;
    });
  };

  const updatePrice = (index, newPrice) => {
    const p = Math.max(0, Number(newPrice) || 0);
    setCartItems(prev => {
      const updated = [...prev];
      updated[index].price = p;
      updated[index].total = p * updated[index].qty;
      return updated;
    });
  };

  const removeItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.total || 0), 0);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const tenderedAmount = Number(cashTendered) || 0;
  const changeToReturn = tenderedAmount >= grandTotal ? tenderedAmount - grandTotal : 0;

  // Submit Bill
  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      return toast.error('Bill is empty. Please add items first.');
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim(),
        items: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
        discount: discountAmount,
        paymentMode,
        notes: notes.trim(),
      };

      const res = await createBill(payload);
      if (res.success && res.bill) {
        toast.success(`Bill ${res.bill.billNumber} created successfully!`);
        setCompletedBill(res.bill);
        // Clear active form
        setCartItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount(0);
        setCashTendered('');
        setNotes('');
        setSearchQuery('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold">
            <Receipt size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              POS Billing Counter
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Auto Stock Deduct ON
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Instant counter sales, barcode/name search, auto-deduct inventory, and printable invoices.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-gray-100 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={16} /> New Bill
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={16} /> Bills History
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: POS COUNTER */}
      {/* ============================================================== */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Search & Cart Items (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Search size={18} className="text-primary" /> Instant Product Search
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> Add Service / Custom Charge
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Type product name, model, brand, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl py-3.5 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Search Suggestions Dropdown / Grid */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/50">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-400">Searching inventory...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No matching products found. You can add a custom item above.
                  </div>
                ) : (
                  searchResults.map(prod => (
                    <div
                      key={prod._id}
                      onClick={() => handleAddToCart(prod)}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-white cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(prod.images?.[0])}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="font-semibold text-gray-700">₹{(prod.discountPrice || prod.price).toFixed(2)}</span>
                            <span>•</span>
                            <span className={prod.stock > 5 ? 'text-emerald-600 font-medium' : prod.stock > 0 ? 'text-amber-600 font-medium' : 'text-red-500 font-medium'}>
                              Stock: {prod.stock}
                            </span>
                            <span>•</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded ${prod.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {prod.isActive ? 'Website' : 'Internal Stock'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary p-2 rounded-xl transition-all flex-shrink-0"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Items Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-primary" />
                  Bill Items ({cartItems.length})
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <Package size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-600">No items added to bill yet</p>
                  <p className="text-xs text-gray-400">Search products above or add custom repair charge.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 bg-gray-50/50">
                        <th className="py-3 px-4">Item Details</th>
                        <th className="py-3 px-3 text-center">Unit Price (₹)</th>
                        <th className="py-3 px-3 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Total (₹)</th>
                        <th className="py-3 px-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {cartItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                            {item.isCustom ? (
                              <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
                                Custom Service / Repair
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500 block mt-0.5">
                                Current Stock: {item.stock ?? 'N/A'}
                              </span>
                            )}
                          </td>

                          {/* Editable unit price if needed */}
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updatePrice(idx, e.target.value)}
                              className="w-20 bg-gray-50 border border-gray-200 rounded-lg py-1 px-2 text-center font-bold text-gray-900 text-xs outline-none focus:border-primary"
                            />
                          </td>

                          {/* Qty increment / decrement */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => updateQty(idx, -1)}
                                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center font-bold text-sm transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(idx, 1)}
                                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center font-bold text-sm transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-black text-gray-900">
                            ₹{(item.total || 0).toFixed(2)}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Details, Payment & Checkout (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <User size={18} className="text-primary" /> Customer Information
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Phone (Mobile)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Walk-in Customer"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <label className="block text-xs font-bold text-gray-700">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'Cash', icon: Banknote },
                    { mode: 'UPI', icon: QrCode },
                    { mode: 'Card', icon: CreditCard },
                  ].map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                        paymentMode === mode
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} className="mb-1" />
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Calculator if mode is Cash */}
              {paymentMode === 'Cash' && grandTotal > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Cash Received from Customer:</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-900 outline-none"
                    />
                  </div>
                  {tenderedAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold pt-1">
                      <span className="text-amber-800">Change to Return:</span>
                      <span className={`text-sm ${changeToReturn >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        ₹{changeToReturn.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500 text-xs font-medium">Instant Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-24 bg-gray-50 border border-gray-200 rounded-xl py-1 px-2.5 text-right font-bold text-sm text-gray-900 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span className="text-lg">Grand Total</span>
                  <span className="text-2xl font-black text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Warranty / bill remarks (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Complete Bill CTA */}
              <Button
                onClick={handleGenerateBill}
                isLoading={submitting}
                disabled={cartItems.length === 0}
                className="w-full py-4 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> Complete Bill & Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BILLS HISTORY & DAY BOOK */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Today Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</span>
              <p className="text-2xl font-black text-primary mt-1">₹{(todaySummary?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Bills</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{todaySummary?.totalBills || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cash Collection</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹{(todaySummary?.cashTotal || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">UPI Collection</span>
              <p className="text-2xl font-black text-blue-600 mt-1">₹{(todaySummary?.upiTotal || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row gap-3 items-center justify-between">
              {/* Search bar */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by Bill No or Mobile..."
                  value={historyKeyword}
                  onChange={(e) => { setHistoryKeyword(e.target.value); setHistoryPage(1); }}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Date Presets, Date Picker & Payment Mode */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                {/* Date Quick Presets */}
                <div className="flex items-center p-0.5 bg-gray-200/60 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => { setHistoryDate(''); setHistoryPage(1); }}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      !historyDate ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setHistoryDate(getTodayDateString()); setHistoryPage(1); }}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      historyDate === getTodayDateString() ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => { setHistoryDate(getYesterdayDateString()); setHistoryPage(1); }}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      historyDate === getYesterdayDateString() ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yesterday
                  </button>
                </div>

                {/* Specific Date Picker Input */}
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus-within:border-primary transition-all shadow-sm">
                  <Calendar size={14} className="text-primary flex-shrink-0" />
                  <input
                    type="date"
                    value={historyDate}
                    onChange={(e) => {
                      setHistoryDate(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="text-xs text-gray-700 outline-none bg-transparent font-medium cursor-pointer"
                    title="Select specific date"
                  />
                  {historyDate && (
                    <button
                      onClick={() => {
                        setHistoryDate('');
                        setHistoryPage(1);
                      }}
                      className="text-gray-400 hover:text-red-500 p-0.5"
                      title="Clear date filter"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Payment Mode Selector */}
                <select
                  value={historyPaymentMode}
                  onChange={(e) => { setHistoryPaymentMode(e.target.value); setHistoryPage(1); }}
                  className="bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 outline-none shadow-sm cursor-pointer"
                >
                  <option value="All">All Payment Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>

                {/* Refresh */}
                <button
                  onClick={fetchHistory}
                  className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors shadow-sm"
                  title="Refresh bills"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Active Date Filter Notice Pill if filtered */}
            {historyDate && (
              <div className="px-5 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between text-xs">
                <span className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" />
                  Filtered by Date: <strong className="text-primary font-bold">{new Date(historyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </span>
                <button
                  onClick={() => { setHistoryDate(''); setHistoryPage(1); }}
                  className="text-primary hover:text-primary-dark font-bold underline text-xs"
                >
                  Reset to All Dates
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 bg-white">
                    <th className="py-3.5 px-6">Bill Number</th>
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Payment Mode</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {historyLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : billsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Receipt size={36} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-medium">No bills found</p>
                      </td>
                    </tr>
                  ) : (
                    billsList.map((bill) => (
                      <tr key={bill._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-primary block">
                            {bill.billNumber}
                          </span>
                          {bill.serviceId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                              Repair: {bill.serviceId}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">
                          {new Date(bill.createdAt).toLocaleDateString()} {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-900">{bill.customerName}</p>
                          {bill.customerPhone && (
                            <p className="text-xs text-gray-500 font-mono">{bill.customerPhone}</p>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600">
                          <div>{bill.items?.length || 0} item(s)</div>
                          {bill.billType === 'Service' && bill.items?.[0] && (
                            <div className="text-[11px] text-gray-400 truncate max-w-[160px]" title={bill.items[0].name}>
                              {bill.items[0].name}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            bill.paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-800' :
                            bill.paymentMode === 'UPI' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {bill.paymentMode}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-gray-900">
                          ₹{bill.grandTotal?.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setBillToPrint(bill)}
                            className="p-2 bg-gray-100 hover:bg-primary hover:text-white rounded-xl text-gray-700 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                            title="View & Print Bill"
                          >
                            <Printer size={14} /> Print
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD CUSTOM ITEM / REPAIR CHARGE */}
      {/* ============================================================== */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-primary" /> Add Custom Service / Item
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item / Service Description</label>
                <input
                  type="text"
                  placeholder="e.g. Tempered Glass Fixing, Screen Service"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCustomModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-6">
                  Add to Bill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: BILL SUCCESS SUMMARY */}
      {/* ============================================================== */}
      {completedBill && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                {completedBill.billNumber}
              </span>
              <h3 className="text-2xl font-black text-gray-900 mt-2">Bill Created Successfully!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Stock automatically deducted from inventory.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 border border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Customer:</span>
                <span className="font-bold text-gray-900">{completedBill.customerName}</span>
              </div>
              {completedBill.customerPhone && (
                <div className="flex justify-between text-gray-600">
                  <span>Phone:</span>
                  <span className="font-mono text-gray-900">{completedBill.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Payment Mode:</span>
                <span className="font-bold text-gray-900">{completedBill.paymentMode}</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2 font-bold text-sm text-gray-900">
                <span>Total Paid:</span>
                <span className="text-primary text-base font-black">₹{completedBill.grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setCompletedBill(null)}
              >
                + Next Bill
              </Button>
              <Button
                className="flex-1 rounded-xl flex items-center justify-center gap-2"
                onClick={() => {
                  const b = completedBill;
                  setCompletedBill(null);
                  setBillToPrint(b);
                }}
              >
                <Printer size={16} /> Print / Share Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: INVOICE PRINT (THERMAL 80MM / A4) & WHATSAPP SHARE */}
      {/* ============================================================== */}
      {billToPrint && (
        <InvoiceReceiptModal
          bill={billToPrint}
          onClose={() => setBillToPrint(null)}
        />
      )}
    </div>
  );
};

export default POSBillingPage;
