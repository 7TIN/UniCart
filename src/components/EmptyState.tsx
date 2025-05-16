import { Heart, Search, ShoppingCart } from "lucide-react";

interface EmptyStateProps {
    type: 'cart' | 'wishlist' | 'search';
    searchQuery?: string;
}

const emptyStateConfig: Record<EmptyStateProps['type'],{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = {
    cart: {
        icon: <ShoppingCart size={48} className="text-gray-300"/>,
        title: "Your cart is empty",
        description: "Browse your favorite online stores and click 'Add to Universal Cart' to add items.",
    },
    wishlist: {
        icon: <Heart size={48} className="text-gray300"/>,
        title: "Your wishlist is empty",
        description: "Save items for later by clicking the heart icon on any product.",
    },
    search: {
        icon: <Search size={48} className="text-gray300"/>,
        title: "No results found",
        description: "Try using different keywords or filters to find what you're looking for.",
    },
};

const EmptyState : React.FC<EmptyStateProps> = ({type, searchQuery}) => {
    const {icon, title, description} = emptyStateConfig[type];
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-4">
                {icon}
            </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title === 'search' && searchQuery ? `${title} for "${searchQuery}"` : title}</h3>
        <p className="text-sm text-gray-500 max-w-xs">
            {description}</p>
        </div>
    )
}

export default EmptyState;