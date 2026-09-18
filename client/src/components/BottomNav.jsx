import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, ShoppingCart, User, Heart, Package, Settings, LogOut, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';

const BottomNav = () => {
  const { cartCount } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { user, logout } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Shop', icon: Grid, path: '/products' },
    { name: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
  ];

  return (
    <>
      {/* Profile Menu Overlay - Slide up drawer */}
      {isProfileOpen && user && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}>
          <div 
            className="bg-white w-full rounded-t-3xl shadow-2xl overflow-hidden transform transition-transform duration-300 translate-y-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-1 mb-6">
                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                  <User size={20} className="mr-4 text-gray-400" /> <span className="font-medium text-base">My Profile</span>
                </Link>
                <Link to="/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                  <Heart size={20} className="mr-4 text-gray-400" /> <span className="font-medium text-base">Wishlist ({wishlist?.length || 0})</span>
                </Link>
                <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                  <Package size={20} className="mr-4 text-gray-400" /> <span className="font-medium text-base">My Orders</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                    <Settings size={20} className="mr-4 text-gray-400" /> <span className="font-medium text-base">Admin Panel</span>
                  </Link>
                )}
              </div>
              
              <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl font-bold transition-colors hover:bg-red-100">
                <LogOut size={20} className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from hiding behind navbar */}
      <div className="h-16 md:hidden pb-safe"></div>

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 pb-safe">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] px-2 py-1 flex justify-around items-center h-[72px] relative overflow-hidden">
          
          {/* subtle inner glow for glass effect */}
          <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] pointer-events-none"></div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.name} to={item.path} onClick={() => setIsProfileOpen(false)} className={`flex flex-col items-center justify-center w-16 h-full space-y-1 relative z-10 transition-all duration-300 ${isActive ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-700'}`}>
                <div className="relative">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className="transition-all duration-300" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Profile Tab */}
          <button 
            onClick={() => user ? setIsProfileOpen(!isProfileOpen) : navigate('/login')}
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 relative z-10 transition-all duration-300 ${isProfileOpen || location.pathname.startsWith('/profile') ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <div className="relative">
               <User size={22} strokeWidth={isProfileOpen || location.pathname.startsWith('/profile') ? 2.5 : 1.5} className="transition-all duration-300" />
            </div>
            <span className={`text-[10px] font-medium tracking-wide ${isProfileOpen || location.pathname.startsWith('/profile') ? 'font-bold' : ''}`}>Account</span>
          </button>
          
          {/* iOS Style Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[35%] h-[3px] bg-gray-900/80 rounded-full pointer-events-none"></div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
