// Simulates fetching live stock prices
function getStockPrice(symbol) {
  // Random price between 2000 - 3500 INR
  return (2000 + Math.random() * 1500).toFixed(2);
}

export { getStockPrice };
