import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { getImageUrl } from '../../utils/getImageUrl';
import toast from 'react-hot-toast';

const MobileShowcase = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef(null);

  // If there are exactly 2 products, duplicate them to safely handle CSS prev/next transitions
  const displayProducts = products?.length === 2 ? [...products, ...products] : products;

  const navigateTo = (index) => {
    if (!displayProducts || displayProducts.length <= 1) return;
    setCurrentIndex(index);
  };

  const nextProduct = () => {
    if (!displayProducts || displayProducts.length <= 1) return;
    navigateTo((currentIndex + 1) % displayProducts.length);
  };

  const prevProduct = () => {
    if (!displayProducts || displayProducts.length <= 1) return;
    navigateTo((currentIndex - 1 + displayProducts.length) % displayProducts.length);
  };

  // Autoplay management
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only set timer if not hovered, and more than 1 product exists
    if (!isHovered && displayProducts && displayProducts.length > 1 && !prefersReducedMotion) {
      timerRef.current = setInterval(() => {
        nextProduct();
      }, 3000);
    }
    
    // Proper cleanup to prevent memory leaks and multiple timers
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isHovered, displayProducts?.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setIsHovered(true); // Pause autoplay
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    setIsHovered(false); // Resume autoplay (this will re-trigger useEffect and start a fresh timer)
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };
  
  const handleSwipe = () => {
    const threshold = 50;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (swipeDistance > threshold) {
      prevProduct(); // Swipe right -> Previous
    } else if (swipeDistance < -threshold) {
      nextProduct(); // Swipe left -> Next
    }
  };

  if (!displayProducts || displayProducts.length === 0) return null;

  return (
    <div 
      className="relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl bg-surface border border-border shadow-sm p-4 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container for products - absolute positioning allows seamless overlap during transition */}
      <div className="relative w-full h-[450px]">
        {displayProducts.map((product, idx) => {
          let stateClass = "";
          const prevIdx = (currentIndex - 1 + displayProducts.length) % displayProducts.length;
          const nextIdx = (currentIndex + 1) % displayProducts.length;

          if (idx === currentIndex) {
            // Active product
            stateClass = "opacity-100 scale-100 translate-x-0 z-10 transition-all duration-700 ease-out";
          } else if (idx === prevIdx) {
            // Outgoing to the left, or ready on the left
            stateClass = "opacity-0 scale-95 -translate-x-12 z-0 pointer-events-none transition-all duration-700 ease-out";
          } else if (idx === nextIdx) {
            // Outgoing to the right, or ready on the right
            stateClass = "opacity-0 scale-95 translate-x-12 z-0 pointer-events-none transition-all duration-700 ease-out";
          } else {
            // Idle products (invisibly pre-positioned on the right)
            stateClass = "opacity-0 scale-95 translate-x-12 pointer-events-none z-0";
          }

          const isWished = isInWishlist(product._id);
          const currentPrice = product.discountPrice || product.price;

          const handleAdd = (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product, 1);
            toast.success('Added to cart');
          };

          const handleWish = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          };

          return (
            <div 
              key={`${product._id}-${idx}`}
              className={`absolute inset-0 flex flex-col w-full h-full ${stateClass}`}
            >
              {/* Top Bar: Wishlist */}
              <div className="flex justify-end w-full mb-2 z-20">
                <button 
                  onClick={handleWish}
                  className="p-3 bg-gray-50/80 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                  aria-label="Toggle Wishlist"
                >
                  <Heart size={24} className={idx === currentIndex && isWished ? "fill-red-500 text-red-500" : ""} />
                </button>
              </div>

              {/* Product Image */}
              <Link 
                to={`/products/${product._id}`} 
                className="block relative flex-grow w-full rounded-2xl overflow-hidden bg-gray-50/50 mb-4 z-10"
              >
                <img 
                  src={getImageUrl(product.images?.[0])} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
              </Link>

              {/* Product Info */}
              <div className="flex flex-col gap-1 z-20">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {product.brand}
                </div>
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-bold text-lg text-text line-clamp-1 leading-tight">{product.name}</h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center gap-1 my-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-text-muted ml-1">({product.numReviews})</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-text">${currentPrice.toFixed(2)}</span>
                    {product.discountPrice > 0 && (
                      <span className="text-sm text-text-muted line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleAdd}
                    disabled={product.stock === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 ${product.stock > 0 ? 'bg-primary text-white hover:bg-primary-hover shadow-md' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    <ShoppingCart size={18} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress indicators - always map over the original products array for accurate dot count */}
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (idx === (currentIndex % products.length)) return;
              navigateTo(idx);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === (currentIndex % products.length) ? 'bg-primary w-6' : 'bg-gray-300'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileShowcase;
