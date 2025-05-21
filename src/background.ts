// Background service worker for Universal Cart extension
import { Product } from './types';

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ADD_PRODUCT') {
    addProduct(message.product)
      .then(response => sendResponse(response))
      .catch(error => console.error('Error adding product:', error));
    return true; // Indicates async response
  }
  
  if (message.type === 'GET_PRODUCTS') {
    getProducts()
      .then(response => sendResponse(response))
      .catch(error => {
        console.error('Error getting products:', error);
        sendResponse({ products: [] }); // Always return an array
      });
    return true; // Indicates async response
  }
  
  if (message.type === 'REMOVE_PRODUCT') {
    removeProduct(message.productId)
      .then(response => sendResponse(response))
      .catch(error => console.error('Error removing product:', error));
    return true; // Indicates async response
  }
  
  if (message.type === 'UPDATE_PRODUCT') {
    updateProduct(message.product)
      .then(response => sendResponse(response))
      .catch(error => console.error('Error updating product:', error));
    return true; // Indicates async response
  }
});

// Add a product to storage
async function addProduct(product: Product) {
  const { products } = await getProducts();
  
  // Generate unique ID if not present
  if (!product.id) {
    product.id = generateUniqueId();
  }
  
  // Add timestamp
  product.addedAt = new Date().toISOString();
  
  // Add to products array
  products.push(product);
  
  // Save to storage
  await chrome.storage.sync.set({ products });
  
  return { success: true, product };
}

// Get all products from storage
async function getProducts() {
  try {
    const result = await chrome.storage.sync.get('products');
    return { products: Array.isArray(result.products) ? result.products : [] };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [] };
  }
}

// Remove a product from storage
async function removeProduct(productId: string) {
  const { products } = await getProducts();
  const updatedProducts = products.filter(p => p.id !== productId);
  await chrome.storage.sync.set({ products: updatedProducts });
  return { success: true };
}

// Update a product in storage
async function updateProduct(updatedProduct: Product) {
  const { products } = await getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updatedProduct,
      updatedAt: new Date().toISOString()
    };
    
    await chrome.storage.sync.set({ products });
    return { success: true, product: products[index] };
  }
  
  return { success: false, error: 'Product not found' };
}

// Generate a unique ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}