import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import AIShoppingAssistant from '../components/AIShoppingAssistant';

const UserLayout = () => {
  const location = useLocation();
  
  // Show AI assistant only on home page and product pages
  const showAIAssistant = 
    location.pathname === '/' || 
    location.pathname === '/products' || 
    location.pathname.startsWith('/products/');

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
      <BottomNav />
      {showAIAssistant && <AIShoppingAssistant />}
    </div>
  );
};

export default UserLayout;
