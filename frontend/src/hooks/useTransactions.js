import { useState, useEffect, useCallback } from 'react'
import { transactionService, budgetService } from '../services/api.js'

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

  const fetch = useCallback(() => {
    setLoading(true)
    return transactionService.summary({ month, year })
      .then(({ data }) => setSummary(data.data))
      .finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => { fetch() }, [fetch])

  return { summary, loading, refetch: fetch }
}

export const useMonthlyTrend = (months = 6) => {
  const [trend,   setTrend]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    transactionService.trend({ months })
      .then(({ data }) => setTrend(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [months])

  return { trend, loading }
}

export const useStreak = () => {
  const [streak,  setStreak]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    transactionService.streak()
      .then(({ data }) => setStreak(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { streak, loading }
}

export const useBudgetDashboard = () => {
  const [budget,  setBudget]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    budgetService.dashboard()
      .then(({ data }) => setBudget(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { budget, loading }
}
