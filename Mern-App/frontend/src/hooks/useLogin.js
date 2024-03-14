import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { useHttp } from './useHttp'

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAuthContext()
  const { http } = useHttp()
  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)
    const {json,response} = await http('/api/user/login',{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      setIsLoading(false)
      setError(json.error)
    }
    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(json))
      dispatch({type: 'LOGIN', payload: json})
      setIsLoading(false)
    }
  }
  return { login, isLoading, error }
}