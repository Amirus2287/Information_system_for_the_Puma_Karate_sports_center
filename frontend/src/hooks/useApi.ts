import { useState } from 'react'

export function useApi<T>(apiFunc: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const execute = async (...args: any[]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunc(...args)
      setData(result)
      return result
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  return { data, loading, error, execute }
}