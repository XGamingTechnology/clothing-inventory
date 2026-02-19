import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const StockList = () => {
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <Link to="/stock/in">
          <Button variant="primary">+ Add Stock</Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Stock management page coming soon...</p>
      </div>
    </div>
  )
}

export default StockList
