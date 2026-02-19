import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await register(values)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          í·µ Clothing Inventory
        </h1>
        <p className="text-center text-gray-600 mb-8">Create your account</p>

        <Formik
          initialValues={{ username: '', email: '', password: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="username">
                {({ field, meta }) => (
                  <Input
                    label="Username"
                    {...field}
                    error={meta.touched && meta.error}
                  />
                )}
              </Field>

              <Field name="email">
                {({ field, meta }) => (
                  <Input
                    label="Email"
                    {...field}
                    error={meta.touched && meta.error}
                  />
                )}
              </Field>

              <Field name="password">
                {({ field, meta }) => (
                  <Input
                    label="Password"
                    type="password"
                    {...field}
                    error={meta.touched && meta.error}
                  />
                )}
              </Field>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
