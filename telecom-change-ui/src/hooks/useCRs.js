import { useDataContext } from '../context/DataContext'

export const useCRs = () => {
  const { requests, loadingRequests, errorRequests, refreshRequests, refreshAll } = useDataContext()
  return {
    requests,
    loading: loadingRequests,
    error: errorRequests,
    refresh: refreshRequests,
    refreshAll,
  }
}
