// Constants
const USD_TO_INR_FIXED_RATE = 83.5; // Fixed exchange rate as fallback
const CURRENCY_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Settings
let currency = 'INR'; // Always use INR
let conversionRate = USD_TO_INR_FIXED_RATE; // Default rate
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

// Function to format price in USD
function formatUSD(price) {
  return `$${parseFloat(price).toFixed(2)}`;
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

// No toggle function needed - always using INR

// Function to update all price displays on the page
function updateAllPrices() {
  // Update price displays
  const priceElements = document.querySelectorAll('.course-price span:not(.free)');
  
  priceElements.forEach(element => {
    // Extract the original USD price (stored as a data attribute)
    let usdPrice = element.getAttribute('data-usd-price');
    
    // If the data attribute doesn't exist yet, store the original price and remove the currency symbol
    if (!usdPrice) {
      usdPrice = element.textContent.replace('$', '').trim();
      element.setAttribute('data-usd-price', usdPrice);
    }
    
    // Update the displayed price based on the current currency setting
    element.textContent = formatPrice(usdPrice);
    
    // Always use INR styling
    element.classList.add('price-inr');
    element.classList.remove('price-usd');
  });
  
  // No toggle button in this implementation
  
  // Admin form always shows INR
  
  // Make currency conversion rate available globally for other scripts
  window.currency = currency;
  window.conversionRate = conversionRate;
}

// Function to fetch latest conversion rates from API
async function fetchConversionRates() {
  try {
    // Only fetch if we need updated rates
    if (shouldFetchRates()) {
      const response = await fetch(CURRENCY_API_URL);
      
      if (response.ok) {
        const data = await response.json();
        conversionRate = data.rates.INR;
        lastFetchTime = getCurrentTime();
        localStorage.setItem('conversionRate', conversionRate.toString());
        localStorage.setItem('lastFetchTime', lastFetchTime.toString());
        console.log(`Updated conversion rate: 1 USD = ${conversionRate} INR`);
      } else {
        console.warn('Failed to fetch conversion rates, using fixed rate');
      }
    }
  } catch (error) {
    console.warn('Error fetching conversion rates, using fixed rate:', error);
  }
  
  // Update the prices after rate fetch (or using cached/fixed rate)
  updateAllPrices();
}

// Initialize currency conversion
function initCurrencyConversion() {
  // Try to load cached conversion rate and timestamp
  const cachedRate = localStorage.getItem('conversionRate');
  const cachedTimestamp = localStorage.getItem('lastFetchTime');
  
  if (cachedRate && cachedTimestamp) {
    conversionRate = parseFloat(cachedRate);
    lastFetchTime = parseInt(cachedTimestamp);
  }
  
  // No toggle button needed, always using INR
  
  // Initial fetch of conversion rates and update prices
  fetchConversionRates();
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCurrencyConversion);