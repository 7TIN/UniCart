import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'search';
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchQuery }) => {
  let icon, title, description;
  
  switch (type) {
    case 'cart':
      icon = <ShoppingCart size={48} className="text-gray-300" />;
      title = "Your cart is empty";
      description = "Browse your favorite online stores and click 'Add to Universal Cart' to add items.";
      break;
    case 'wishlist':
      icon = <Heart size={48} className="text-gray-300" />;
      title = "Your wishlist is empty";
      description = "Save items for later by clicking the heart icon on any product.";
      break;
    case 'search':
      icon = <div className="text-4xl text-gray-300">🔍</div>;
      title = `No results found for "${searchQuery}"`;
      description = "Try using different keywords or filters to find what you're looking for.";
      break;
    default:
      icon = <ShoppingCart size={48} className="text-gray-300" />;
      title = "No items found";
      description = "Try adjusting your filters or browse some products.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{description}</p>
    </div>
  );
};

export default EmptyState;