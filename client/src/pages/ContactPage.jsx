import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, MapPin, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Custom SVG components to avoid lucide-react version compatibility issues for brand icons
const Facebook = ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Instagram = ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const WhatsApp = ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;

const ContactPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    
    // Basic Indian phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, '').replace('+91', ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call for now (ready for future backend integration)
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ name: '', phone: '', service: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Contact Us | ASV Mobiles</title>
        <meta name="description" content="Contact ASV Mobiles for your mobile and laptop service needs. Find our Salem location, call us, or send an enquiry." />
      </Helmet>

      {/* 1. CONTACT HERO */}
      <section className="bg-gray-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">Contact ASV Mobiles</h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto">
            We're here to help with your mobile and laptop service needs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-16">
        
        {/* 2. CONTACT INFORMATION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Phone Card */}
          <a href="tel:+918838467165" className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
            <p className="text-sm text-gray-500 font-medium">+91 88384 67165</p>
            <p className="text-sm text-gray-500 font-medium">96299 08710</p>
          </a>

          {/* Address Card */}
          <a href="https://maps.google.com/?q=11.6625452,78.1485094" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
            <p className="text-sm text-gray-500 font-medium">No. 22, Dr. Subbarayan Road,<br />Salem - 636 001.</p>
          </a>

          {/* Instagram Card */}
          <a href="https://instagram.com/ASV_mobiles_" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <Instagram size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Instagram</h3>
            <p className="text-sm text-gray-500 font-medium">@ASV_mobiles_</p>
          </a>

          {/* Facebook Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 group cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Facebook size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Facebook</h3>
            <p className="text-sm text-gray-500 font-medium">ASV Mobiles</p>
          </div>
        </div>

        {/* 3. QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <a href="tel:+918838467165" className="flex items-center px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm text-sm">
            <Phone size={16} className="mr-2" /> Call Now
          </a>
          <a href="https://wa.me/918838467165?text=Hello%20ASV%20Mobiles,%20I%20would%20like%20to%20enquire%20about%20a%20service." target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-2.5 bg-green-500 text-white font-medium rounded-full hover:bg-green-600 transition-colors shadow-sm text-sm">
            <WhatsApp size={16} className="mr-2" /> WhatsApp
          </a>
          <a href="https://maps.google.com/?q=11.6625452,78.1485094" target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors shadow-sm text-sm">
            <MapPin size={16} className="mr-2" /> Get Directions
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 4. CONTACT FORM */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Send Enquiry</h2>
            </div>

            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
                <CheckCircle size={20} className="mr-3 flex-shrink-0" />
                <p className="font-medium text-sm">Thank you! Your enquiry has been received. We will contact you shortly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name" 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} outline-none focus:ring-4 transition-all bg-gray-50`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500 font-medium flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210" 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} outline-none focus:ring-4 transition-all bg-gray-50`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-bold text-gray-700 mb-1.5">Service Required</label>
                <select 
                  id="service" 
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.service ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} outline-none focus:ring-4 transition-all bg-gray-50 appearance-none`}
                >
                  <option value="" disabled>Select a service</option>
                  <option value="Display Replacement">Display Replacement</option>
                  <option value="Charging Issue">Charging Issue</option>
                  <option value="Touch Issue">Touch Issue</option>
                  <option value="Network Issue">Network Issue</option>
                  <option value="Software Service">Software Service</option>
                  <option value="Laptop Service">Laptop Service</option>
                  <option value="Other">Other</option>
                </select>
                {errors.service && <p className="mt-1 text-xs text-red-500 font-medium flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.service}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message}
                  onChange={handleChange}
                  rows="4" 
                  placeholder="Describe your device issue..." 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} outline-none focus:ring-4 transition-all bg-gray-50 resize-none`}
                ></textarea>
                {errors.message && <p className="mt-1 text-xs text-red-500 font-medium flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center">Sending...</span>
                ) : (
                  <>
                    <Send size={18} className="mr-2" /> Send Enquiry
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 5. MAP SECTION */}
          <div className="flex flex-col">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 h-full flex flex-col">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                <MapPin size={24} className="text-primary mr-3" /> Find Us
              </h2>
              <div className="w-full flex-grow min-h-[350px] bg-gray-200 rounded-2xl overflow-hidden border border-gray-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1952.1287413647167!2d78.14786558231542!3d11.662545197825002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDM5JzQ1LjIiTiA3OMKwMDgnNTQuNiJF!5e0!3m2!1sen!2sin!4v1715694292176!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ASV Mobiles Location Map"
                ></iframe>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
