import React from 'react';
import ProductCard from '../ProductCard';

const TabletCarousel = ({ products }) => {
  return (
    <div className="w-full py-4 relative">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map((product) => (
          <div key={product._id} className="w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {/* Inject styles for hide-scrollbar specifically for Webkit if not in global css */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};

export default TabletCarousel;
