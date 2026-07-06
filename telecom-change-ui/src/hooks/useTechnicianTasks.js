import { useEffect, useState } from 'react'
import { getMyTasks } from '../services/technicianService'

const useTechnicianTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyTasks()
      setTasks(data)
    } catch (err) {
      setError(err?.message || 'Unable to load technician tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    refreshTasks,
  }
}

export default useTechnicianTasks
