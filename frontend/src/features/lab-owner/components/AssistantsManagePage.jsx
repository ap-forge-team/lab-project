import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Search, Filter, ChevronRight, Eye, Pencil, Trash2, X, MoreVertical, Phone, Mail, Calendar, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/ui/data-table'
import { assistantColumns } from '@/features/lab-owner/columns/assistants.columns'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Loader'
import Can from '@/components/Can'
import { createLabAssistant, updateUser, deleteUser } from '@/services/user.service'

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, change, changeType }) => (
  <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      {change !== undefined && (
        <p className={`text-[10px] mt-1 font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-500'}`}>
          {changeType === 'up' ? '↑' : '↓'} {change} from last month
        </p>
      )}
    </div>
  </div>
)

const AssistantsManagePage = ({ assistants, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const emptyForm = { name: '', email: '', phone: '', password: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

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
    if (statusFilter) {
      const isActive = statusFilter === 'active'
      result = result.filter((a) => (a.role !== 'inactive') === isActive)
    }
    return result
  }, [assistants, search, statusFilter])

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
      await createLabAssistant({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
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
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      }
      await updateUser(selectedAssistant._id, payload)
      toast.success('Assistant updated successfully')
      setShowEditModal(false)
      setSelectedAssistant(null)
      setForm(emptyForm)
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

  const handleCloseAdd = () => { setShowAddModal(false); setForm(emptyForm); setErrors({}) }
  const handleCloseEdit = () => { setShowEditModal(false); setSelectedAssistant(null); setForm(emptyForm); setErrors({}) }
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

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate('/lab-owner')} className="hover:text-foreground transition">Dashboard</button>
        <ChevronRight size={15} />
        <span className="text-foreground font-medium">Assistants</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistants</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your lab assistants and their assignments.</p>
        </div>
        <Can resource="lab_assistants" action="create">
          <Button className="flex items-center gap-2 shrink-0" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Assistant
          </Button>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Assistants" value={stats.total} change="8.2%" changeType="up" />
        <StatCard icon={Shield} iconBg="bg-green-100" iconColor="text-green-600" label="Active Assistants" value={stats.active} change="5.1%" changeType="up" />
        <StatCard icon={Shield} iconBg="bg-amber-100" iconColor="text-amber-600" label="Inactive Assistants" value={stats.inactive} change="2.3%" changeType="down" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search assistant, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white min-w-[130px]">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Assistants Table */}
      <div className="bg-white border border-border rounded-xl">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Spinner /></div>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-destructive">Unable to load assistants. Please try again.</p>
        ) : filteredAssistants.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No assistants found.</p>
        ) : (
          <DataTable columns={columnsWithActions} data={filteredAssistants} enablePagination={true} enableSorting={true} pageSize={10} rowClassName="hover:bg-blue-50/50" />
        )}
      </div>

      {!isLoading && filteredAssistants.length > 0 && (
        <p className="text-xs text-muted-foreground">Showing 1 to {Math.min(10, filteredAssistants.length)} of {filteredAssistants.length} assistants</p>
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
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={handleCloseEdit} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
              <Button onClick={handleEditSave} disabled={saving} loading={saving}>Update</Button>
            </div>
          </div>
        </div>
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
    </div>
  )
}

export default AssistantsManagePage
