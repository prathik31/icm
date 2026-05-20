import { useDataContext } from '../context/DataContext'

export const useApprovals = () => {
  const { approvals, loadingApprovals, errorApprovals, refreshApprovals, refreshAll } = useDataContext()
  return {
    approvals,
    loading: loadingApprovals,
    error: errorApprovals,
    refresh: refreshApprovals,
    refreshAll,
  }
}
