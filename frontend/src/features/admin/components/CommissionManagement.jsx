import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgePercent, ChevronLeft, ChevronRight, Clock3, Pencil, Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Can from '@/components/Can'
import { formatDateTime } from '@/utils/formatDate'
import {
  createCommission,
  getCommission,
  getCommissionHistory,
  updateCommission,
} from '@/services/commission.service'
import { ROUTES } from '@/constants/routes'

const emptyForm = { commissionType: 'Percentage', commissionValue: '', reason: '' }
const HISTORY_PAGE_SIZE = 5

const formatCommission = (commissionType, value) => {
  if (value == null || value === '') return '—'
  return commissionType === 'Percentage' ? `${value}%` : `₹${Math.round(Number(value)).toLocaleString('en-IN')}`
}

const CommissionManagement = () => {
  const navigate = useNavigate()
  const [commission, setCommission] = useState(null)
  const [history, setHistory] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)

  const loadCommission = useCallback(async () => {
    setLoading(true)
    try {
      const [commissionResult, historyResult] = await Promise.allSettled([getCommission(), getCommissionHistory()])
      if (commissionResult.status === 'fulfilled') {
        const current = commissionResult.value.data?.commission || null
        setCommission(current)
        if (current) setForm({ commissionType: current.commissionType, commissionValue: String(current.commissionValue), reason: '' })
      } else if (commissionResult.reason?.response?.status === 404) {
        setCommission(null)
        setForm(emptyForm)
      } else {
        throw commissionResult.reason
      }
      if (historyResult.status === 'fulfilled') {
        setHistory(historyResult.value.data?.history || [])
        setHistoryPage(1)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load commission settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCommission() }, [loadCommission])

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const openCreate = () => {
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = () => {
    setForm({ commissionType: commission.commissionType, commissionValue: String(commission.commissionValue), reason: '' })
    setShowForm(true)
  }

  const totalHistoryPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE))
  const visibleHistory = history.slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE)
  const valueLabel = commission?.commissionType === 'Fixed' ? 'Amount (₹)' : '(%)'

  const save = async (event) => {
    event.preventDefault()
    const commissionValue = Number(form.commissionValue)
    if (!Number.isFinite(commissionValue) || commissionValue < 0) {
      toast.error('Enter a valid commission value')
      return
    }
    if (form.commissionType === 'Percentage' && commissionValue > 100) {
      toast.error('Percentage commission cannot exceed 100%')
      return
    }
    if (form.commissionType === 'Fixed' && !Number.isInteger(commissionValue)) {
      toast.error('Flat commission amount must be a whole number')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, commissionValue }
      if (commission) await updateCommission(payload)
      else await createCommission(payload)
      toast.success(commission ? 'Commission updated successfully' : 'Commission created successfully')
      setShowForm(false)
      await loadCommission()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save commission')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 lg:space-y-7">

      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Commission Settings</h1>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground ml-7">Set the active platform commission and review every change.</p>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BadgePercent size={42} strokeWidth={1.8} /></div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">Active Commission</h2>
            {loading ? <p className="mt-3 text-sm text-muted-foreground">Loading commission settings…</p> : commission ? (
              <><p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{formatCommission(commission.commissionType, commission.commissionValue)}</p><p className="mt-2 text-sm text-muted-foreground">This is the active commission applied across the platform.</p></>
            ) : <><p className="mt-2 text-sm text-muted-foreground">No active commission has been configured.</p><Can resource="commissions" action="create"><Button className="mt-4" onClick={openCreate}><Plus size={16} className="mr-2" />Create Commission</Button></Can></>}
          </div>
          {commission && <Can resource="commissions" action="update"><Button variant="outline" onClick={openEdit}><Pencil size={16} className="mr-2" />Edit</Button></Can>}
        </div>
      </section>

      <Modal
        open={showForm}
        onClose={() => !saving && setShowForm(false)}
        title={commission ? 'Update Commission' : 'Create Commission'}
        subtitle={commission ? 'Update the active commission and record the reason for this change.' : 'Set the platform commission applied to eligible bookings.'}
        size="md"
      >
        <form onSubmit={save} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select label="Commission type" name="commissionType" value={form.commissionType} onChange={change} required>
              <option value="Percentage">Percentage (%)</option>
              <option value="Fixed">Fixed amount (₹)</option>
            </Select>
            <Input label={form.commissionType === 'Percentage' ? 'Commission percentage' : 'Commission amount'} name="commissionValue" type="number" min="0" max={form.commissionType === 'Percentage' ? '100' : undefined} step={form.commissionType === 'Fixed' ? '1' : '0.01'} value={form.commissionValue} onChange={change} required />
            {commission && <Input label="Reason for change" name="reason" value={form.reason} onChange={change} containerClassName="md:col-span-2" />}
            <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" loading={saving}>{commission ? 'Save Changes' : 'Create Commission'}</Button></div>
        </form>
      </Modal>

      <section className="overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock3 size={23} /></div>
          <div><h2 className="font-semibold text-foreground">Commission History</h2><p className="mt-0.5 text-sm text-muted-foreground">Changes to the active commission.</p></div>
        </div>
        {loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading history…</p> : history.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No commission changes recorded yet.</p> : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[760px] text-sm"><thead className="bg-primary/5 text-left text-muted-foreground"><tr><th className="px-4 py-4 font-semibold">Previous {valueLabel}</th><th className="px-4 py-4 font-semibold">New {valueLabel}</th><th className="px-4 py-4 font-semibold">Changed by</th><th className="px-4 py-4 font-semibold">Reason</th><th className="px-4 py-4 font-semibold">Date</th></tr></thead><tbody>{visibleHistory.map((item) => {
              const person = item.changedBy?.name || item.changedBy?.email || '—'
              const initials = person === '—' ? '—' : person.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
              return <tr key={item._id} className="border-t border-border"><td className="px-4 py-4">{formatCommission(item.oldCommissionType, item.oldCommissionValue)}</td><td className="px-4 py-4 font-medium text-foreground">{formatCommission(item.newCommissionType, item.newCommissionValue)}</td><td className="px-4 py-4"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{initials}</span><span>{person}</span></div></td><td className="px-4 py-4">{item.reason || '—'}</td><td className="px-4 py-4 whitespace-nowrap">{formatDateTime(item.createdAt)}</td></tr>
            })}</tbody></table></div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>Showing {(historyPage - 1) * HISTORY_PAGE_SIZE + 1} to {Math.min(historyPage * HISTORY_PAGE_SIZE, history.length)} of {history.length} entries</p><div className="flex items-center gap-2"><button aria-label="Previous page" onClick={() => setHistoryPage((page) => Math.max(1, page - 1))} disabled={historyPage === 1} className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={17} /></button><span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 font-semibold text-white">{historyPage}</span><button aria-label="Next page" onClick={() => setHistoryPage((page) => Math.min(totalHistoryPages, page + 1))} disabled={historyPage === totalHistoryPages} className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={17} /></button></div></div>
          </>
        )}
      </section>
    </div>
  )
}

export default CommissionManagement
