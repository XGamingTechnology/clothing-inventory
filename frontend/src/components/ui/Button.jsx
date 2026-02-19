import React from 'react'

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
