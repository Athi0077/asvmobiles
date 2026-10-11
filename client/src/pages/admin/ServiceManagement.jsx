import React, { useEffect, useState } from 'react';
import { 
  createServiceRecord, 
  getAdminServices, 
  updateServiceRecord, 
  updateServiceStatus, 
  deleteServiceRecord 
} from '../../services/serviceTrackingService';
import { 
  Plus, Edit, Trash2, Settings as Wrench, X, Search, Filter, Copy, MessageCircle, Eye,
  Receipt, CheckCircle2, CreditCard, Banknote, QrCode, Printer, Loader2
} from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import toast from 'react-hot-toast';
import { createBill, getBillById, getBills } from '../../services/billingService';
import InvoiceReceiptModal from '../../components/InvoiceReceiptModal';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  // Billing States
  const [billModalService, setBillModalService] = useState(null);
  const [billForm, setBillForm] = useState({
    description: '',
    amount: '',
    discount: '',
    paymentMode: 'Cash',
    notes: ''
  });
  const [billSubmitting, setBillSubmitting] = useState(false);
  const [billToPrint, setBillToPrint] = useState(null);
  const [billLoadingId, setBillLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceType: 'Mobile',
    deviceBrand: '',
    deviceModel: '',
    serviceName: '',
    amount: '',
    notes: ''
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAdminServices();
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setIsEdit(false);
    setFormData({
      customerName: '',
      customerPhone: '',
      deviceType: 'Mobile',
      deviceBrand: '',
      deviceModel: '',
      serviceName: '',
      amount: '',
      notes: ''
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (service) => {
    setIsEdit(true);
    setCurrentService(service);
    setFormData({
      customerName: service.customerName,
      customerPhone: service.customerPhone,
      deviceType: service.deviceType,
      deviceBrand: service.deviceBrand || '',
      deviceModel: service.deviceModel || '',
      serviceName: service.serviceName,
      amount: service.amount,
      notes: service.notes || ''
    });
    setIsFormModalOpen(true);
  };

  const openViewModal = (service) => {
    setCurrentService(service);
    setIsViewModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateServiceRecord(currentService._id, formData);
        toast.success('Service updated successfully');
      } else {
        await createServiceRecord(formData);
        toast.success('Service created successfully');
      }
      setIsFormModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteServiceRecord(id);
      toast.success('Service deleted successfully');
      setDeleteConfirm(null);
      if (isViewModalOpen) setIsViewModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error('Error deleting service');
      setDeleteConfirm(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateServiceStatus(id, newStatus);
      toast.success('Status updated');
      fetchServices();
      
      // Update local state for view modal if it's open
      if (isViewModalOpen && currentService && currentService._id === id) {
        setCurrentService(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getTrackingUrl = (token) => {
    return `${window.location.origin}/service/${token}`;
  };

  const copyToClipboard = (token) => {
    const url = getTrackingUrl(token);
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Tracking link copied!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const shareOnWhatsApp = (service) => {
    const url = getTrackingUrl(service.trackingToken);
    const message = `Hello ${service.customerName},\n\nYour service tracking details are available here:\n${url}\n\nService ID: ${service.serviceId}\nDevice: ${service.deviceBrand} ${service.deviceModel}\nService: ${service.serviceName}\n\nYou can use this link to check the latest service status.\n\nThank you.`;
    
    // Ensure phone number starts with country code, basic assumption for India (+91) if 10 digits
    let phone = service.customerPhone;
    if (phone.length === 10) phone = `91${phone}`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Open Service Bill creation modal
  const handleOpenBillModal = (service) => {
    setBillModalService(service);
    const brand = service.deviceBrand ? service.deviceBrand.trim() + ' ' : '';
    const model = service.deviceModel ? service.deviceModel.trim() : '';
    const dev = (brand + model).trim();
    const defaultDesc = `Service: ${dev ? dev + ' - ' : ''}${service.serviceName} (${service.serviceId})`;

    setBillForm({
      description: defaultDesc,
      amount: service.amount !== undefined ? String(service.amount) : '',
      discount: '',
      paymentMode: 'Cash',
      notes: service.notes || ''
    });
  };

  // View or re-print already generated bill
  const handleViewOrPrintBill = async (service) => {
    try {
      setBillLoadingId(service._id);
      let bill = null;
      if (service.billId) {
        bill = await getBillById(service.billId);
      }
      if (!bill && service.billNumber) {
        const res = await getBills({ keyword: service.billNumber, limit: 1 });
        bill = res.bills?.find(b => b.billNumber === service.billNumber);
      }
      if (bill) {
        setBillToPrint(bill);
      } else {
        toast.error('Bill details not found');
      }
    } catch (err) {
      toast.error('Failed to load bill');
    } finally {
      setBillLoadingId(null);
    }
  };

  // Handle bill creation submit
  const handleGenerateServiceBill = async (e) => {
    e.preventDefault();
    if (!billModalService) return;

    const price = Number(billForm.amount);
    const discountVal = Number(billForm.discount) || 0;

    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid service amount');
      return;
    }

    setBillSubmitting(true);
    try {
      const billPayload = {
        customerName: billModalService.customerName,
        customerPhone: billModalService.customerPhone,
        items: [
          {
            product: null,
            name: billForm.description.trim() || `Service Repair - ${billModalService.serviceId}`,
            price: price,
            qty: 1,
            total: price
          }
        ],
        discount: discountVal,
        tax: 0,
        paymentMode: billForm.paymentMode,
        paymentStatus: 'Paid',
        notes: billForm.notes || '',
        serviceRecordId: billModalService._id,
        serviceId: billModalService.serviceId,
        billType: 'Service'
      };

      const res = await createBill(billPayload);
      toast.success(`Bill ${res.bill?.billNumber || ''} created & saved to history!`);
      
      const createdBill = res.bill;
      setBillModalService(null);
      await fetchServices();

      // Immediately open print receipt modal
      if (createdBill) {
        setBillToPrint(createdBill);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setBillSubmitting(false);
    }
  };

  // Derived state for filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.customerPhone.includes(searchTerm) ||
      service.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'All' || service.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Summary stats
  const total = services.length;
  const pending = services.filter(s => s.status === 'Pending').length;
  const workStarted = services.filter(s => s.status === 'Work Started').length;
  const almostReady = services.filter(s => s.status === 'Almost Ready').length;
  const finished = services.filter(s => s.status === 'Finished').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Work Started': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Almost Ready': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Finished': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Service Management</h1>
          <p className="text-gray-500 mt-1">Track and manage repair services.</p>
        </div>
        <Button onClick={openCreateModal} className="rounded-xl flex items-center gap-2">
          <Plus size={20} /> Add New Service
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-black">{total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-yellow-600 mb-1">Pending</p>
          <p className="text-2xl font-black text-yellow-700">{pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-blue-600 mb-1">Working</p>
          <p className="text-2xl font-black text-blue-700">{workStarted}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-orange-600 mb-1">Almost Ready</p>
          <p className="text-2xl font-black text-orange-700">{almostReady}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-green-600 mb-1">Finished</p>
          <p className="text-2xl font-black text-green-700">{finished}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customer, ID, phone, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-48 py-2 px-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Work Started">Work Started</option>
            <option value="Almost Ready">Almost Ready</option>
            <option value="Finished">Finished</option>
          </select>
        </div>
      </div>

      {/* Services List - Table for Desktop, Cards for Mobile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500 bg-gray-50/50">
                <th className="py-4 px-6 font-medium">Service ID</th>
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Device & Service</th>
                <th className="py-4 px-6 font-medium">Amount</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="py-4 px-6"><div className="h-10 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No service records found.</p>
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => (
                  <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{service.serviceId}</td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-gray-900">{service.customerName}</p>
                      <p className="text-xs text-gray-500">{service.customerPhone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-800">{service.deviceBrand} {service.deviceModel}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{service.serviceName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-gray-900">₹{service.amount}</div>
                      {service.isBilled ? (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> {service.billNumber || 'Billed'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block text-[10px] text-gray-400 mt-0.5">Unbilled</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={service.status}
                        onChange={(e) => handleStatusChange(service._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${getStatusColor(service.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Work Started">Work Started</option>
                        <option value="Almost Ready">Almost Ready</option>
                        <option value="Finished">Finished</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {service.isBilled ? (
                          <button 
                            onClick={() => handleViewOrPrintBill(service)} 
                            disabled={billLoadingId === service._id}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                            title={`View/Print Bill (${service.billNumber})`}
                          >
                            {billLoadingId === service._id ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={17} />}
                            <span className="hidden xl:inline text-[11px] font-bold">Print Bill</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenBillModal(service)} 
                            className="p-1.5 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Add to Billing / Generate Invoice"
                          >
                            <Receipt size={17} />
                            <span className="hidden xl:inline text-[11px] font-bold">Add Bill</span>
                          </button>
                        )}
                        <button onClick={() => openViewModal(service)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="View Details">
                          <Eye size={17} />
                        </button>
                        <button onClick={() => copyToClipboard(service.trackingToken)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Copy Tracking Link">
                          <Copy size={17} />
                        </button>
                        <button onClick={() => shareOnWhatsApp(service)} className="p-1.5 text-gray-400 hover:text-green-500 transition-colors" title="Share via WhatsApp">
                          <MessageCircle size={17} />
                        </button>
                        <button onClick={() => openEditModal(service)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                          <Edit size={17} />
                        </button>
                        <button onClick={() => setDeleteConfirm(service._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
             <div className="p-4 animate-pulse"><div className="h-24 bg-gray-100 rounded w-full"></div></div>
          ) : filteredServices.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No records found.</div>
          ) : (
            filteredServices.map(service => (
              <div key={service._id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{service.serviceId}</span>
                    <h3 className="font-bold mt-2 text-gray-900">{service.customerName}</h3>
                    <p className="text-sm text-gray-500">{service.customerPhone}</p>
                  </div>
                  <select 
                    value={service.status}
                    onChange={(e) => handleStatusChange(service._id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1.5 rounded border outline-none ${getStatusColor(service.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Work Started">Work Started</option>
                    <option value="Almost Ready">Almost Ready</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm font-medium">{service.deviceBrand} {service.deviceModel}</p>
                  <p className="text-sm text-gray-500">{service.serviceName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-gray-900">₹{service.amount}</p>
                    {service.isBilled ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} /> {service.billNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Unbilled</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openViewModal(service)} className="text-xs text-gray-600 flex items-center gap-1"><Eye size={15}/> View</button>
                    {service.isBilled ? (
                      <button 
                        onClick={() => handleViewOrPrintBill(service)} 
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Receipt size={13}/> Print
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOpenBillModal(service)} 
                        className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Receipt size={13}/> Add Bill
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => copyToClipboard(service.trackingToken)} className="text-gray-400 hover:text-blue-500"><Copy size={16} /></button>
                    <button onClick={() => shareOnWhatsApp(service)} className="text-gray-400 hover:text-green-500"><MessageCircle size={16} /></button>
                    <button onClick={() => openEditModal(service)} className="text-gray-400 hover:text-primary"><Edit size={16} /></button>
                    <button onClick={() => setDeleteConfirm(service._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Service Record' : 'Add New Service'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
                  <Input label="Mobile Number" name="customerPhone" type="tel" value={formData.customerPhone} onChange={handleChange} required />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Device Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Device Type</label>
                    <select 
                      name="deviceType" 
                      value={formData.deviceType} 
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    >
                      <option value="Mobile">Mobile</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Input label="Brand" name="deviceBrand" value={formData.deviceBrand} onChange={handleChange} placeholder="e.g. Samsung" />
                  <Input label="Model" name="deviceModel" value={formData.deviceModel} onChange={handleChange} placeholder="e.g. Galaxy S23" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Service Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input label="Service Required" name="serviceName" value={formData.serviceName} onChange={handleChange} placeholder="e.g. Display Replacement" required />
                  <Input label="Estimated Amount (₹)" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Notes (Optional)</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    rows="3"
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Any specific issues or instructions..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">{isEdit ? 'Update Service' : 'Save Service'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && currentService && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  Service Record
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(currentService.status)}`}>
                    {currentService.status}
                  </span>
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{currentService.serviceId}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-bold text-gray-900 text-lg">{currentService.customerName}</p>
                    <p className="text-gray-600">{currentService.customerPhone}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Device</p>
                    <p className="font-bold text-gray-900">{currentService.deviceType} | {currentService.deviceBrand} {currentService.deviceModel}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Service & Amount</p>
                    <p className="font-bold text-gray-900">{currentService.serviceName}</p>
                    <p className="text-lg font-black text-primary mt-1">₹{currentService.amount}</p>
                  </div>

                  {/* Billing status box */}
                  {currentService.isBilled ? (
                    <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Bill Generated</p>
                          <p className="text-sm font-black text-emerald-950 font-mono">{currentService.billNumber}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleViewOrPrintBill(currentService)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs flex items-center gap-1.5 shadow-sm py-1.5 px-3"
                      >
                        <Printer size={13} /> View / Print
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Billing Status</p>
                        <p className="text-xs text-amber-900 font-semibold mt-0.5">Not added to billing</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleOpenBillModal(currentService);
                        }}
                        className="rounded-lg text-xs flex items-center gap-1.5 shadow-sm py-1.5 px-3"
                      >
                        <Receipt size={13} /> Add to Billing
                      </Button>
                    </div>
                  )}

                  {currentService.notes && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Notes</p>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                        {currentService.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline and Actions */}
                <div className="space-y-6">
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Update Status</p>
                    <select 
                      value={currentService.status}
                      onChange={(e) => handleStatusChange(currentService._id, e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg py-2 px-3 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Work Started">Work Started</option>
                      <option value="Almost Ready">Almost Ready</option>
                      <option value="Finished">Finished</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Status History</p>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      {currentService.statusHistory?.slice().reverse().map((history, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border border-gray-100 shadow-sm ml-4 md:ml-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-gray-900 text-sm">{history.status}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(history.updatedAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3">
              <Button onClick={() => copyToClipboard(currentService.trackingToken)} variant="outline" className="flex-1 flex items-center justify-center gap-2 bg-white">
                <Copy size={18} /> <span className="hidden sm:inline">Copy Link</span>
              </Button>
              <Button onClick={() => shareOnWhatsApp(currentService)} variant="outline" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white border-transparent hover:bg-[#128C7E]">
                <MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button onClick={() => {setIsViewModalOpen(false); openEditModal(currentService);}} variant="outline" className="flex-1 flex items-center justify-center gap-2 bg-white">
                <Edit size={18} /> <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button onClick={() => setDeleteConfirm(currentService._id)} variant="outline" className="flex items-center justify-center gap-2 bg-white text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-200 px-4">
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Service</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this service record? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Service Bill Modal */}
      {billModalService && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Receipt size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Generate Service Bill</h3>
                  <p className="text-xs text-gray-500 font-mono">Service ID: {billModalService.serviceId}</p>
                </div>
              </div>
              <button 
                onClick={() => setBillModalService(null)} 
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer & Device quick banner */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/60 p-4 rounded-2xl border border-gray-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer:</span>
                <span className="font-bold text-gray-900">{billModalService.customerName} ({billModalService.customerPhone})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Device:</span>
                <span className="font-semibold text-gray-800">{billModalService.deviceBrand} {billModalService.deviceModel} ({billModalService.deviceType})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Repair Task:</span>
                <span className="font-semibold text-gray-800">{billModalService.serviceName}</span>
              </div>
            </div>

            <form onSubmit={handleGenerateServiceBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Bill Item Description
                </label>
                <input
                  type="text"
                  value={billForm.description}
                  onChange={(e) => setBillForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Service Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={billForm.amount}
                    onChange={(e) => setBillForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={billForm.discount}
                    onChange={(e) => setBillForm(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash', icon: Banknote },
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Card', label: 'Card', icon: CreditCard },
                  ].map(pm => {
                    const Icon = pm.icon;
                    const isSelected = billForm.paymentMode === pm.id;
                    return (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setBillForm(prev => ({ ...prev, paymentMode: pm.id }))}
                        className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes / Warranty Remarks (Optional)
                </label>
                <textarea
                  rows="2"
                  value={billForm.notes}
                  onChange={(e) => setBillForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. 3 Months warranty for replaced screen"
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Net Total Box */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Total Billed Amount</p>
                  <p className="text-[11px] text-emerald-600">Saved directly to Billing History & Day Book</p>
                </div>
                <span className="text-xl font-black text-emerald-700">
                  ₹{Math.max(0, (Number(billForm.amount) || 0) - (Number(billForm.discount) || 0)).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setBillModalService(null)}
                  disabled={billSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  disabled={billSubmitting}
                >
                  {billSubmitting ? (
                    'Creating Bill...'
                  ) : (
                    <>
                      <Receipt size={17} /> Generate & Save Bill
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {billToPrint && (
        <InvoiceReceiptModal
          bill={billToPrint}
          onClose={() => setBillToPrint(null)}
        />
      )}
    </div>
  );
};

export default ServiceManagement;
