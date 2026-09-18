import React from 'react';
import ProductCard from '../ProductCard';

const DesktopCarousel = ({ products }) => {
  // Duplicate the products array to allow a seamless infinite marquee animation.
  // We need enough items to fill the screen width twice so that when it scrolls 50%,
  // the user doesn't see empty space before it loops back.
  const duplicatedProducts = [...products, ...products, ...products, ...products];

  return (
    <div className="w-full overflow-hidden py-4">
      {/* The marquee container moves to the left by 50% and then resets */}
      <div className="flex w-max animate-marquee pause-on-hover hover:[animation-play-state:paused]">
        {duplicatedProducts.map((product, index) => (
          <div key={`${product._id}-${index}`} className="w-[300px] flex-shrink-0 mx-4">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopCarousel;
