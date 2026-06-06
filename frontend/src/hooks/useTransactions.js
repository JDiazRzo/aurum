import { useState, useEffect, useCallback } from 'react'
import { transactionService } from '../services/api.js'

export const useTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await transactionService.getAll(filters)
      setTransactions(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  const create = async (payload) => {
    const { data } = await transactionService.create(payload)
    setTransactions(prev => [data.data, ...prev])
    return data.data
  }

  const remove = async (id) => {
    await transactionService.remove(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return { transactions, loading, error, refetch: fetch, create, remove }
}

export const useSummary = (month, year) => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    transactionService.summary({ month, year })
      .then(({ data }) => setSummary(data.data))
      .finally(() => setLoading(false))
  }, [month, year])

  return { summary, loading }
}
