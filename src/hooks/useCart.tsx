import { useReducer, useEffect, useCallback, useMemo } from "react";
import {
  CartState,
  CartAction,
  CartActionTypes,
  Product,
  FilterOptions,
} from "../types";

// Initial state for cart
const initialState: CartState = {
  products: [],
  loading: false,
  error: null,
};

// Reducer function for cart state
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case CartActionTypes.GET_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CartActionTypes.GET_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      };
    case CartActionTypes.GET_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        products: [], // Reset to empty array on error
      };
    case CartActionTypes.ADD_PRODUCT_SUCCESS:
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case CartActionTypes.REMOVE_PRODUCT_SUCCESS:
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case CartActionTypes.UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case CartActionTypes.MOVE_TO_WISHLIST:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload ? { ...p, inWishlist: true } : p
        ),
      };
    case CartActionTypes.MOVE_TO_CART:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload ? { ...p, inWishlist: false } : p
        ),
      };
    default:
      return state;
  }
}

// Custom hook for cart operations
export function useCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from extension storage
  const fetchProducts = useCallback(async () => {
    try {
      dispatch({ type: CartActionTypes.GET_PRODUCTS_REQUEST });

      if (!chrome?.runtime?.sendMessage) {
        dispatch({
          type: CartActionTypes.GET_PRODUCTS_SUCCESS,
          payload: [],
        });
        return;
      }

      const response = await chrome.runtime.sendMessage({
        type: "GET_PRODUCTS",
      });

      dispatch({
        type: CartActionTypes.GET_PRODUCTS_SUCCESS,
        payload: Array.isArray(response?.products) ? response.products : [],
      });
    } catch (error) {
      dispatch({
        type: CartActionTypes.GET_PRODUCTS_FAILURE,
        payload: "Failed to fetch products",
      });
    }
  }, []);

  // Add a product to cart
  const addProduct = useCallback(async (product: Product) => {
    try {
      if (!chrome?.runtime?.sendMessage) return false;

      const response = await chrome.runtime.sendMessage({
        type: "ADD_PRODUCT",
        product,
      });

      if (response?.success) {
        dispatch({
          type: CartActionTypes.ADD_PRODUCT_SUCCESS,
          payload: response.product,
        });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({
        type: CartActionTypes.ADD_PRODUCT_FAILURE,
        payload: "Failed to add product",
      });
      return false;
    }
  }, []);

  // Remove a product from cart
  const removeProduct = useCallback(async (productId: string) => {
    try {
      if (!chrome?.runtime?.sendMessage) return false;

      const response = await chrome.runtime.sendMessage({
        type: "REMOVE_PRODUCT",
        productId,
      });

      if (response?.success) {
        dispatch({
          type: CartActionTypes.REMOVE_PRODUCT_SUCCESS,
          payload: productId,
        });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({
        type: CartActionTypes.REMOVE_PRODUCT_FAILURE,
        payload: "Failed to remove product",
      });
      return false;
    }
  }, []);

  // Update a product in cart
  const updateProduct = useCallback(async (product: Product) => {
    try {
      if (!chrome?.runtime?.sendMessage) return false;

      const response = await chrome.runtime.sendMessage({
        type: "UPDATE_PRODUCT",
        product,
      });

      if (response?.success) {
        dispatch({
          type: CartActionTypes.UPDATE_PRODUCT_SUCCESS,
          payload: response.product,
        });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({
        type: CartActionTypes.UPDATE_PRODUCT_FAILURE,
        payload: "Failed to update product",
      });
      return false;
    }
  }, []);

  // Move product to wishlist
  const moveToWishlist = useCallback(
    async (productId: string) => {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        const updated = { ...product, inWishlist: true };
        const success = await updateProduct(updated);
        if (success) {
          dispatch({
            type: CartActionTypes.MOVE_TO_WISHLIST,
            payload: productId,
          });
        }
      }
    },
    [state.products, updateProduct]
  );

  // Move product from wishlist to cart
  const moveToCart = useCallback(
    async (productId: string) => {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        const updated = { ...product, inWishlist: false };
        const success = await updateProduct(updated);
        if (success) {
          dispatch({ type: CartActionTypes.MOVE_TO_CART, payload: productId });
        }
      }
    },
    [state.products, updateProduct]
  );

  // Update product quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        const updated = { ...product, quantity: Math.max(1, quantity) };
        await updateProduct(updated);
      }
    },
    [state.products, updateProduct]
  );

  // Filter and sort products
  const filterProducts = useCallback(
    (options: FilterOptions) => {
      let filtered = [...state.products];

      // Filter by wishlist
      if (options.showWishlist !== undefined) {
        filtered = filtered.filter(
          (p) => p.inWishlist === options.showWishlist
        );
      }

      // Filter by category
      if (options.category) {
        filtered = filtered.filter((p) => p.category === options.category);
      }

      // Filter by source (website)
      if (options.source) {
        filtered = filtered.filter((p) => p.source === options.source);
      }

      // Filter by price range
      if (options.priceRange) {
        filtered = filtered.filter((p) => {
          const price = parseFloat(p.price.replace(/[^0-9.]/g, ""));
          return (
            price >= options.priceRange![0] && price <= options.priceRange![1]
          );
        });
      }

      // Filter by search query
      if (options.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        );
      }

      // Sort products
      if (options.sortBy) {
        filtered.sort((a, b) => {
          switch (options.sortBy) {
            case "price":
              const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
              const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
              return options.sortOrder === "asc"
                ? priceA - priceB
                : priceB - priceA;
            case "name":
              return options.sortOrder === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            case "date":
              const dateA = new Date(a.addedAt || "").getTime();
              const dateB = new Date(b.addedAt || "").getTime();
              return options.sortOrder === "asc"
                ? dateA - dateB
                : dateB - dateA;
            case "source":
              return options.sortOrder === "asc"
                ? a.source.localeCompare(b.source)
                : b.source.localeCompare(a.source);
            default:
              return 0;
          }
        });
      }

      return filtered;
    },
    [state.products]
  );

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    state.products.forEach((p) => {
      if (p.category) categorySet.add(p.category);
    });
    return Array.from(categorySet);
  }, [state.products]);

  // Get unique sources (websites)
  const sources = useMemo(() => {
    const sourceSet = new Set<string>();
    state.products.forEach((p) => sourceSet.add(p.source));
    return Array.from(sourceSet);
  }, [state.products]);

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const cartItems = state.products.filter((p) => !p.inWishlist);
    const wishlistItems = state.products.filter((p) => p.inWishlist);

    let cartTotal = 0;
    cartItems.forEach((item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ""));
      const quantity = item.quantity || 1;
      if (!isNaN(price)) {
        cartTotal += price * quantity;
      }
    });

    return {
      cartCount: cartItems.length,
      wishlistCount: wishlistItems.length,
      totalPrice: cartTotal.toFixed(2),
    };
  }, [state.products]);

  return {
    products: state.products,
    loading: state.loading,
    error: state.error,
    fetchProducts,
    addProduct,
    removeProduct,
    updateProduct,
    moveToWishlist,
    moveToCart,
    updateQuantity,
    filterProducts,
    categories,
    sources,
    cartTotals,
  };
}
