import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Shield,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Calendar,
  TestTube,
  Package,
  CreditCard,
  Users,
  Tag,
  Layers,
  FileText,
  Banknote,
  Receipt,
  Wallet,
  Settings,
  CircleDollarSign,
  Lock,
  Building2,
  ArrowLeft,
} from 'lucide-react'
import {
  getRoles,
  createRole,
  updateRole,
  updateRolePermissions,
  deleteRole,
  getAvailableResources,
} from '@/services/role.service'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { ROUTES } from '@/constants/routes'

const RESOURCES_CONFIG = {
  users: { label: 'Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  roles: { label: 'Roles', icon: Shield, color: 'text-violet-600', bg: 'bg-violet-100' },
  bookings: { label: 'Bookings', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
  tests: { label: 'Tests', icon: TestTube, color: 'text-red-500', bg: 'bg-red-100' },
  packages: { label: 'Packages', icon: Package, color: 'text-violet-600', bg: 'bg-violet-100' },
  categories: { label: 'Categories', icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  subcategories: { label: 'Subcategories', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-100' },
  payments: { label: 'Payments', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  reports: { label: 'Reports', icon: FileText, color: 'text-sky-600', bg: 'bg-sky-100' },
  commissions: { label: 'Commissions', icon: CircleDollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  settlements: { label: 'Settlements', icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-100' },
  paymentSettings: { label: 'Payment Settings', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' },
  lab_owners: { label: 'Lab Owners', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  lab_assistants: { label: 'Lab Assistants', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-100' },
}

const ROLE_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
  { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-sky-100', text: 'text-sky-600', badge: 'bg-sky-100 text-sky-700' },
  { bg: 'bg-rose-100', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
  { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
]

const ACTIONS = ['create', 'read', 'update', 'delete']
const ITEMS_PER_PAGE = 5

const emptyForm = { name: '', displayName: '', description: '', permissions: {} }

const RoleManagement = () => {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRole, setExpandedRole] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [menuOpen, setMenuOpen] = useState(null)
  const [resources, setResources] = useState([])
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState({ open: false, target: null })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchRoles()
    fetchResources()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const { data } = await getRoles()
      setRoles(data?.roles || [])
    } catch (err) {
      console.error('Failed to fetch roles', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    try {
      const { data } = await getAvailableResources()
      setResources(data?.resources || [])
    } catch (err) {
      console.error('Failed to fetch resources', err)
    }
  }

  const filteredRoles = roles.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE)
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getRoleColor = (index) => ROLE_COLORS[index % ROLE_COLORS.length]

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role)
      setForm({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        permissions: JSON.parse(JSON.stringify(role.permissions || {})),
      })
    } else {
      setEditingRole(null)
      setForm(emptyForm)
    }
    setShowModal(true)
    setMenuOpen(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRole(null)
    setForm(emptyForm)
  }

  const togglePermission = (resource, action) => {
    setForm((prev) => {
      const perms = { ...prev.permissions }
      if (!perms[resource]) {
        perms[resource] = { create: false, read: false, update: false, delete: false }
      }
      perms[resource] = { ...perms[resource], [action]: !perms[resource][action] }
      return { ...prev, permissions: perms }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingRole) {
        await updateRole(editingRole._id, {
          displayName: form.displayName,
          description: form.description,
        })
        await updateRolePermissions(editingRole._id, form.permissions)
      } else {
        await createRole({
          name: form.name,
          displayName: form.displayName,
          description: form.description,
          permissions: form.permissions,
        })
      }
      toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully')
      handleCloseModal()
      fetchRoles()
    } catch (err) {
      console.error('Failed to save role', err)
      toast.error(err.response?.data?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleteModal({ open: true, target: id })
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteRole(deleteModal.target)
      toast.success('Role deleted successfully')
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role')
    } finally {
      setDeleting(false)
      setDeleteModal({ open: false, target: null })
    }
  }

  const permissionCount = (permissions) => {
    if (!permissions) return 0
    let count = 0
    Object.values(permissions).forEach((p) => {
      if (p.create) count++
      if (p.read) count++
      if (p.update) count++
      if (p.delete) count++
    })
    return count
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Role Management</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1 ml-7">
            View, create, and manage roles and their permissions.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition flex-shrink-0"
        >
          <Plus size={16} />
          Add Role
        </button>
      </div>

      {/* Roles Card */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-foreground">Roles</h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {roles.length} Total
            </span>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Roles List */}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : paginatedRoles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No roles found</div>
          ) : (
            paginatedRoles.map((role, idx) => {
              const colorSet = getRoleColor((currentPage - 1) * ITEMS_PER_PAGE + idx)
              const isExpanded = expandedRole === role._id

              return (
                <div key={role._id}>
                  {/* Role Row */}
                  <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-accent/30 transition">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${colorSet.bg} flex items-center justify-center flex-shrink-0`}>
                      <Shield size={16} className={colorSet.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{role.displayName || role.name}</p>
                        {role.name !== 'admin' && (
                          <span className={`text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${colorSet.badge}`}>
                            {role.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role.description || 'No description'}
                        {' \u00B7 '}
                        {permissionCount(role.permissions)} permissions
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : role._id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded transition"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpen(menuOpen === role._id ? null : role._id)
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded transition"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === role._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); if (role.name !== 'admin') { handleOpenModal(role) } }}
                            disabled={role.name === 'admin'}
                            className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left ${
                              role.name === 'admin'
                                ? 'text-muted-foreground/50 cursor-not-allowed'
                                : 'text-foreground hover:bg-accent'
                            }`}
                          >
                            <Edit2 size={14} /> Edit
                            {role.name === 'admin' && <Lock size={12} className="ml-auto" />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (role.name !== 'admin') { handleDelete(role._id); setMenuOpen(null) } }}
                            disabled={role.name === 'admin'}
                            className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left ${
                              role.name === 'admin'
                                ? 'text-muted-foreground/50 cursor-not-allowed'
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={14} /> Delete
                            {role.name === 'admin' && <Lock size={12} className="ml-auto" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Permissions */}
                  {isExpanded && role.permissions && (
                    <div className="px-3 sm:px-4 pb-4">
                      <div className="border border-border rounded-lg overflow-x-auto">
                        <table className="w-full text-sm min-w-[380px]">
                          <thead>
                            <tr className="bg-violet-50 border-b border-border">
                              <th className="text-left px-3 sm:px-4 py-2 sm:py-2.5 font-semibold text-violet-600 text-xs sm:text-sm">Resource</th>
                              {ACTIONS.map((a) => (
                                <th key={a} className="text-center px-2 sm:px-4 py-2 sm:py-2.5 font-semibold text-foreground capitalize text-xs sm:text-sm">
                                  {a}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(role.permissions).map(([resource, perms]) => {
                              const resConfig = RESOURCES_CONFIG[resource] || { label: resource, icon: Shield, color: 'text-gray-600', bg: 'bg-gray-100' }
                              const ResIcon = resConfig.icon
                              return (
                                <tr key={resource} className="border-b border-border last:border-0">
                                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${resConfig.bg} flex items-center justify-center flex-shrink-0`}>
                                        <ResIcon size={12} className={resConfig.color} />
                                      </span>
                                      <span className="font-medium text-foreground text-xs sm:text-sm whitespace-nowrap">{resConfig.label}</span>
                                    </div>
                                  </td>
                                  {ACTIONS.map((action) => (
                                    <td key={action} className="text-center px-2 sm:px-4 py-2 sm:py-2.5">
                                      {perms[action] ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100">
                                          <Check size={12} className="text-green-600" />
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100">
                                          <X size={12} className="text-red-500" />
                                        </span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && filteredRoles.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredRoles.length)} of{' '}
              {filteredRoles.length} roles
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-border hover:bg-accent text-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">
                  {editingRole ? 'Edit Role' : 'Add Role'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingRole ? 'Update role details and permissions.' : 'Create a new role with permissions.'}
                </p>
              </div>
              <button onClick={handleCloseModal} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  name="name"
                  icon={editingRole ? Lock : undefined}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  disabled={!!editingRole}
                  placeholder="e.g. lab_manager"
                  required
                />
                <Input
                  label="Display Name"
                  name="displayName"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="e.g. Lab Manager"
                  required
                />
              </div>
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Describe what this role can do"
              />

              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Permissions</p>
                <div className="border border-border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="bg-violet-50 border-b border-border">
                        <th className="text-left px-4 py-2 font-semibold text-violet-600">Resource</th>
                        {ACTIONS.map((a) => (
                          <th key={a} className="text-center px-3 py-2 font-semibold text-foreground capitalize">
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => {
                        const resConfig = RESOURCES_CONFIG[resource] || { label: resource, icon: Shield, color: 'text-gray-600', bg: 'bg-gray-100' }
                        const ResIcon = resConfig.icon
                        return (
                          <tr key={resource} className="border-b border-border last:border-0 hover:bg-accent/30">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-7 h-7 rounded-full ${resConfig.bg} flex items-center justify-center flex-shrink-0`}>
                                  <ResIcon size={14} className={resConfig.color} />
                                </span>
                                <span className="font-medium text-foreground">{resConfig.label}</span>
                              </div>
                            </td>
                            {ACTIONS.map((action) => (
                              <td key={action} className="text-center px-3 py-2">
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => togglePermission(resource, action)}
                                    className={`w-6 h-6 rounded border transition flex items-center justify-center ${
                                      form.permissions[resource]?.[action]
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                  >
                                    {form.permissions[resource]?.[action] && <Check size={14} strokeWidth={3} />}
                                  </button>
                                </div>
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition"
              >
                Cancel
              </button>
              <Button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.displayName.trim()}
                loading={saving}
              >
                {editingRole ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, target: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default RoleManagement