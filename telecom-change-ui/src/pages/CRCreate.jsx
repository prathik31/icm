import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createChangeRequest } from '../services/crService'
import AlertMessage from '../components/AlertMessage'
import Loader from '../components/Loader'

const initialAsset = { assetType: '', assetId: '', hostname: '' }

const CRCreate = () => {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: '',
    changeType: '',
    region: '',
    scheduledStart: '',
    scheduledEnd: '',
    rollbackAvailable: false,
    businessJustification: '',
    assets: [initialAsset],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAssetChange = (index, event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      assets: current.assets.map((asset, idx) =>
        idx === index ? { ...asset, [name]: value } : asset,
      ),
    }))
  }

  const handleAddAsset = () => {
    setForm((current) => ({ ...current, assets: [...current.assets, initialAsset] }))
  }

  const handleRemoveAsset = (index) => {
    setForm((current) => ({
      ...current,
      assets: current.assets.filter((_, idx) => idx !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const payload = {
        ...form,
        requestedByUserId: userId,
      }
      const response = await createChangeRequest(payload)
      void response
      alert('Change Request Draft Created Successfully!')
      navigate('/cr/list')
      window.location.reload()
    } catch (err) {
      // Axios returns either a string or an object from axiosClient interceptor
      console.error('Create CR error', err)
      const friendly =
        err?.message || err?.error || (typeof err === 'string' ? err : null) || JSON.stringify(err)
      setMessage(friendly || 'Failed to create change request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create change request</h1>
      <p className="mt-2 text-sm text-slate-600">Submit a new telecom change request for review and risk assessment.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {message && <AlertMessage type="error" message={message} />}
        <div className="grid gap-6 lg:grid-cols-2">
          {['title', 'domain', 'changeType', 'region'].map((key) => (
            <label className="block" key={key}>
              <span className="text-sm font-medium text-slate-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <input
                name={key}
                value={form[key]}
                required
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Scheduled start</span>
            <input
              name="scheduledStart"
              type="datetime-local"
              value={form.scheduledStart}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Scheduled end</span>
            <input
              name="scheduledEnd"
              type="datetime-local"
              value={form.scheduledEnd}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            value={form.description}
            required
            rows={3}
            onChange={handleChange}
            placeholder="Brief description of the change"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Business justification</span>
          <textarea
            name="businessJustification"
            value={form.businessJustification}
            required
            rows={4}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            name="rollbackAvailable"
            type="checkbox"
            checked={form.rollbackAvailable}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          Rollback available
        </label>
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Assets</h2>
            <button type="button" onClick={handleAddAsset} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Add asset
            </button>
          </div>
          <div className="space-y-4">
            {form.assets.map((asset, index) => (
              <div key={index} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Asset type</span>
                  <input
                    name="assetType"
                    value={asset.assetType}
                    onChange={(event) => handleAssetChange(index, event)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Asset ID</span>
                  <input
                    name="assetId"
                    value={asset.assetId}
                    onChange={(event) => handleAssetChange(index, event)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Hostname</span>
                  <input
                    name="hostname"
                    value={asset.hostname}
                    onChange={(event) => handleAssetChange(index, event)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(index)}
                  className="col-span-full justify-self-end rounded-2xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-200"
                >
                  Remove asset
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 shadow-md active:scale-95"
          >
            {loading ? 'Creating...' : 'Create request'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CRCreate
