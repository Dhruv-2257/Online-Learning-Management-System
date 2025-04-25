// Constants
const USD_TO_INR_FIXED_RATE = 83.5; // Fixed exchange rate

// Settings
const currency = 'INR'; // Always using INR
let conversionRate = USD_TO_INR_FIXED_RATE;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Function to get current time in milliseconds
function getCurrentTime() {
  return new Date().getTime();
}

// Function to check if we should fetch new exchange rate data
function shouldFetchRates() {
  return getCurrentTime() - lastFetchTime > CACHE_DURATION;
}

// Function to format price in INR
function formatINR(price) {
  const inrPrice = parseFloat(price) * conversionRate;
  return `₹${Math.round(inrPrice)}`;
}

// Function to format price - always in INR
function formatPrice(price) {
  return formatINR(price);
}

// Function to update all price displays on the page
function updateAllPrices() {
  // Update price displays
  const priceElements = document.querySelectorAll('.course-price span:not(.free)');
  
  priceElements.forEach(element => {
    // Extract the original USD price (stored as a data attribute)
    let usdPrice = element.getAttribute('data-usd-price');
    
    // If the data attribute doesn't exist yet, store the original price
    // and remove any currency symbols
    if (!usdPrice) {
      usdPrice = element.textContent.replace(/[₹$]/g, '').trim();
      element.setAttribute('data-usd-price', usdPrice);
    }
    
    // Update the displayed price to INR
    element.textContent = formatPrice(usdPrice);
    
    // Always use INR styling
    element.classList.add('price-inr');
    element.classList.remove('price-usd');
  });
  
  // Make currency conversion rate available globally for other scripts
  window.currency = currency;
  window.conversionRate = conversionRate;
}

// Function to fetch latest conversion rates from API (fallback to fixed rate)
async function fetchConversionRates() {
  try {
    // Update the prices using fixed rate
    updateAllPrices();
  } catch (error) {
    console.warn('Error in currency conversion:', error);
  }
}

// Initialize currency conversion
function initCurrencyConversion() {
  // No toggle button needed, always using INR
  
  // Initial update of prices
  updateAllPrices();
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCurrencyConversion);