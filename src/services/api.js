import axios from 'axios';

const API_BASE = 'https://mercado-libre-production-b0cc.up.railway.app/api/v1';

// Channel IDs
export const CHANNEL_IDS = {
  ML_MAIN: 1,      // COMPRALOENCASA
  ML_CUENTA2: 7,   // ML Cuenta 2
  ML_CUENTA3: 8,   // ML Cuenta 3
  DROPI: 4,
  DROPI_2: 9,
  SHOPIFY: 5,
  META: 6,
  META_2: 10,
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Helper to format dates for API
export const formatDateForAPI = (d) => {
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Format COP currency
export const formatCOP = (v) => {
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
  return '$' + Math.round(v).toLocaleString('es-CO');
};

// Admin / Channels
export const getChannels = () => api.get('/channels');
export const getChannelsStatus = () => api.get('/admin/channels-status');
export const disconnectChannel = (channelId) => api.post(`/admin/disconnect-channel?channel_id=${channelId}`);

// ML OAuth
export const getMLAuthUrl = (channelId) => `${API_BASE}/oauth/ml/authorize?channel_id=${channelId}`;

// Dropi
export const connectDropi = (channelId, country, email, password) =>
  api.post(`/dropi/auth/login?channel_id=${channelId}&country=${country}`, { email, password, country });
export const disconnectDropi = (channelId) => api.post(`/dropi/auth/disconnect?channel_id=${channelId}`);

// Shopify
export const connectShopify = (channelId, shopUrl, accessToken) =>
  api.post(`/shopify/auth/connect?channel_id=${channelId}`, { shop_url: shopUrl, access_token: accessToken });
export const disconnectShopify = (channelId) => api.post(`/shopify/auth/disconnect?channel_id=${channelId}`);

// Meta
export const getMetaAuthUrl = (channelId) => `${API_BASE}/meta/auth/connect?channel_id=${channelId}`;
export const disconnectMeta = (channelId) => api.post(`/admin/disconnect-channel?channel_id=${channelId}`);

// ML Analytics
export const getDashboard = (channelId, dateFrom, dateTo) =>
  api.get(`/ml/analytics/dashboard?channel_id=${channelId}&date_from=${dateFrom}&date_to=${dateTo}`);
export const getSalesByDay = (channelId, dateFrom, dateTo) =>
  api.get(`/ml/analytics/sales-by-day?channel_id=${channelId}&date_from=${dateFrom}&date_to=${dateTo}`);
export const getOrdersByStatus = (channelId, dateFrom, dateTo) =>
  api.get(`/ml/analytics/orders-by-status?channel_id=${channelId}&date_from=${dateFrom}&date_to=${dateTo}`);
export const getTopProducts = (channelId, dateFrom, dateTo, limit = 10) =>
  api.get(`/ml/analytics/top-products?channel_id=${channelId}&date_from=${dateFrom}&date_to=${dateTo}&limit=${limit}`);

// ML Orders
export const getOrdersStats = (channelId) => api.get(`/ml/orders/stats?channel_id=${channelId}`);
export const getSyncStatus = (channelId) => api.get(`/ml/sync/status?channel_id=${channelId}`);

// ML Financials
export const getFinancials = (channelId, dateFrom, dateTo) =>
  api.get(`/ml/financials?channel_id=${channelId}&date_from=${dateFrom}&date_to=${dateTo}`);
export const getFinancialsByProduct = (channelId, dateFrom, dateTo, limit = 500) =>
  api.get(`/ml/financials/by-product?channel_id=${channelId}&date_from=${dateFrom}&date_to=${dateTo}&limit=${limit}`);

// ML Products / Inventory
export const getProductsStats = (channelId) => api.get(`/ml/products/stats?channel_id=${channelId}`);
export const getProductsList = (channelId, params = {}) => {
  const query = new URLSearchParams({ channel_id: channelId, limit: 500, ...params });
  return api.get(`/ml/products/list?${query}`);
};
export const syncProducts = (channelId, concurrency = 5) =>
  api.post(`/ml/products/debug/sync-now?channel_id=${channelId}&concurrency=${concurrency}`);

export default api;
