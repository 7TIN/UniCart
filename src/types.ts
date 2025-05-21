// Type definitions for Universal Cart extension

export interface Product {
  id?: string;
  name: string;
  price: string;
  image?: string;
  description?: string;
  url: string;
  source: string;
  sourceIcon?: string;
  category?: string;
  addedAt?: string;
  updatedAt?: string;
  quantity?: number;
  inWishlist?: boolean;
}

export interface CartState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export enum CartActionTypes {
  GET_PRODUCTS_REQUEST = "GET_PRODUCTS_REQUEST",
  GET_PRODUCTS_SUCCESS = "GET_PRODUCTS_SUCCESS",
  GET_PRODUCTS_FAILURE = "GET_PRODUCTS_FAILURE",
  ADD_PRODUCT_REQUEST = "ADD_PRODUCT_REQUEST",
  ADD_PRODUCT_SUCCESS = "ADD_PRODUCT_SUCCESS",
  ADD_PRODUCT_FAILURE = "ADD_PRODUCT_FAILURE",
  REMOVE_PRODUCT_REQUEST = "REMOVE_PRODUCT_REQUEST",
  REMOVE_PRODUCT_SUCCESS = "REMOVE_PRODUCT_SUCCESS",
  REMOVE_PRODUCT_FAILURE = "REMOVE_PRODUCT_FAILURE",
  UPDATE_PRODUCT_REQUEST = "UPDATE_PRODUCT_REQUEST",
  UPDATE_PRODUCT_SUCCESS = "UPDATE_PRODUCT_SUCCESS",
  UPDATE_PRODUCT_FAILURE = "UPDATE_PRODUCT_FAILURE",
  MOVE_TO_WISHLIST = "MOVE_TO_WISHLIST",
  MOVE_TO_CART = "MOVE_TO_CART",
}

export interface CartAction {
  type: CartActionTypes;
  payload?: any;
}

export interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  source?: string;
  searchQuery?: string;
  sortBy?: "price" | "name" | "date" | "source";
  sortOrder?: "asc" | "desc";
  showWishlist?: boolean;
}
