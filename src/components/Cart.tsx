import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import Header from "./Header";
import { FilterOptions } from "../types";
import { useCart } from "../hooks/useCart";

const Cart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"cart" | "wishlist">("cart");
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
  });

  const {
    removeProduct,
    moveToWishlist,
    moveToCart,
    updateQuantity,
    filterProducts,
    categories,
    sources,
    cartTotals,
  } = useCart();

  const displayedProducts = useMemo(() => {
    return filterProducts({
      ...filters,
      showWishlist: activeTab === "wishlist",
    });
  }, [filterProducts, filters, activeTab]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        cartCount={cartTotals.cartCount}
        wishlistCount={cartTotals.wishlistCount}
        totalPrice={cartTotals.totalPrice}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFilterChange={handleFilterChange}
        categories={categories}
        sources={sources}
      />
      <div className="flex-1 overflow-auto p-4">
        {displayedProducts.length === 0 ? (
          <EmptyState type={activeTab} searchQuery={filters.searchQuery} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRemove={removeProduct}
                onMoveToWishlist={moveToWishlist}
                onMoveToCart={moveToCart}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Cart;
