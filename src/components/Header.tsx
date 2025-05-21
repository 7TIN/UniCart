import React, { useState } from "react";
import { Filter, Heart, Search, ShoppingCart, X } from "lucide-react";
import { FilterOptions } from "../types";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  totalPrice: string;
  activeTab: "cart" | "wishlist";
  setActiveTab: (tab: "cart" | "wishlist") => void;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  sources: string[];
}

const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  totalPrice,
  activeTab,
  setActiveTab,

  onFilterChange,
  categories,
  sources,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
  });
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, searchQuery });
  };

  // Update filters
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      sortBy: "date",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    onFilterChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      !!filters.category ||
      !!filters.source ||
      !!filters.priceRange ||
      !!searchQuery
    );
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="mr-2 text-blue-500" />
            UniCart
          </h1>
          {activeTab === "cart" && cartCount > 0 && (
            <div className="text-sm font-medium text-gray-700">
              Total: <span className="text-blue-600">${totalPrice}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <button
            title="Show filters"
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Filter size={18} />
          </button>
        </form>
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Filters</h3>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-500 hover:text-blue-600 flex items-center"
                >
                  <X size={14} className="mr-1" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1">Category</label>
                <select
                  title="filters category"
                  value={filters.category || ""}
                  onChange={(e) =>
                    updateFilters({ category: e.target.value || undefined })
                  }
                  className="w-full p-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Website</label>
                <select
                  title="Show source"
                  value={filters.source || ""}
                  onChange={(e) =>
                    updateFilters({ source: e.target.value || undefined })
                  }
                  className="w-full p-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">All Websites</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Category filter */}
              <div>
                <label className="block text-gray-600 mb-1">Category</label>
                <select
                  title="category"
                  value={filters.category || ""}
                  onChange={(e) =>
                    updateFilters({ category: e.target.value || undefined })
                  }
                  className="w-full p-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source filter */}
              <div>
                <label className="block text-gray-600 mb-1">Website</label>
                <select
                  title="websites"
                  value={filters.source || ""}
                  onChange={(e) =>
                    updateFilters({ source: e.target.value || undefined })
                  }
                  className="w-full p-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">All Websites</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex border-b border-gray-200">
          <button
            className={`flex items-center py-2 px-4 border-b-2 font-medium text-sm 
                ${
                  activeTab === "cart"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            onClick={() => setActiveTab("cart")}
          >
            <ShoppingCart size={16} className="mr-2" />
            Cart
            {cartCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full px-2 py-0.5">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className={`flex items-center py-2 px-4 border-b-2 font-medium text-sm 
                    ${
                      activeTab === "wishlist"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
            onClick={() => setActiveTab("wishlist")}
          >
            <Heart size={16} className="mr-2" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full px-2 py-0.5">
                {wishlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
