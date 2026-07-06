import { useEffect, useState, useCallback } from 'react'
import { getTaskDetails } from '../services/technicianService'

const useExecutionStatus = (crId) => {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!crId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getTaskDetails(crId)
      setTask(data)
    } catch (err) {
      setError(err?.message || 'Unable to load execution status.')
    } finally {
      setLoading(false)
    }
  }, [crId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    task,
    loading,
    error,
    refresh,
  }
}

export default useExecutionStatus
