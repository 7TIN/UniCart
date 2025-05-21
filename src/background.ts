import { Product } from "./types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ADD_PRODUCT") {
    addProduct(message.product)
      .then((response) => sendResponse(response))
      .catch((error) => console.error("Error adding product:", error));
    return true;
  }

  if (message.type === "GET_PRODUCTS") {
    getProducts()
      .then((products) => sendResponse({ products }))
      .catch((error) => console.error("Error adding product", error));
    return true;
  }

  if (message.type === "REMOVE_PRODUCT") {
    removeProduct(message.productId)
      .then((response) => sendResponse(response))
      .catch((error) => console.error("Error removing product:", error));
    return true;
  }

  if (message.type === "UPDATE_PRODUCT") {
    updateProduct(message.product)
      .then((response) => sendResponse(response))
      .catch((error) => console.error("Error updating product:", error));
    return true;
  }
});

async function addProduct(
  product: Product
): Promise<{ success: boolean; product: Product }> {
  const { products } = await getProducts();

  if (!product.id) {
    product.id = generateUniqueId();
  }
  product.addedAt = new Date().toISOString();

  products.push(product);

  await chrome.storage.sync.set({ products });

  return { success: true, product };
}

async function getProducts(): Promise<{ products: Product[] }> {
  const result = await chrome.storage.sync.get("products");

  return { products: result.products || [] };
}

async function removeProduct(productId: string): Promise<{ success: boolean }> {
  const { products } = await getProducts();
  const updatedProducts = products.filter((p) => p.id !== productId);
  await chrome.storage.sync.set({ products: updatedProducts });

  return { success: true };
}

async function updateProduct(
  updatedProduct: Product
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const { products } = await getProducts();
  const index = products.findIndex((p) => p.id === updatedProduct.id);

  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updatedProduct,
      updatedAt: new Date().toISOString(),
    };
    await chrome.storage.sync.set({ products });

    return { success: true, product: products[index] };
  }

  return { success: false, error: "Product not found" };
}

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
