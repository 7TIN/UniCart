import { useEffect } from "react";
import UniversalCart from "./components/Cart";

function App() {
  useEffect(() => {
    const updateBadge = async () => {
      if (!chrome?.runtime?.sendMessage) {
        console.log(
          "Chrome extension APIs not available - skipping badge update"
        );
        return;
      }

      try {
        const response = await new Promise<{ products: any[] }>((resolve) => {
          chrome.runtime.sendMessage({ type: "GET_PRODUCTS" }, (res) => {
            resolve(res);
          });
        });

        const cartCount = response.products.filter((p) => !p.inWishlist).length;

        if (cartCount > 0) {
          if (chrome.action?.setBadgeText) {
            await chrome.action.setBadgeText({ text: cartCount.toString() });
            await chrome.action.setBadgeBackgroundColor({ color: "#3B82F6" });
          }
        } else {
          if (chrome.action?.setBadgeText) {
            await chrome.action.setBadgeText({ text: " " });
          }
        }
      } catch (error) {
        console.log("Badge update skipped - extension context not available");
      }
    };

    updateBadge();

    const storageListener = () => {
      updateBadge();
    };

    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(storageListener);

      return () => {
        chrome.storage.onChanged.removeListener(storageListener);
      };
    }

    return () => {};
  }, []);

  return (
    <div className="w-[400px] h-[500px] overflow-hidden bg-gray-50 border border-slate-500 ">
      <UniversalCart />
    </div>
  );
}

export default App;
