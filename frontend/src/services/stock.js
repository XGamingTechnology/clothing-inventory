import api from './api'

export const getStockMovements = async (productId) => {
  const params = productId ? { productId } : {}
  const response = await api.get('/stock/movements', { params })
  return response.data
}

export const addStock = async (stockData) => {
  const response = await api.post('/stock/in', stockData)
  return response.data
}
