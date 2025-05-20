import { useCallback, useEffect, useReducer } from "react";
import {
  CartAction,
  CartActionTypes,
  CartState,
  FilterOptions,
  Product,
} from "../types";

const initialState: CartState = {
  products: [],
  loading: false,
  error: null,
};

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
        products: action.payload,
        loading: false,
      };
    case CartActionTypes.GET_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
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

export function useCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      dispatch({ type: CartActionTypes.GET_PRODUCTS_REQUEST });

      const response = await chrome.runtime.sendMessage({
        type: "GET_PRODUCTS",
      });

      dispatch({
        type: CartActionTypes.GET_PRODUCTS_SUCCESS,
        payload: response.products,
      });
    } catch (error) {
      dispatch({
        type: CartActionTypes.GET_PRODUCTS_FAILURE,
        payload: "Failed to fetch products",
      });
    }
  }, []);

  const addProduct = useCallback(async (product: Product) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "ADD_PRODUCT",
        product,
      });

      if (response.success) {
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

  const removeProduct = useCallback(async (productId: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "REMOVE_PRODUCT",
        productId,
      });

      if (response.success) {
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

  const updateProduct = useCallback(async (product: Product) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "UPDATE_PRODUCT",
        product,
      });

      if (response.success) {
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

  const filterProducts = useCallback((options: FilterOptions) => {
    let filtered = [...state.products];

    if (options.showWishlist !== undefined) {
      filtered = filtered.filter((p) => p.inWishlist === options.showWishlist);
    }

    if (options.category) {
      filtered = filtered.filter((p) => p.category === options.category);
    }

    if (options.source) {
      filtered = filtered.filter((p) => p.source === options.source);
    }

    if (options.priceRange) {
      filtered = filtered.filter((p) => {
        const price = parseFloat(p.price.replace(/[^0-9.]/g, ""));
        return (
          price >= options.priceRange![0] && price <= options.priceRange![1]
        );
      });
    }

    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();

      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (options.sortBy){
      filtered.sort((a,b) => {
         switch (options.sortBy){
          case 'price':
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g,''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g,''));
            return options.sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
          case 'name':
            return options.sortOrder === 'asc' ? 
            a.name.localeCompare(b.name) :
            b.name.localeCompare(a.name);
          case 'date':
            const dateA = new Date(a.addedAt || '').getTime();
            const dateB = new Date(b.addedAt || '').getTime();
            return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA; 
          case 'source':
            return options.sortOrder === 'asc' ? 
            a.source.localeCompare(b.source) :
            b.source.localeCompare(a.source);

          default :
          return 0;
         }
      });
    }
    return filtered;
  }, [state.products]);
}
