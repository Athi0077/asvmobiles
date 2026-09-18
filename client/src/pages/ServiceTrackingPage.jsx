import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicTrackingDetails } from '../services/serviceTrackingService';
import { CheckCircle2, Circle, Smartphone, Monitor, Tablet, Wrench, Clock, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ServiceTrackingPage = () => {
  const { trackingToken } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const data = await getPublicTrackingDetails(trackingToken);
        setService(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (trackingToken) {
      fetchService();
    }
  }, [trackingToken]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Info size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 text-center">Service Not Found</h1>
        <p className="text-gray-500 text-center max-w-md mb-8">
          {error === 'Service not found' ? 'The service link may be invalid or expired.' : error}
        </p>
        <Link to="/" className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/90 transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Mobile': return <Smartphone size={24} className="text-primary" />;
      case 'Laptop': return <Monitor size={24} className="text-primary" />;
      case 'Tablet': return <Tablet size={24} className="text-primary" />;
      default: return <Wrench size={24} className="text-primary" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50';
      case 'Work Started': return 'text-blue-600 bg-blue-50';
      case 'Almost Ready': return 'text-orange-600 bg-orange-50';
      case 'Finished': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const statuses = ['Pending', 'Work Started', 'Almost Ready', 'Finished'];
  const currentStatusIndex = statuses.indexOf(service.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-4">
      <Helmet>
        <title>Track Service - {service.serviceId} | ASV Mobiles Store</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
            <Wrench size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">SERVICE TRACKING</h1>
          <p className="text-gray-500 font-medium">Track your repair progress in real-time</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

          {/* Header */}
          <div className="bg-gray-900 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Service ID</p>
              <h2 className="text-3xl font-black font-mono">{service.serviceId}</h2>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${getStatusColor(service.status)}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></div>
              {service.status}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Details */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-bold text-gray-900 text-lg">{service.customerName}</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    {getDeviceIcon(service.deviceType)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Device</p>
                    <p className="font-bold text-gray-900">{service.deviceBrand} {service.deviceModel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Service Required</p>
                  <p className="font-bold text-gray-900">{service.serviceName}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Estimated Amount</p>
                  <p className="text-2xl font-black text-primary">₹{service.amount}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-6">Service Progress</p>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
                  {statuses.map((status, index) => {
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isFuture = index > currentStatusIndex;

                    const historyRecord = service.statusHistory?.find(h => h.status === status);
                    const timeString = historyRecord
                      ? new Date(historyRecord.updatedAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })
                      : 'Pending';

                    return (
                      <div key={status} className={`relative flex items-start gap-4 ${isFuture ? 'opacity-40' : ''}`}>
                        <div className="relative z-10 shrink-0 bg-gray-50 pt-1">
                          {isCompleted ? (
                            <CheckCircle2 size={24} className="text-primary fill-primary/10" />
                          ) : isCurrent ? (
                            <div className="w-6 h-6 rounded-full border-4 border-primary bg-white shadow-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            </div>
                          ) : (
                            <Circle size={24} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className={`font-bold text-sm ${isCurrent ? 'text-primary' : 'text-gray-900'}`}>{status}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            {!isFuture && <Clock size={12} />}
                            {timeString}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {service.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 mb-8">
                <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Info size={14} /> Notes from technician
                </p>
                <p className="text-yellow-800 text-sm font-medium leading-relaxed">{service.notes}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <p>Last Updated: {new Date(service.updatedAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</p>
              <p>Please contact us if you have any questions.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceTrackingPage;
