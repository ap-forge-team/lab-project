import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Search, Download, ChevronRight, Eye, EyeOff, Pencil, Trash2, ChevronDown, Calendar, X, MoreVertical, Edit2, Shield, Mail, Phone, Lock, MapPin, UserCheck, UserX, ArrowDown, ArrowUp, ChevronsUpDown, Upload, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import { Spinner } from '@/components/ui/Loader'
import Can from '@/components/Can'
import { createLabOwner, createLabAssistant, updateUser, deleteUser } from '@/services/user.service'

const PAGE_SIZE = 10
const PAGE_SIZES = [10, 25, 50]

const SortableHeader = ({ title, sortKey, sortConfig, onSort, onHide }) => {
  const [open, setOpen] = useState(false)
  const currentSort = sortConfig?.key === sortKey ? sortConfig.direction : null

  const handleSort = (direction) => {
    onSort(sortKey, direction)
    setOpen(false)
  }

  return (
    <th className="px-4 py-3 relative">
      <div className="flex items-center gap-1">
        <span>{title}</span>
        <button type="button" onClick={() => setOpen(!open)} className="p-0.5 rounded hover:bg-accent">
          {currentSort === 'asc' ? <ArrowUp size={14} /> : currentSort === 'desc' ? <ArrowDown size={14} /> : <ChevronsUpDown size={14} className="text-muted-foreground" />}
        </button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-[100] min-w-[120px]">
            <button onClick={() => handleSort('asc')} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <ArrowUp size={14} /> Asc
            </button>
            <button onClick={() => handleSort('desc')} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <ArrowDown size={14} /> Desc
            </button>
            {onHide && (
              <button onClick={() => { onHide(); setOpen(false) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <EyeOff size={14} /> Hide
              </button>
            )}
          </div>
        </>
      )}
    </th>
  )
}

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

const UsersManagePage = ({ users, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [hiddenColumns, setHiddenColumns] = useState({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleSort = useCallback((key, direction) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === direction) {
        return { key: null, direction: null }
      }
      return { key, direction }
    })
  }, [])

  const getSortValue = useCallback((user, key) => {
    switch (key) {
      case 'name': return (user.name || '').toLowerCase()
      case 'role': return (user.role || '').toLowerCase()
      case 'phone': return (user.phone || '').toLowerCase()
      case 'status': return user.role === 'inactive' ? 'inactive' : 'active'
      case 'registered': return user.createdAt || ''
      case 'lastLogin': return user.updatedAt || ''
      default: return ''
    }
  }, [])
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient',
  })
  const [errors, setErrors] = useState({})
  const [idProofFile, setIdProofFile] = useState(null)
  const [otherDocsFiles, setOtherDocsFiles] = useState([])

  const filterCategories = useMemo(() => {
    const nameOptions = (users || []).map((u) => ({ value: u.name, label: u.name }))
    const phoneOptions = (users || []).filter((u) => u.phone).map((u) => ({ value: u.phone, label: u.phone }))
    return [
      {
        key: 'name',
        label: 'User',
        type: 'search-checkbox',
        searchPlaceholder: 'Search users...',
        options: nameOptions,
      },
      {
        key: 'role',
        label: 'Role',
        type: 'checkbox',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'lab_owner', label: 'Lab Owner' },
          { value: 'lab_assistant', label: 'Lab Technician' },
          { value: 'patient', label: 'Customer' },
        ],
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
        key: 'registeredDate',
        label: 'Registered On',
        type: 'date-range',
      },
    ]
  }, [users])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      if (val && typeof val === 'object' && (val.start || val.end)) return count + 1
      if (val) return count + 1
      return count
    }, 0)
  }, [activeFilters])

  const filteredUsers = useMemo(() => {
    let result = users || []
    const term = search.trim().toLowerCase()
    if (term) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.phone?.includes(term)
      )
    }
    if (activeFilters.name?.length) {
      result = result.filter((u) => activeFilters.name.includes(u.name))
    }
    if (activeFilters.role?.length) {
      result = result.filter((u) => activeFilters.role.includes(u.role))
    }
    if (activeFilters.phone?.length) {
      result = result.filter((u) => activeFilters.phone.includes(u.phone))
    }
    if (activeFilters.status?.length) {
      result = result.filter((u) => {
        const isActive = u.role !== 'inactive'
        return activeFilters.status.includes(isActive ? 'active' : 'inactive')
      })
    }
    if (activeFilters.registeredDate?.start) {
      result = result.filter((u) => new Date(u.createdAt) >= new Date(activeFilters.registeredDate.start))
    }
    if (activeFilters.registeredDate?.end) {
      result = result.filter((u) => {
        const end = new Date(activeFilters.registeredDate.end)
        end.setHours(23, 59, 59, 999)
        return new Date(u.createdAt) <= end
      })
    }

    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const aVal = getSortValue(a, sortConfig.key)
        const bVal = getSortValue(b, sortConfig.key)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [users, search, activeFilters, sortConfig, getSortValue])

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters)
  }

  const stats = useMemo(() => {
    const list = users || []
    const now = new Date()
    const thisMonth = list.filter((u) => {
      const d = new Date(u.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      total: list.length,
      active: list.filter((u) => u.role !== 'inactive').length,
      inactive: list.filter((u) => u.role === 'inactive').length,
      admins: list.filter((u) => u.role === 'admin').length,
      newThisMonth: thisMonth.length,
    }
  }, [users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  const openMenu = menuOpen && typeof menuOpen === 'object' ? menuOpen : null

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit number'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (!form.role) errs.role = 'Role is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }
      if (form.role === 'lab_owner') {
        await createLabOwner({ ...payload, servicePincodes: [], labAddress: '' })
      } else if (form.role === 'lab_assistant') {
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
      } else {
        await createLabOwner(payload)
      }
      toast.success('User created successfully')
      setShowAddModal(false)
      setForm({ name: '', email: '', phone: '', password: '', role: 'patient' })
      setIdProofFile(null)
      setOtherDocsFiles([])
      setErrors({})
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setForm({ name: '', email: '', phone: '', password: '', role: 'patient' })
    setIdProofFile(null)
    setOtherDocsFiles([])
    setErrors({})
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleView = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
    setMenuOpen(null)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'patient',
    })
    setErrors({})
    setShowEditModal(true)
    setMenuOpen(null)
  }

  const handleDelete = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
    setMenuOpen(null)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteUser(selectedUser._id)
      toast.success('User deleted successfully')
      setShowDeleteModal(false)
      setSelectedUser(null)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrors({
        name: !form.name.trim() ? 'Name is required' : '',
        email: !form.email.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email' : '',
        phone: !form.phone.trim() ? 'Phone is required' : !/^[6-9]\d{9}$/.test(form.phone) ? 'Enter a valid 10-digit number' : '',
      })
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      }
      if (form.password) payload.password = form.password
      await updateUser(selectedUser._id, payload)
      toast.success('User updated successfully')
      setShowEditModal(false)
      setSelectedUser(null)
      setForm({ name: '', email: '', phone: '', password: '', role: 'patient' })
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const roleBadgeColor = {
    admin: 'bg-purple-100 text-purple-700',
    lab_owner: 'bg-blue-100 text-blue-700',
    lab_assistant: 'bg-amber-100 text-amber-700',
    patient: 'bg-gray-100 text-gray-600',
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
            <button
              onClick={(e) => { e.stopPropagation(); handleView(openMenu.user); setMenuOpen(null) }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
            >
              <Eye size={14} /> View
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(openMenu.user) }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(openMenu.user) }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <Can resource="users" action="create">
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} />
          </Button>
        </Can>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all users and their access</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" />
          </div>
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <Can resource="users" action="create">
            <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
              <UserPlus size={16} />
              Add New User
            </Button>
          </Can>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <FilterButton
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
          }}
          activeCount={activeFilterCount}
        />
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
              title="Total Users"
              value={stats.total}
              detailTop="All"
              detailBottom="users"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={UserCheck}
              borderColor="border-emerald-200"
              iconColor="text-emerald-500"
              cardBg="bg-emerald-50"
              title="Active Users"
              value={stats.active}
              detailTop="Currently"
              detailBottom="active"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={UserX}
              borderColor="border-red-200"
              iconColor="text-red-500"
              cardBg="bg-red-50"
              title="Inactive Users"
              value={stats.inactive}
              detailTop="Currently"
              detailBottom="inactive"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Shield}
              borderColor="border-amber-200"
              iconColor="text-amber-500"
              cardBg="bg-amber-50"
              title="Admins"
              value={stats.admins}
              detailTop="System"
              detailBottom="admins"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={UserPlus}
              borderColor="border-purple-200"
              iconColor="text-purple-500"
              cardBg="bg-purple-50"
              title="New This Month"
              value={stats.newThisMonth}
              detailTop="Recent"
              detailBottom="registrations"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 sm:hidden">
        <span className="w-2 h-2 rounded-full bg-primary"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading users…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load users. Please try again.</div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No users found.</div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
          <div className="rounded-xl border border-border bg-white">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                <tr>
                  <SortableHeader title="User" sortKey="name" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, name: true }))} />
                  <SortableHeader title="Role" sortKey="role" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, role: true }))} />
                  <SortableHeader title="Phone" sortKey="phone" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, phone: true }))} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, status: true }))} />
                  <SortableHeader title="Registered On" sortKey="registered" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, registered: true }))} />
                  <SortableHeader title="Last Login" sortKey="lastLogin" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, lastLogin: true }))} />
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => {
                  const isActive = user.role !== 'inactive'
                  const roleBadgeColor = {
                    admin: 'bg-purple-100 text-purple-700',
                    lab_owner: 'bg-blue-100 text-blue-700',
                    lab_assistant: 'bg-amber-100 text-amber-700',
                    patient: 'bg-gray-100 text-gray-600',
                  }
                  const initials = user.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
                  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500']
                  let hash = 0
                  for (let i = 0; i < (user.name || '').length; i++) hash = (hash * 31 + (user.name || '').charCodeAt(i)) >>> 0
                  const avatarColor = avatarColors[hash % avatarColors.length]
                  const formatDate = (dateStr) => {
                    if (!dateStr) return '—'
                    const d = new Date(dateStr)
                    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  }
                  const formatLastLogin = (dateStr) => {
                    if (!dateStr) return '—'
                    const d = new Date(dateStr)
                    const now = new Date()
                    const diffMs = now.getTime() - d.getTime()
                    const diffMins = Math.floor(diffMs / 60000)
                    const diffHours = Math.floor(diffMins / 60)
                    const diffDays = Math.floor(diffHours / 24)
                    if (diffMins < 1) return 'Just now'
                    if (diffMins < 60) return `${diffMins}m ago`
                    if (diffHours < 24) return `${diffHours}h ago`
                    if (diffDays === 1) return 'Yesterday'
                    if (diffDays < 7) return `${diffDays} days ago`
                    return formatDate(dateStr)
                  }
                  return (
                    <tr key={user._id} onClick={() => handleView(user)} className="cursor-pointer border-t border-border transition hover:bg-accent/40">
                      {!hiddenColumns.name && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor} text-white font-semibold text-xs`}>
                              {initials}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.role && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${roleBadgeColor[user.role] || 'bg-gray-100 text-gray-600'}`}>
                            {user.role?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      )}
                      {!hiddenColumns.phone && (
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{user.phone || '—'}</span>
                        </td>
                      )}
                      {!hiddenColumns.status && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      )}
                      {!hiddenColumns.registered && (
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</span>
                        </td>
                      )}
                      {!hiddenColumns.lastLogin && (
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{formatLastLogin(user.updatedAt)}</span>
                        </td>
                      )}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (menuOpen?.id === user._id) {
                                setMenuOpen(null)
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setMenuOpen({ id: user._id, user, top: rect.bottom + 4, left: rect.right - 130 })
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded transition"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredUsers.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="users"
        />
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Add User</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Create a new user account.</p>
              </div>
              <button onClick={handleCloseModal} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Input label="Full Name" name="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. John Doe" error={errors.name} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. john@example.com" error={errors.email} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 9876543210" inputMode="numeric" maxLength={10} error={errors.phone} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 6 characters" error={errors.password} required />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => handleChange('role', e.target.value)} className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-card">
                  <option value="patient">Customer</option>
                  <option value="lab_assistant">Lab Technician</option>
                </select>
                {errors.role && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.role}</p>}
              </div>
              {/* Document Uploads - Only for Lab Assistant */}
              {form.role === 'lab_assistant' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Documents</p>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">ID Proof</label>
                    <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                      />
                      <Upload size={16} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {idProofFile ? idProofFile.name : 'Upload ID proof (PDF, JPG, PNG)'}
                      </span>
                    </label>
                    {idProofFile && (
                      <button onClick={() => setIdProofFile(null)} className="text-[10px] text-red-500 mt-1 hover:underline">Remove</button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Other Documents (max 5)</label>
                    <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                        className="hidden"
                        onChange={(e) => setOtherDocsFiles(Array.from(e.target.files || []))}
                      />
                      <Upload size={16} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {otherDocsFiles.length > 0 ? `${otherDocsFiles.length}/5 file(s) selected` : 'Upload additional documents'}
                      </span>
                    </label>
                    {otherDocsFiles.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {otherDocsFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground truncate">{f.name}</span>
                            <button onClick={() => setOtherDocsFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-[10px] text-red-500 hover:underline">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
              <Button onClick={handleSave} disabled={saving} loading={saving}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">User Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">View user account information.</p>
              </div>
              <button onClick={() => { setShowViewModal(false); setSelectedUser(null) }} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{selectedUser.name}</h4>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize mt-1 ${roleBadgeColor[selectedUser.role] || 'bg-gray-100 text-gray-600'}`}>
                    {selectedUser.role?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{selectedUser.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Shield size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Role</p>
                    <p className="text-sm text-foreground capitalize">{selectedUser.role?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Registered On</p>
                    <p className="text-sm text-foreground">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
                {/* Documents */}
                {(selectedUser.idProof || selectedUser.otherDocuments?.length > 0 || selectedUser.labCertificate || selectedUser.labRegistration) && (
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-2">Documents</p>
                    <div className="space-y-1.5">
                      {selectedUser.idProof && (
                        <a href={selectedUser.idProof} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <FileText size={12} /> ID Proof
                        </a>
                      )}
                      {selectedUser.labCertificate && (
                        <a href={selectedUser.labCertificate} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <FileText size={12} /> Lab Certificate
                        </a>
                      )}
                      {selectedUser.labRegistration && (
                        <a href={selectedUser.labRegistration} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <FileText size={12} /> Lab Registration
                        </a>
                      )}
                      {selectedUser.otherDocuments?.map((doc, i) => (
                        <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <FileText size={12} /> {doc.name || 'Document'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button
                onClick={() => { setShowViewModal(false); setSelectedUser(null) }}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Edit User</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update user account details.</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setSelectedUser(null) }} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. John Doe"
                error={errors.name}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. john@example.com"
                error={errors.email}
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. 9876543210"
                inputMode="numeric"
                maxLength={10}
                error={errors.phone}
                required
              />
              <Input
                label="Password (leave blank to keep current)"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 6 characters"
                error={errors.password}
              />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-card"
                >
                  <option value="patient">Customer</option>
                  <option value="lab_assistant">Lab Technician</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button
                onClick={() => { setShowEditModal(false); setSelectedUser(null) }}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition"
              >
                Cancel
              </button>
              <Button onClick={handleEditSave} disabled={saving} loading={saving}>
                Update
              </Button>
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

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedUser(null) }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default UsersManagePage
