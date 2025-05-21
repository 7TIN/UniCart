import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, ShoppingCart, Trash2, ExternalLink, Plus, Minus } from 'lucide-react';


interface ProductCardProps {
  product: Product;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onMoveToCart: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const ProductCard : React.FC<ProductCardProps> = ({ product, onRemove, onMoveToWishlist, onMoveToCart,onUpdateQuantity }) => {

    const [isHovering, setIsHovering] = useState(false);
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    const quantity = product.quantity || 1;
    const totalPrice = isNaN(numericPrice) ? product.price : `$${(numericPrice * quantity).toFixed(2)}`;

    const formattedDate = product.addedAt ? new Date(product.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'}): '';
    
    return (
        <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative">
        {product.image ? (
          <div className="h-48 w-full overflow-hidden bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400">No image available</div>
          </div>
        )}
        
        {/* Source badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center shadow-sm">
          {product.sourceIcon && (
            <img 
              src={product.sourceIcon} 
              alt={product.source} 
              className="w-4 h-4 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span>{product.source}</span>
        </div>
        
        {/* Action buttons */}
        <div 
          className={`absolute top-3 right-3 flex space-x-2 transition-opacity duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {product.inWishlist ? (
            <button 
              onClick={() => onMoveToCart(product.id!)}
              className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-blue-500 transition-colors duration-200 shadow-sm"
              title="Move to cart"
            >
              <ShoppingCart size={16} />
            </button>
          ) : (
            <button 
              onClick={() => onMoveToWishlist(product.id!)}
              className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-orange-500 transition-colors duration-200 shadow-sm"
              title="Save for later"
            >
              <Heart size={16} />
            </button>
          )}
          
          <button 
            onClick={() => onRemove(product.id!)}
            className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors duration-200 shadow-sm"
            title="Remove product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="font-medium text-gray-900 line-clamp-2" title={product.name}>
            {product.name}
          </h3>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-700 font-semibold">{totalPrice}</div>
          <div className="text-gray-500 text-xs">{formattedDate}</div>
        </div>
        
        {!product.inWishlist && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button title ="minus"
                onClick={() => onUpdateQuantity(product.id!, quantity - 1)}
                className="px-2 py-1 bg-gray-50 text-gray-500 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-3 py-1">{quantity}</span>
              <button title="plus"
                onClick={() => onUpdateQuantity(product.id!, quantity + 1)}
                className="px-2 py-1 bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
        
        <a 
          href={product.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <span>Visit Product</span>
          <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
    </div>
    );
};
export default ProductCard;