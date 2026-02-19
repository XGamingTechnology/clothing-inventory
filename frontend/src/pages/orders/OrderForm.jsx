import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const OrderForm = () => {
  const navigate = useNavigate()

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Order</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Order form coming soon...</p>
        
        <div className="mt-6">
          <Button onClick={() => navigate('/orders')} variant="secondary">
            Back to Orders
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderForm
