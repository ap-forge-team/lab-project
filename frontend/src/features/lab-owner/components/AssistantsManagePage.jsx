import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Search, ChevronRight, Eye, Pencil, Trash2, X, MoreVertical, Phone, Mail, Calendar, Shield, Upload, FileText, List, Grid2X2 } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/ui/data-table'
import { assistantColumns } from '@/features/lab-owner/columns/assistants.columns'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import { Spinner } from '@/components/ui/Loader'
import Can from '@/components/Can'
import { createLabAssistant, updateUser, deleteUser } from '@/services/user.service'
import useResponsiveView from '@/hooks/useResponsiveView'

const StatCard = ({ icon: Icon, borderColor, iconColor, cardBg, title, value, detailTop, detailBottom }) => (
  <div className={`rounded-2xl border ${borderColor} px-4 py-3 ${cardBg}`}>
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${borderColor} ${iconColor}`}>
        {React.createElement(Icon, { size: 18 })}
      </span>
      <div className="min-w-0 flex-1 space-y-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
      </div>
      <div className="h-8 w-px shrink-0 self-stretch my-auto bg-border" />
      <div className="shrink-0 text-right leading-tight">
        <p className="text-xs text-muted-foreground">{detailTop}</p>
        <p className="text-xs text-muted-foreground">{detailBottom}</p>
      </div>
    </div>
  </div>
)

const AssistantsManagePage = ({ assistants, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [view, setView] = useResponsiveView()

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  // Form state
  const emptyForm = { name: '', email: '', phone: '', password: '', verificationDoc: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [idProofFile, setIdProofFile] = useState(null)
  const [otherDocsFiles, setOtherDocsFiles] = useState([])
  const [editIdProofFile, setEditIdProofFile] = useState(null)
  const [editOtherDocsFiles, setEditOtherDocsFiles] = useState([])

  const filterCategories = useMemo(() => {
    const nameOptions = (assistants || []).map((a) => ({ value: a.name, label: a.name }))
    const emailOptions = (assistants || []).map((a) => ({ value: a.email, label: a.email }))
    const phoneOptions = (assistants || []).filter((a) => a.phone).map((a) => ({ value: a.phone, label: a.phone }))
    return [
      {
        key: 'name',
        label: 'Assistant',
        type: 'search-checkbox',
        searchPlaceholder: 'Search assistants...',
        options: nameOptions,
      },
      {
        key: 'email',
        label: 'Email',
        type: 'search-checkbox',
        searchPlaceholder: 'Search emails...',
        options: emailOptions,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'search-checkbox',
        searchPlaceholder: 'Search phones...',
        options: phoneOptions,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'checkbox',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        key: 'createdDate',
        label: 'Created',
        type: 'date-range',
      },
    ]
  }, [assistants])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      if (val && typeof val === 'object' && (val.start || val.end)) return count + 1
      if (val) return count + 1
      return count
    }, 0)
  }, [activeFilters])

  const filteredAssistants = useMemo(() => {
    let result = assistants || []
    const term = search.trim().toLowerCase()
    if (term) {
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(term) ||
          a.email?.toLowerCase().includes(term) ||
          a.phone?.includes(term)
      )
    }
    if (activeFilters.name?.length) {
      result = result.filter((a) => activeFilters.name.includes(a.name))
    }
    if (activeFilters.email?.length) {
      result = result.filter((a) => activeFilters.email.includes(a.email))
    }
    if (activeFilters.phone?.length) {
      result = result.filter((a) => activeFilters.phone.includes(a.phone))
    }
    if (activeFilters.status?.length) {
      result = result.filter((a) => {
        const isActive = a.role !== 'inactive'
        return activeFilters.status.includes(isActive ? 'active' : 'inactive')
      })
    }
    if (activeFilters.createdDate?.start) {
      result = result.filter((a) => new Date(a.createdAt) >= new Date(activeFilters.createdDate.start))
    }
    if (activeFilters.createdDate?.end) {
      result = result.filter((a) => {
        const end = new Date(activeFilters.createdDate.end)
        end.setHours(23, 59, 59, 999)
        return new Date(a.createdAt) <= end
      })
    }
    return result
  }, [assistants, search, activeFilters])

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters)
  }

  const stats = useMemo(() => {
    const list = assistants || []
    return {
      total: list.length,
      active: list.filter((a) => a.role !== 'inactive').length,
      inactive: list.filter((a) => a.role === 'inactive').length,
    }
  }, [assistants])

  const columnsWithActions = useMemo(() => {
    return [...assistantColumns, {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const assistant = row.original
        return (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (menuOpen?.id === assistant._id) {
                  setMenuOpen(null)
                } else {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setMenuOpen({ id: assistant._id, assistant, top: rect.bottom + 4, left: rect.right - 130 })
                }
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded transition"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        )
      },
    }]
  }, [menuOpen])

  const openMenu = menuOpen && typeof menuOpen === 'object' ? menuOpen : null

  // Handlers
  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit number'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Min 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      formData.append('password', form.password)
      if (idProofFile) {
        formData.append('idProof', idProofFile)
      }
      if (otherDocsFiles.length > 0) {
        otherDocsFiles.forEach((file) => {
          formData.append('otherDocuments', file)
        })
      }
      await createLabAssistant(formData)
      toast.success('Assistant created successfully')
      setShowAddModal(false)
      setForm(emptyForm)
      setErrors({})
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assistant')
    } finally {
      setSaving(false)
    }
  }

  const handleView = (assistant) => { setSelectedAssistant(assistant); setShowViewModal(true); setMenuOpen(null) }
  const handleEdit = (assistant) => {
    setSelectedAssistant(assistant)
    setForm({
      name: assistant.name || '',
      email: assistant.email || '',
      phone: assistant.phone || '',
      password: '',
    })
    setErrors({})
    setShowEditModal(true)
    setMenuOpen(null)
  }
  const handleDelete = (assistant) => { setSelectedAssistant(assistant); setShowDeleteModal(true); setMenuOpen(null) }

  const handleEditSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrors({
        name: !form.name.trim() ? 'Name is required' : '',
        email: !form.email.trim() ? 'Email is required' : '',
        phone: !form.phone.trim() ? 'Phone is required' : '',
      })
      return
    }
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      if (editIdProofFile) {
        formData.append('idProof', editIdProofFile)
      }
      if (editOtherDocsFiles.length > 0) {
        editOtherDocsFiles.forEach((file) => {
          formData.append('otherDocuments', file)
        })
      }
      await updateUser(selectedAssistant._id, formData)
      toast.success('Assistant updated successfully')
      setShowEditModal(false)
      setSelectedAssistant(null)
      setForm(emptyForm)
      setEditIdProofFile(null)
      setEditOtherDocsFiles([])
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update assistant')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteUser(selectedAssistant._id)
      toast.success('Assistant deleted successfully')
      setShowDeleteModal(false)
      setSelectedAssistant(null)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete assistant')
    } finally {
      setDeleting(false)
    }
  }

  const handleCloseAdd = () => { setShowAddModal(false); setForm(emptyForm); setIdProofFile(null); setOtherDocsFiles([]); setErrors({}) }
  const handleCloseEdit = () => { setShowEditModal(false); setSelectedAssistant(null); setForm(emptyForm); setErrors({}); setEditIdProofFile(null); setEditOtherDocsFiles([]) }
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="space-y-6">
      {/* Fixed dropdown menu */}
      {openMenu && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setMenuOpen(null)} />
          <div
            className="fixed bg-white border border-border rounded-lg shadow-lg py-1 z-[100] min-w-[140px]"
            style={{ top: openMenu.top, left: openMenu.left }}
          >
            <button onClick={(e) => { e.stopPropagation(); handleView(openMenu.assistant) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Eye size={14} /> View
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleEdit(openMenu.assistant) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(openMenu.assistant) }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}

      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">Assistants</h1>
        <Can resource="lab_assistants" action="create">
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
          </Button>
        </Can>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistants</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your lab assistants and their assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search assistant, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" />
          </div>
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <div className="flex items-center rounded-lg border border-border p-1">
            <Tooltip title="Grid View" arrow placement="top">
              <button type="button" aria-label="Grid view" onClick={() => setView('card')} className={`rounded p-1.5 ${view === 'card' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
            </Tooltip>
            <Tooltip title="Table View" arrow placement="top">
              <button type="button" aria-label="Table view" onClick={() => setView('table')} className={`rounded p-1.5 ${view === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
            </Tooltip>
          </div>
          <Can resource="lab_assistants" action="create">
            <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add Assistant
            </Button>
          </Can>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search assistant, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <FilterButton
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
          }}
          activeCount={activeFilterCount}
        />
        <div className="flex items-center rounded-lg border border-border p-1">
          <Tooltip title="Grid View" arrow placement="top">
            <button type="button" aria-label="Grid view" onClick={() => setView('card')} className={`rounded p-1.5 ${view === 'card' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
          </Tooltip>
          <Tooltip title="Table View" arrow placement="top">
            <button type="button" aria-label="Table view" onClick={() => setView('table')} className={`rounded p-1.5 ${view === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
          </Tooltip>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Users}
              borderColor="border-blue-200"
              iconColor="text-blue-500"
              cardBg="bg-blue-50"
              title="Total Assistants"
              value={stats.total}
              detailTop={`${stats.active} active`}
              detailBottom="assistants"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Shield}
              borderColor="border-emerald-200"
              iconColor="text-emerald-500"
              cardBg="bg-emerald-50"
              title="Active"
              value={stats.active}
              detailTop={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%`}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Shield}
              borderColor="border-amber-200"
              iconColor="text-amber-500"
              cardBg="bg-amber-50"
              title="Inactive"
              value={stats.inactive}
              detailTop={`${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%`}
              detailBottom="of total"
            />
          </div>
        </div>
      </div>

      {/* Assistants Table / Grid */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-xl p-12 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="bg-white border border-border rounded-xl p-8 text-center text-sm text-destructive">Unable to load assistants. Please try again.</div>
      ) : filteredAssistants.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">No assistants found.</div>
      ) : view === 'table' ? (
        <>
          <div className="bg-white border border-border rounded-xl">
            <DataTable columns={columnsWithActions} data={filteredAssistants} enablePagination={true} enableSorting={true} pageSize={10} rowClassName="hover:bg-blue-50/50" />
          </div>
          <p className="text-xs text-muted-foreground">Showing 1 to {Math.min(10, filteredAssistants.length)} of {filteredAssistants.length} assistants</p>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssistants.map((assistant) => {
            const initials = assistant.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AS'
            const isActive = assistant.role !== 'inactive'
            const formattedDate = assistant.createdAt
              ? new Date(assistant.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'
            return (
              <article key={assistant._id} onClick={() => { setSelectedAssistant(assistant); setShowViewModal(true) }} className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden cursor-pointer">
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-semibold text-xs">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate" title={assistant.name}>{assistant.name}</h3>
                        <p className="text-xs text-muted-foreground">{assistant.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-4 pt-3">
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium text-foreground">{assistant.phone || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">{formattedDate}</span>
                    </div>
                  </dl>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      NABL Accredited Labs
                    </span>
                    <div className="flex items-center gap-1">
                      <Can resource="lab_assistants" action="view">
                        <Tooltip title="View" arrow placement="top">
                          <button type="button" onClick={() => { setSelectedAssistant(assistant); setShowViewModal(true) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Eye size={14} /></button>
                        </Tooltip>
                      </Can>
                      <Can resource="lab_assistants" action="update">
                        <Tooltip title="Edit" arrow placement="top">
                          <button type="button" onClick={() => handleEdit(assistant)} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Pencil size={14} /></button>
                        </Tooltip>
                      </Can>
                      <Can resource="lab_assistants" action="delete">
                        <Tooltip title="Delete" arrow placement="top">
                          <button type="button" onClick={() => { setSelectedAssistant(assistant); setShowDeleteModal(true) }} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                        </Tooltip>
                      </Can>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Add Assistant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Add Assistant</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Create a new lab assistant account.</p>
              </div>
              <button onClick={handleCloseAdd} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <Input label="Full Name" name="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. John Doe" error={errors.name} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. john@example.com" error={errors.email} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 9876543210" inputMode="numeric" maxLength={10} error={errors.phone} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 6 characters" error={errors.password} required />
              {/* Document Uploads */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Documents</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                    <div className="p-3 pb-0">
                      <span className="text-xs font-medium text-muted-foreground">ID Proof</span>
                    </div>
                    <div className="p-3 pt-2">
                      <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                        />
                        <Upload size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {idProofFile ? idProofFile.name : 'Upload ID proof'}
                        </span>
                      </label>
                    </div>
                    {idProofFile && (
                      <div className="px-3 pb-3 pt-0 flex items-center justify-between border-t border-border mt-1">
                        <span className="text-[10px] text-muted-foreground truncate">{idProofFile.name}</span>
                        <button onClick={() => setIdProofFile(null)} className="text-[10px] text-red-500 hover:underline shrink-0">Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                    <div className="p-3 pb-0">
                      <span className="text-xs font-medium text-muted-foreground">Other Documents (max 5)</span>
                    </div>
                    <div className="p-3 pt-2">
                      <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const newFiles = Array.from(e.target.files || [])
                            setOtherDocsFiles((prev) => {
                              const combined = [...prev, ...newFiles]
                              return combined.slice(0, 5)
                            })
                          }}
                        />
                        <Upload size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {otherDocsFiles.length > 0 ? `${otherDocsFiles.length}/5 file(s) selected` : 'Upload documents'}
                        </span>
                      </label>
                    </div>
                    {otherDocsFiles.length > 0 && (
                      <div className="px-3 pb-3 pt-0 border-t border-border mt-1 space-y-1.5">
                        {otherDocsFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground truncate">{f.name}</span>
                            <button onClick={() => setOtherDocsFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-[10px] text-red-500 hover:underline shrink-0">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={handleCloseAdd} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
              <Button onClick={handleSave} disabled={saving} loading={saving}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Assistant Modal */}
      {showViewModal && selectedAssistant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Assistant Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">View assistant information.</p>
              </div>
              <button onClick={() => { setShowViewModal(false); setSelectedAssistant(null) }} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {selectedAssistant.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AS'}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{selectedAssistant.name}</h4>
                  <p className="text-xs text-muted-foreground">ID: {selectedAssistant._id.slice(-6)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Email</p><p className="text-sm text-foreground">{selectedAssistant.email}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Phone</p><p className="text-sm text-foreground">{selectedAssistant.phone || '—'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Shield size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Status</p><p className="text-sm text-foreground">{selectedAssistant.role !== 'inactive' ? 'Active' : 'Inactive'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Registered On</p><p className="text-sm text-foreground">{selectedAssistant.createdAt ? new Date(selectedAssistant.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p></div>
                </div>
                {/* Documents */}
                {(selectedAssistant.idProof || selectedAssistant.otherDocuments?.length > 0) && (
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-2">Documents</p>
                    <div className="space-y-3">
                      {selectedAssistant.idProof && (
                        <div>
                          <p className="text-[11px] font-medium text-foreground mb-1">ID Proof</p>
                          {/\.(jpg|jpeg|png|webp)$/i.test(selectedAssistant.idProof) ? (
                            <button type="button" onClick={() => setLightbox(selectedAssistant.idProof)} className="block">
                              <img src={selectedAssistant.idProof} alt="ID Proof" className="h-16 w-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition" />
                            </button>
                          ) : (
                            <a href={selectedAssistant.idProof} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                              <FileText size={12} /> View Document
                            </a>
                          )}
                        </div>
                      )}
                      {selectedAssistant.otherDocuments?.map((doc, i) => (
                        <div key={i}>
                          <p className="text-[11px] font-medium text-foreground mb-1">{doc.name || 'Document'}</p>
                          {/\.(jpg|jpeg|png|webp)$/i.test(doc.url) ? (
                            <button type="button" onClick={() => setLightbox(doc.url)} className="block">
                              <img src={doc.url} alt={doc.name || 'Document'} className="h-16 w-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition" />
                            </button>
                          ) : (
                            <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                              <FileText size={12} /> {doc.name || 'View Document'}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => { setShowViewModal(false); setSelectedAssistant(null) }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assistant Modal */}
      {showEditModal && selectedAssistant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Edit Assistant</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update assistant details.</p>
              </div>
              <button onClick={handleCloseEdit} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <Input label="Full Name" name="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. John Doe" error={errors.name} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. john@example.com" error={errors.email} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 9876543210" inputMode="numeric" maxLength={10} error={errors.phone} required />
              {/* Document Uploads */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Documents</p>
                {selectedAssistant.idProof && !editIdProofFile && (
                  <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                    <div className="p-3 pb-0">
                      <span className="text-xs font-medium text-muted-foreground">ID Proof (current)</span>
                    </div>
                    <div className="p-3 pt-2">
                      {/\.(jpg|jpeg|png|webp)$/i.test(selectedAssistant.idProof) ? (
                        <a href={selectedAssistant.idProof} target="_blank" rel="noreferrer">
                          <img src={selectedAssistant.idProof} alt="ID Proof" className="w-full max-h-32 object-cover rounded-lg border border-border" />
                        </a>
                      ) : (
                        <a href={selectedAssistant.idProof} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <FileText size={12} /> View Document
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                  <div className="p-3 pb-0">
                    <span className="text-xs font-medium text-muted-foreground">{selectedAssistant.idProof ? 'Replace ID Proof' : 'ID Proof'}</span>
                  </div>
                  <div className="p-3 pt-2">
                    <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => setEditIdProofFile(e.target.files?.[0] || null)}
                      />
                      <Upload size={16} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {editIdProofFile ? editIdProofFile.name : 'Upload ID proof'}
                      </span>
                    </label>
                  </div>
                  {editIdProofFile && (
                    <div className="px-3 pb-3 pt-0 flex items-center justify-between border-t border-border mt-1">
                      <span className="text-[10px] text-muted-foreground truncate">{editIdProofFile.name}</span>
                      <button onClick={() => setEditIdProofFile(null)} className="text-[10px] text-red-500 hover:underline shrink-0">Remove</button>
                    </div>
                  )}
                </div>
                {selectedAssistant.otherDocuments?.length > 0 && (
                  <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                    <div className="p-3 pb-0">
                      <span className="text-xs font-medium text-muted-foreground">Other Documents (current)</span>
                    </div>
                    <div className="p-3 pt-2 space-y-2">
                      {selectedAssistant.otherDocuments.map((doc, i) => (
                        <div key={i}>
                          <p className="text-[11px] font-medium text-foreground mb-1">{doc.name || 'Document'}</p>
                          {/\.(jpg|jpeg|png|webp)$/i.test(doc.url) ? (
                            <a href={doc.url} target="_blank" rel="noreferrer">
                              <img src={doc.url} alt={doc.name || 'Document'} className="w-full max-h-32 object-cover rounded-lg border border-border" />
                            </a>
                          ) : (
                            <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                              <FileText size={12} /> View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                  <div className="p-3 pb-0">
                    <span className="text-xs font-medium text-muted-foreground">Add Other Documents (max 5)</span>
                  </div>
                  <div className="p-3 pt-2">
                    <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || [])
                          setEditOtherDocsFiles((prev) => {
                            const combined = [...prev, ...newFiles]
                            return combined.slice(0, 5)
                          })
                        }}
                      />
                      <Upload size={16} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {editOtherDocsFiles.length > 0 ? `${editOtherDocsFiles.length}/5 file(s) selected` : 'Upload documents'}
                      </span>
                    </label>
                  </div>
                  {editOtherDocsFiles.length > 0 && (
                    <div className="px-3 pb-3 pt-0 space-y-1 border-t border-border mt-1">
                      {editOtherDocsFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground truncate">{file.name}</span>
                          <button onClick={() => setEditOtherDocsFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-[10px] text-red-500 hover:underline shrink-0">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={handleCloseEdit} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
              <Button onClick={handleEditSave} disabled={saving} loading={saving}>Update</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {filterPanelOpen && (
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Filters"
          categories={filterCategories}
          activeFilters={activeFilters}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedAssistant(null) }}
        onConfirm={handleConfirmDelete}
        title="Delete Assistant"
        message={`Are you sure you want to delete "${selectedAssistant?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />

      {/* Image Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white hover:text-gray-300"><X size={28} /></button>
          <img src={lightbox} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default AssistantsManagePage
