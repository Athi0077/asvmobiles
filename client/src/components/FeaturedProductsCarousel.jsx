import React from 'react';
import DesktopCarousel from './FeaturedProducts/DesktopCarousel';
import TabletCarousel from './FeaturedProducts/TabletCarousel';
import MobileShowcase from './FeaturedProducts/MobileShowcase';

const FeaturedProductsCarousel = ({ products, loading }) => {
  if (loading || !products || products.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-2xl">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading featured products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: < 640px */}
      <div className="block sm:hidden">
        <MobileShowcase products={products} />
      </div>

      {/* Tablet: 640px to 1023px */}
      <div className="hidden sm:block lg:hidden">
        <TabletCarousel products={products} />
      </div>

      {/* Desktop: >= 1024px */}
      <div className="hidden lg:block">
        <DesktopCarousel products={products} />
      </div>
    </div>
  );
};

export default FeaturedProductsCarousel;
