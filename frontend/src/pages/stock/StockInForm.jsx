import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const StockInForm = () => {
  const navigate = useNavigate()

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Stock</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Stock in form coming soon...</p>
        
        <div className="mt-6">
          <Button onClick={() => navigate('/stock')} variant="secondary">
            Back to Stock
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StockInForm
