import { useCallback, useEffect, useReducer } from "react";
import { CartAction, CartActionTypes, CartState, Product } from "../types";

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
}
