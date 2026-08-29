import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Search, Download, ChevronRight, Eye, Pencil, Trash2, ChevronDown, Calendar, X, MoreVertical, Edit2, Shield, Mail, Phone, Lock, MapPin } from 'lucide-react'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/ui/data-table'
import { userColumns } from '@/features/admin/columns/users.columns'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import { Spinner } from '@/components/ui/Loader'
import Can from '@/components/Can'
import { createLabOwner, createLabAssistant, updateUser, deleteUser } from '@/services/user.service'

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

const UsersManagePage = ({ users, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
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
    return result
  }, [users, search, activeFilters])

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

  const columnsWithActions = useMemo(() => {
    return [...userColumns, {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="relative">
            <button
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
        )
      },
    }]
  }, [menuOpen])

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
        await createLabAssistant(payload)
      } else {
        await createLabOwner(payload)
      }
      toast.success('User created successfully')
      setShowAddModal(false)
      setForm({ name: '', email: '', phone: '', password: '', role: 'patient' })
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all users and their access</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Total Users"
          value={stats.total}
          change="12.5%"
          changeType="up"
        />
        <StatCard
          icon={Users}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Active Users"
          value={stats.active}
          change="10.3%"
          changeType="up"
        />
        <StatCard
          icon={Users}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          label="Inactive Users"
          value={stats.inactive}
          change="5.2%"
          changeType="down"
        />
        <StatCard
          icon={Users}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="Admins"
          value={stats.admins}
          change="2.1%"
          changeType="up"
        />
        <StatCard
          icon={UserPlus}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="New This Month"
          value={stats.newThisMonth}
          change="8.7%"
          changeType="up"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white border border-border rounded-xl">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-destructive">Unable to load users. Please try again.</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No users found.</p>
        ) : (
          <DataTable
            columns={columnsWithActions}
            data={filteredUsers}
            enablePagination={true}
            enableSorting={true}
            pageSize={10}
            rowClassName="hover:bg-blue-50/50"
          />
        )}
      </div>

      {/* Footer Info */}
      {!isLoading && filteredUsers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing 1 to {Math.min(10, filteredUsers.length)} of {filteredUsers.length} users
        </p>
      )}

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
                  <option value="lab_owner">Lab Owner</option>
                  <option value="lab_assistant">Lab Technician</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.role}</p>}
              </div>
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
                  <option value="lab_owner">Lab Owner</option>
                  <option value="lab_assistant">Lab Technician</option>
                  <option value="admin">Admin</option>
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
