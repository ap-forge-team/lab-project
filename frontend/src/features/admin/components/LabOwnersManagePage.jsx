import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Search, ChevronRight, Eye, Pencil, Trash2, X, MoreVertical, MapPin, Mail, Phone, Calendar, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/ui/data-table'
import { labOwnerManageColumns } from '@/features/admin/columns/lab-owners-manage.columns'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import LocationPicker from '@/components/LocationPicker'
import { Spinner } from '@/components/ui/Loader'
import Can from '@/components/Can'
import { createLabOwner, updateUser, deleteUser } from '@/services/user.service'

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

const LabOwnersManagePage = ({ labOwners, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showLabMap, setShowLabMap] = useState(false)
  const [showEditMap, setShowEditMap] = useState(false)

  // Form state
  const emptyForm = { name: '', email: '', phone: '', password: '', servicePincodes: '', labAddress: '', latitude: '', longitude: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  // Unique locations from data
  const locations = useMemo(() => {
    const set = new Set((labOwners || []).map((o) => o.labAddress).filter(Boolean))
    return Array.from(set)
  }, [labOwners])

  const filterCategories = useMemo(() => [
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
      key: 'location',
      label: 'Location',
      type: 'search-checkbox',
      searchPlaceholder: 'Search locations...',
      options: locations.map((loc) => ({ value: loc, label: loc.length > 40 ? loc.slice(0, 40) + '...' : loc })),
    },
    {
      key: 'serviceArea',
      label: 'Service Area',
      type: 'checkbox',
      options: [
        { value: 'has_areas', label: 'Has Service Areas' },
        { value: 'no_areas', label: 'No Service Areas' },
      ],
    },
  ], [locations])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      if (val) return count + 1
      return count
    }, 0)
  }, [activeFilters])

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters)
  }

  const filteredOwners = useMemo(() => {
    let result = labOwners || []
    const term = search.trim().toLowerCase()
    if (term) {
      result = result.filter(
        (o) =>
          o.name?.toLowerCase().includes(term) ||
          o.email?.toLowerCase().includes(term) ||
          o.phone?.includes(term)
      )
    }
    if (activeFilters.status?.length) {
      result = result.filter((o) => {
        const isActive = o.role !== 'inactive'
        return activeFilters.status.includes(isActive ? 'active' : 'inactive')
      })
    }
    if (activeFilters.location?.length) {
      result = result.filter((o) => activeFilters.location.includes(o.labAddress))
    }
    if (activeFilters.serviceArea?.length) {
      if (activeFilters.serviceArea.includes('has_areas')) {
        result = result.filter((o) => o.servicePincodes?.length > 0)
      }
      if (activeFilters.serviceArea.includes('no_areas')) {
        result = result.filter((o) => !o.servicePincodes?.length)
      }
    }
    return result
  }, [labOwners, search, activeFilters])

  const stats = useMemo(() => {
    const list = labOwners || []
    return {
      total: list.length,
      active: list.filter((o) => o.role !== 'inactive').length,
      inactive: list.filter((o) => o.role === 'inactive').length,
      locations: new Set(list.map((o) => o.labAddress).filter(Boolean)).size,
    }
  }, [labOwners])

  const columnsWithActions = useMemo(() => {
    return [...labOwnerManageColumns, {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const owner = row.original
        return (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (menuOpen?.id === owner._id) {
                  setMenuOpen(null)
                } else {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setMenuOpen({ id: owner._id, owner, top: rect.bottom + 4, left: rect.right - 130 })
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
    if (!form.labAddress) errs.labAddress = 'Lab location is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      await createLabOwner({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        labAddress: form.labAddress,
        latitude: form.latitude,
        longitude: form.longitude,
        servicePincodes: form.servicePincodes ? form.servicePincodes.split(',').map((s) => s.trim()) : [],
      })
      toast.success('Lab Owner created successfully')
      setShowAddModal(false)
      setForm(emptyForm)
      setErrors({})
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lab owner')
    } finally {
      setSaving(false)
    }
  }

  const handleView = (owner) => { setSelectedOwner(owner); setShowViewModal(true); setMenuOpen(null) }
  const handleEdit = (owner) => {
    setSelectedOwner(owner)
    setForm({
      name: owner.name || '',
      email: owner.email || '',
      phone: owner.phone || '',
      servicePincodes: owner.servicePincodes?.join(', ') || '',
      labAddress: owner.labAddress || '',
      latitude: owner.latitude || '',
      longitude: owner.longitude || '',
    })
    setErrors({})
    setShowEditModal(true)
    setMenuOpen(null)
  }
  const handleDelete = (owner) => { setSelectedOwner(owner); setShowDeleteModal(true); setMenuOpen(null) }

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
        labAddress: form.labAddress,
        latitude: form.latitude,
        longitude: form.longitude,
        servicePincodes: form.servicePincodes ? form.servicePincodes.split(',').map((s) => s.trim()) : [],
      }
      await updateUser(selectedOwner._id, payload)
      toast.success('Lab Owner updated successfully')
      setShowEditModal(false)
      setSelectedOwner(null)
      setForm(emptyForm)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lab owner')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteUser(selectedOwner._id)
      toast.success('Lab Owner deleted successfully')
      setShowDeleteModal(false)
      setSelectedOwner(null)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lab owner')
    } finally {
      setDeleting(false)
    }
  }

  const handleCloseModal = () => { setShowAddModal(false); setForm(emptyForm); setErrors({}) }

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
            <button onClick={(e) => { e.stopPropagation(); handleView(openMenu.owner) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Eye size={14} /> View
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleEdit(openMenu.owner) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(openMenu.owner) }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Owners</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage laboratory owners, their locations and service availability.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search lab owner, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" />
          </div>
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <Can resource="lab_owners" action="create">
            <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add Lab Owner
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Lab Owners" value={stats.total} change="12.5%" changeType="up" />
        <StatCard icon={Shield} iconBg="bg-green-100" iconColor="text-green-600" label="Active Labs" value={stats.active} change="8.3%" changeType="up" />
        <StatCard icon={Shield} iconBg="bg-amber-100" iconColor="text-amber-600" label="Inactive Labs" value={stats.inactive} change="3.1%" changeType="down" />
        <StatCard icon={MapPin} iconBg="bg-purple-100" iconColor="text-purple-600" label="Total Locations" value={stats.locations} change="5.6%" changeType="up" />
      </div>

      {/* Lab Owners Table */}
      <div className="bg-white border border-border rounded-xl">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Spinner /></div>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-destructive">Unable to load lab owners. Please try again.</p>
        ) : filteredOwners.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No lab owners found.</p>
        ) : (
          <DataTable columns={columnsWithActions} data={filteredOwners} enablePagination={true} enableSorting={true} pageSize={10} rowClassName="hover:bg-blue-50/50" />
        )}
      </div>

      {!isLoading && filteredOwners.length > 0 && (
        <p className="text-xs text-muted-foreground">Showing 1 to {Math.min(10, filteredOwners.length)} of {filteredOwners.length} lab owners</p>
      )}

      {/* Add Lab Owner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Add Lab Owner</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Create a new laboratory owner account.</p>
              </div>
              <button onClick={handleCloseModal} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <Input label="Full Name" name="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. John Doe" error={errors.name} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. john@example.com" error={errors.email} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 9876543210" inputMode="numeric" maxLength={10} error={errors.phone} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 6 characters" error={errors.password} required />
              <Input label="Service Pincodes (comma separated)" name="servicePincodes" value={form.servicePincodes} onChange={(e) => handleChange('servicePincodes', e.target.value)} placeholder="e.g. 411033, 411044" />
              <div>
                {form.labAddress && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                    <div className="text-xs font-medium text-green-700 flex items-center gap-1.5"><MapPin size={13} /> Lab Location Selected</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{form.labAddress}</div>
                  </div>
                )}
                {errors.labAddress && <p className="text-destructive text-xs mt-1.5 font-medium mb-2">{errors.labAddress}</p>}
                <button type="button" onClick={() => setShowLabMap(true)} className="w-full bg-primary/10 text-primary py-3 rounded-lg text-xs font-semibold hover:bg-primary/20 transition">
                  <MapPin size={14} className="inline mr-2" /> Select Lab Location On Map
                </button>
                {showLabMap && (
                  <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Select Lab Location</h3>
                        <button onClick={() => setShowLabMap(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
                      </div>
                      <div className="p-4">
                        <LocationPicker
                          location={{ lat: Number(form.latitude) || 18.5204, lng: Number(form.longitude) || 73.8567 }}
                          setLocation={(loc) => setForm((prev) => ({ ...prev, latitude: loc.lat, longitude: loc.lng }))}
                          onLocationSelect={async (lat, lng) => {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                            const data = await res.json()
                            setForm((prev) => ({ ...prev, labAddress: data.display_name, latitude: lat, longitude: lng }))
                          }}
                        />
                        <Button onClick={() => setShowLabMap(false)} fullWidth variant="success" className="mt-4">Confirm Location</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
              <Button onClick={handleSave} disabled={saving} loading={saving}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Lab Owner Modal */}
      {showViewModal && selectedOwner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Lab Owner Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">View laboratory owner information.</p>
              </div>
              <button onClick={() => { setShowViewModal(false); setSelectedOwner(null) }} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {selectedOwner.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'LO'}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{selectedOwner.name}</h4>
                  <p className="text-xs text-muted-foreground">ID: {selectedOwner._id.slice(-6)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Email</p><p className="text-sm text-foreground">{selectedOwner.email}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Phone</p><p className="text-sm text-foreground">{selectedOwner.phone || '—'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Lab Address</p><p className="text-sm text-foreground">{selectedOwner.labAddress || '—'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Building2 size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Service Areas</p><p className="text-sm text-foreground">{selectedOwner.servicePincodes?.join(', ') || '—'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                  <Calendar size={16} className="text-muted-foreground" />
                  <div><p className="text-[10px] text-muted-foreground">Registered On</p><p className="text-sm text-foreground">{selectedOwner.createdAt ? new Date(selectedOwner.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => { setShowViewModal(false); setSelectedOwner(null) }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lab Owner Modal */}
      {showEditModal && selectedOwner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Edit Lab Owner</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update laboratory owner details.</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setSelectedOwner(null); setForm(emptyForm); setErrors({}) }} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <Input label="Full Name" name="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. John Doe" error={errors.name} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="e.g. john@example.com" error={errors.email} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 9876543210" inputMode="numeric" maxLength={10} error={errors.phone} required />
              <Input label="Service Pincodes (comma separated)" name="servicePincodes" value={form.servicePincodes} onChange={(e) => handleChange('servicePincodes', e.target.value)} placeholder="e.g. 411033, 411044" />
              <div>
                {form.labAddress && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                    <div className="text-xs font-medium text-green-700 flex items-center gap-1.5"><MapPin size={13} /> Lab Location Selected</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{form.labAddress}</div>
                  </div>
                )}
                <button type="button" onClick={() => setShowEditMap(true)} className="w-full bg-primary/10 text-primary py-3 rounded-lg text-xs font-semibold hover:bg-primary/20 transition">
                  <MapPin size={14} className="inline mr-2" /> Select Lab Location On Map
                </button>
                {showEditMap && (
                  <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Select Lab Location</h3>
                        <button onClick={() => setShowEditMap(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={20} /></button>
                      </div>
                      <div className="p-4">
                        <LocationPicker
                          location={{ lat: Number(form.latitude) || 18.5204, lng: Number(form.longitude) || 73.8567 }}
                          setLocation={(loc) => setForm((prev) => ({ ...prev, latitude: loc.lat, longitude: loc.lng }))}
                          onLocationSelect={async (lat, lng) => {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                            const data = await res.json()
                            setForm((prev) => ({ ...prev, labAddress: data.display_name, latitude: lat, longitude: lng }))
                          }}
                        />
                        <Button onClick={() => setShowEditMap(false)} fullWidth variant="success" className="mt-4">Confirm Location</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => { setShowEditModal(false); setSelectedOwner(null); setForm(emptyForm); setErrors({}) }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
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
        onClose={() => { setShowDeleteModal(false); setSelectedOwner(null) }}
        onConfirm={handleConfirmDelete}
        title="Delete Lab Owner"
        message={`Are you sure you want to delete "${selectedOwner?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default LabOwnersManagePage
