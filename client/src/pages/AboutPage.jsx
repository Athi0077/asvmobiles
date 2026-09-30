import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Smartphone, Monitor, Wrench, Settings, Zap, Fingerprint, 
  Wifi, Cpu, MapPin, Phone 
} from 'lucide-react';

const Facebook = ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Instagram = ({size=20}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
import { Link } from 'react-router-dom';

const AboutPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { icon: <Monitor size={24} />, title: "Display Replacement", desc: "Mobile and Laptop Display Replacement" },
    { icon: <Settings size={24} />, title: "Spare Parts", desc: "Original Spare Parts Replacement" },
    { icon: <Zap size={24} />, title: "Charging Error", desc: "Charging Error Repair" },
    { icon: <Smartphone size={24} />, title: "Backlight Errors", desc: "Backlight Errors Repair" },
    { icon: <Fingerprint size={24} />, title: "Touch Not Working", desc: "Touch Repair Services" },
    { icon: <Wifi size={24} />, title: "Network Errors", desc: "Network Errors Repair" },
    { icon: <Cpu size={24} />, title: "All IC Work", desc: "Integrated Circuit (IC) Work" },
    { icon: <Wrench size={24} />, title: "Software Work", desc: "Mobile and PC Software Work" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>About Us | ASV Mobiles</title>
        <meta name="description" content="ASV Mobiles is a trusted Mobile and Laptop Service Center located in Salem. We provide hardware, software, and spare parts replacement services." />
      </Helmet>

      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 text-white overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1597872253142-0a24564c7e48?auto=format&fit=crop&q=80&w=2000" 
            alt="Mobile Repair" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/40"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              About <span className="text-primary">ASV Mobiles</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl">
              ASV Mobiles is a mobile and laptop service center providing repair, replacement, and software services for mobile devices and PCs.
            </p>
          </div>
        </div>
      </section>

      {/* 2. ABOUT BUSINESS SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1000" 
                alt="ASV Mobiles Service Center" 
                className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Your Trusted Mobile & Laptop Service Center
              </h2>
              <div className="w-20 h-1.5 bg-primary rounded-full"></div>
              <p className="text-gray-600 text-lg leading-relaxed">
                At ASV Mobiles, we specialize in delivering high-quality repair and maintenance services for a wide variety of mobile phones and laptops. 
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Whether you are facing hardware issues like broken displays, charging errors, or require intricate IC and software work, our service center is equipped to handle your mobile and PC service needs efficiently. We use original spare parts for replacements to ensure the best performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Our Services</h2>
            <p className="text-gray-500 text-lg">Comprehensive repair and replacement services for your devices.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-8">Why Choose ASV Mobiles?</h2>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Mobile & Laptop Services</h4>
                    <p className="text-gray-400 text-sm">Comprehensive repair coverage for both mobile phones and PCs.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Hardware & Software Support</h4>
                    <p className="text-gray-400 text-sm">Handling physical damages like displays and internal software issues.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Spare Parts Replacement</h4>
                    <p className="text-gray-400 text-sm">Original spare parts replacement strictly adhering to quality standards.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Multiple Repair Services</h4>
                    <p className="text-gray-400 text-sm">From backlight errors and touch issues to network and complex IC work.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-2/5 hidden md:block relative">
              <img 
                src="https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&q=80&w=800" 
                alt="Circuit Board" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOCATION & CONTACT SECTION */}
      <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Visit Our Store</h2>
            <p className="text-gray-500 text-lg">We are here to help you get your devices back to life.</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center bg-white">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Contact Details</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4 text-gray-700">
                    <MapPin className="text-primary mt-1 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 mb-1">ASV Mobiles</p>
                      <p className="text-gray-600 leading-relaxed">
                       7,Deepam Complex,<br />
                        4 Roads,<br />
                        Near by Little Flower School,<br />
                        Salem - 636 007.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 text-gray-700">
                    <Phone className="text-primary mt-1 flex-shrink-0" size={24} />
                    <div>
                      <a href="tel:+918838467165" className="block font-bold text-gray-900 hover:text-primary transition-colors mb-1">+91 88384 67165</a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a href="tel:+918838467165" className="flex items-center justify-center bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex-1 min-w-[140px]">
                    <Phone size={18} className="mr-2" /> Call Now
                  </a>
                  <a href="https://maps.google.com/?q=11.6625452,78.1485094" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-dark transition-colors shadow-sm flex-1 min-w-[140px]">
                    <MapPin size={18} className="mr-2" /> Directions
                  </a>
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <a href="https://instagram.com/ASV_mobiles_" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-500 hover:text-pink-600 transition-colors font-medium">
                    <Instagram size={20} className="mr-2" /> @ASV_mobiles_
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="#" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium">
                    <Facebook size={20} className="mr-2" /> ASV Mobiles
                  </a>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-gray-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1952.1287413647167!2d78.14786558231542!3d11.662545197825002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDM5JzQ1LjIiTiA3OMKwMDgnNTQuNiJF!5e0!3m2!1sen!2sin!4v1715694292176!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ASV Mobiles Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT PAGE CTA */}
      <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-dark/20 mix-blend-multiply pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">Need a Repair?</h2>
          <p className="text-primary-50 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
            Get in touch with ASV Mobiles for mobile and laptop service requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+918838467165" className="w-full sm:w-auto flex items-center justify-center bg-gray-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
              <Phone size={20} className="mr-2" /> Call Now
            </a>
            <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center bg-white text-primary font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
