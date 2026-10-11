import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Check, 
  Receipt, 
  Smartphone, 
  FileText,
  MessageCircle,
  Copy
} from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

const InvoiceReceiptModal = ({ bill, onClose }) => {
  const [printFormat, setPrintFormat] = useState('thermal'); // 'thermal' | 'a4'
  const [phoneForWhatsApp, setPhoneForWhatsApp] = useState(bill?.customerPhone || '');
  const [copied, setCopied] = useState(false);

  if (!bill) return null;

  const billDate = new Date(bill.createdAt || Date.now());
  const formattedDate = billDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = billDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppMessage = () => {
    const itemsText = (bill.items || [])
      .map((item, idx) => `${idx + 1}. ${item.name} x${item.qty} = ₹${(item.total || 0).toFixed(2)}`)
      .join('\n');

    return (
      `*ASV MOBILES & ACCESSORIES*\n` +
      `🧾 Invoice: *${bill.billNumber}*\n` +
      `📅 Date: ${formattedDate} ${formattedTime}\n` +
      `👤 Customer: ${bill.customerName || 'Customer'}\n\n` +
      `*Items:*\n${itemsText}\n\n` +
      `Subtotal: ₹${(bill.subtotal || 0).toFixed(2)}\n` +
      (bill.discount > 0 ? `Discount: -₹${(bill.discount || 0).toFixed(2)}\n` : '') +
      `*Total Amount: ₹${(bill.grandTotal || 0).toFixed(2)}*\n` +
      `Payment Mode: ${bill.paymentMode || 'Cash'}\n\n` +
      `Thank you for shopping at ASV Mobiles! Visit again.`
    );
  };

  const handleWhatsAppShare = () => {
    const rawPhone = (phoneForWhatsApp || '').replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return toast.error('Please enter a valid 10-digit mobile number for WhatsApp');
    }

    const message = encodeURIComponent(getWhatsAppMessage());
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyBillText = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    toast.success('Bill summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: ${printFormat === 'thermal' ? '80mm auto' : 'A4 portrait'};
            margin: ${printFormat === 'thermal' ? '0mm' : '8mm'};
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-container, #printable-invoice-container * {
            visibility: visible !important;
          }
          #printable-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${printFormat === 'thermal' ? '78mm' : '100%'} !important;
            max-width: ${printFormat === 'thermal' ? '78mm' : '100%'} !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 auto !important;
          }
          .thermal-slip {
            border: none !important;
            box-shadow: none !important;
            padding: 2mm !important;
            max-width: 78mm !important;
            width: 78mm !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                Invoice {bill.billNumber}
              </h3>
              <p className="text-[11px] text-gray-500">Preview & Print Counter Receipt</p>
            </div>
          </div>

          {/* Format Toggle Buttons */}
          <div className="flex items-center gap-1.5 bg-gray-200/70 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                printFormat === 'thermal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone size={13} /> Thermal (80mm)
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                printFormat === 'a4'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={13} /> A4 Tax Invoice
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100/60 flex justify-center">
          <div id="printable-invoice-container" className="w-full flex justify-center">
            {/* ========================================================= */}
            {/* 1. THERMAL RECEIPT FORMAT (80mm / 3 inch Slip) */}
            {/* ========================================================= */}
            {printFormat === 'thermal' && (
              <div className="thermal-slip bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-[340px] text-gray-900 font-mono text-xs space-y-4">
                {/* Shop Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black tracking-tight uppercase">ASV MOBILES</h2>
                  <p className="text-[11px] text-gray-600 leading-tight">Sales, Accessories & Fast Service</p>
                  <p className="text-[10px] text-gray-500">Ph: +91 98765 43210</p>
                  <div className="border-b border-dashed border-gray-400 my-2"></div>
                  <p className="text-[11px] font-bold">RETAIL INVOICE</p>
                </div>

                {/* Bill Meta */}
                <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill No:</span>
                    <span className="font-bold">{bill.billNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{formattedDate} {formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-bold truncate max-w-[160px]">{bill.customerName || 'Walk-in'}</span>
                  </div>
                  {bill.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span>{bill.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cashier:</span>
                    <span>{bill.billedByName || 'Cashier'}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 border-b border-dashed border-gray-400 pb-3">
                  <div className="flex justify-between font-bold text-[11px] border-b border-gray-200 pb-1">
                    <span className="w-1/2">Item</span>
                    <span className="w-1/4 text-center">Qty</span>
                    <span className="w-1/4 text-right">Amt</span>
                  </div>

                  {(bill.items || []).map((item, i) => (
                    <div key={i} className="text-[11px]">
                      <div className="font-bold leading-tight">{item.name}</div>
                      <div className="flex justify-between text-gray-600 text-[10px]">
                        <span>₹{(item.price || 0).toFixed(2)}</span>
                        <span>x {item.qty}</span>
                        <span className="font-bold text-gray-900">₹{(item.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{(bill.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {bill.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{(bill.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-400 my-1"></div>
                  <div className="flex justify-between text-sm font-black text-gray-950">
                    <span>NET AMOUNT:</span>
                    <span>₹{(bill.grandTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 pt-1">
                    <span>Payment Mode:</span>
                    <span className="font-bold uppercase">{bill.paymentMode || 'Cash'}</span>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="text-center text-[10px] text-gray-500 pt-3 border-t border-dashed border-gray-300 space-y-1">
                  <p className="font-bold text-gray-700">Thank you! Visit again.</p>
                  <p>Exchange within 7 days with bill.</p>
                  <p>No warranty for physical / water damage.</p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. STANDARD A4 / A5 TAX INVOICE FORMAT */}
            {/* ========================================================= */}
            {printFormat === 'a4' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-xl text-gray-900 text-sm space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-5">
                  <div>
                    <h2 className="text-2xl font-black text-primary tracking-tight">ASV MOBILES</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Mobiles, Gadgets & Premium Services</p>
                    <p className="text-xs text-gray-600 mt-1">Main Road, ASV Center</p>
                    <p className="text-xs text-gray-600">Phone: +91 98765 43210</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      Tax Invoice
                    </span>
                    <p className="text-sm font-black font-mono text-gray-900 mt-2">{bill.billNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formattedDate} {formattedTime}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold uppercase block mb-1">Billed To:</span>
                    <p className="font-bold text-gray-900 text-sm">{bill.customerName || 'Walk-in Customer'}</p>
                    {bill.customerPhone && (
                      <p className="text-gray-600 mt-0.5 font-mono">Mobile: {bill.customerPhone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-bold uppercase block mb-1">Payment Details:</span>
                    <p className="font-bold text-gray-900">Mode: {bill.paymentMode || 'Cash'}</p>
                    <p className="text-emerald-700 font-semibold mt-0.5">Status: {bill.paymentStatus || 'Paid'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-gray-600 font-bold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(bill.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-gray-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">₹{(item.price || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-900">{item.qty}</td>
                        <td className="py-2.5 px-3 text-right font-black text-gray-900">₹{(item.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary & Totals */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-bold">₹{(bill.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {bill.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount:</span>
                        <span>-₹{(bill.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-base font-black text-gray-950">
                      <span>Grand Total:</span>
                      <span className="text-primary text-lg">₹{(bill.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer & Signature */}
                <div className="border-t border-gray-200 pt-6 flex justify-between items-end text-xs text-gray-500">
                  <div className="max-w-xs space-y-1">
                    <p className="font-bold text-gray-700">Terms & Conditions:</p>
                    <p>1. Warranty claims subject to brand service policies.</p>
                    <p>2. Physical or water damaged products void warranty.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-gray-400 mb-1"></div>
                    <span className="text-[11px] text-gray-400">Authorized Signature</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          {/* WhatsApp Quick Share Input */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="tel"
                placeholder="Mobile for WhatsApp"
                value={phoneForWhatsApp}
                onChange={(e) => setPhoneForWhatsApp(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-8 pr-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Share via WhatsApp"
            >
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button
              onClick={handleCopyBillText}
              className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors"
              title="Copy Summary"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              className="rounded-xl text-xs sm:text-sm py-2 px-4"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="rounded-xl text-xs sm:text-sm py-2 px-5 flex items-center gap-2 shadow-sm"
              onClick={handlePrint}
            >
              <Printer size={16} /> Print {printFormat === 'thermal' ? 'Slip (80mm)' : 'Invoice (A4)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReceiptModal;
