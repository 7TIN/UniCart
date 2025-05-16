const observer = new MutationObserver(detectProductPage);

observer.observe(document.body, {
    childList:true,
    subtree: true
});

detectProductPage();

function detectProductPage() {
    const isProductPage = checkIfProductPage();

    if (isProductPage) {
        createAddToCartButton();
    }
}

function checkIfProductPage(){
    const hasPrice = document.querySelector('[itemprop="price"], .price, .product-price');
    const hasAddToCart = document.querySelector('button[name*="add"], button[id*="add-to-cart"], button[class*="add-to-cart"]');
    const hasProductTitle = document.querySelector('[itemprop="name"], .product-title, h1');
    const hasProductImage = document.querySelector('[itemprop="image"], .product-image, .gallery img ');

    return !!(hasPrice && (hasAddToCart || hasProductTitle || hasProductImage));
}


function createAddToCartButton(){
    if(document.getElementById('Universal-cart-button')) {
        return;
    }

    const button = document.createElement('button');
    button.id = 'Universal-cart-button';
    button.textContent = 'Add to Universal Cart';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 16px';
    button.style.backgroundColor = '#3B82F6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.fontWeight = 'bold';
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.2s ease';

    button.addEventListener('mouseenter', ()=>  {
        button.style.backgroundColor = '#2563EB';
        button.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('mouseleave', ()=> {
        button.style.backgroundColor = '#3B82F6';
        button.style.transform = 'traslateY(0)';
    });

    button.addEventListener('click', async () => {
        const product = extractProductInfo();

        if (product){
            try{
                
                button.textContent = 'Adding...';
                button.style.backgroundImage = '#9CA3AF';

                const response = await chrome.runtime.sendMessage({
                    type: 'ADD_PRODUCT',
                    product
                });

                if (response && response.success) {
                    button.textContent = 'Added to Cart ✓';
                    button.style.backgroundColor = '#10B981';

                    setTimeout( () => {
                        button.textContent = 'Add to universal Cart';
                        button.style.backgroundColor = '#3B82F6';
                    }, 2000);
                } else {
                    button.textContent = 'Failed to Add';
                    button.style.backgroundColor = '#EF4444';

                    setTimeout(() => {
                        button.textContent = 'Add to Universal Cart';
                        button.style.backgroundColor = '#3B82F6';
                    }, 2000);
                }
            }catch (error) {

                console.error('Failed to add product to Universal Cart:', error);
                button.textContent = 'Error';
                button.style.backgroundColor = '#EF4444';

                setTimeout(() => {
                    button.textContent = 'Add to Universal Cart';
                    button.style.backgroundColor = '#3B82F6';
                  }, 2000);
            }
        }
    });

    document.body.appendChild(button);
}

function extractProductInfo (){
    const nameSelectors = [
        '[itemprop="name"]',
        'h1',
        '.product-title',
        '.product-name',
        '#product-title'
    ];

    let name = '';
    for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
            name = element.textContent.trim();
            break;
        }
    }

    const priceSelectors = [
        '[itemprop="price"]',
        'price',
        '.product-price',
        '.current-price',
        '#product-price'
    ];
    
    let price = '';
    for (const selector of priceSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent){
            price = element.textContent.trim();
            break;
        }
    }

    const imageSelectors = [
        '[itemprop="image"]',
        '.product-image img',
        '.gallery img',
        '#product-image',
        'img.product'
    ];

    let image = '';
    for (const selector of imageSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent){
            image = element.textContent.trim();
            break;
        }
    }

    const descriptionSelectors = [
        '[itemprop = "description"]',
        '.product-description',
        '.description',
        '#product-description'
    ];

    let description = '';
    for (const selector of descriptionSelectors){
        const element = document.querySelector(selector);
        if (element && element.textContent){
            description = element.textContent.trim();
            break;
        }
    }

    if (!name || !price){
        return null;
    }

    return {
        name,
        price,
        image,
        description,
        url: window.location.href,
        source: window.location.hostname,
        sourceIcon: `${window.location.origin}/favicon.ico`,
    };
}

