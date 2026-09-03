import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Building2, Plus, Search, ChevronRight, Eye, EyeOff, Pencil, Trash2, X, MoreVertical, MapPin, Mail, Phone, Calendar, Shield, Users, MapPinned, ChevronsUpDown, Copy } from 'lucide-react'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import LocationPicker from '@/components/LocationPicker'
import { Spinner } from '@/components/ui/Loader'
import Can from '@/components/Can'
import { createLabOwner, updateUser, deleteUser } from '@/services/user.service'

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

const LabOwnersManagePage = ({ labOwners, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [hiddenColumns, setHiddenColumns] = useState({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const handleSort = useCallback((key, direction) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === direction) {
        return { key: null, direction: null }
      }
      return { key, direction }
    })
  }, [])

  const getSortValue = useCallback((owner, key) => {
    switch (key) {
      case 'name': return (owner.name || '').toLowerCase()
      case 'contact': return (owner.email || '').toLowerCase()
      case 'location': return (owner.labAddress || '').toLowerCase()
      case 'serviceAreas': return owner.servicePincodes?.length || 0
      case 'status': return owner.role === 'inactive' ? 'inactive' : 'active'
      default: return ''
    }
  }, [])

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

  useEffect(() => {
    if (searchParams.get('modal') === 'add-lab-owner') {
      setShowAddModal(true)
      searchParams.delete('modal')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Unique locations from data
  const locations = useMemo(() => {
    const set = new Set((labOwners || []).map((o) => o.labAddress).filter(Boolean))
    return Array.from(set)
  }, [labOwners])

  const filterCategories = useMemo(() => {
    const nameOptions = (labOwners || []).map((o) => ({ value: o.name, label: o.name }))
    const emailOptions = (labOwners || []).map((o) => ({ value: o.email, label: o.email }))
    const phoneOptions = (labOwners || []).filter((o) => o.phone).map((o) => ({ value: o.phone, label: o.phone }))
    return [
      {
        key: 'name',
        label: 'Lab Owner',
        type: 'search-checkbox',
        searchPlaceholder: 'Search lab owners...',
        options: nameOptions,
      },
      {
        key: 'email',
        label: 'Contact',
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
        key: 'location',
        label: 'Lab Location',
        type: 'search-checkbox',
        searchPlaceholder: 'Search locations...',
        options: locations.map((loc) => ({ value: loc, label: loc.length > 40 ? loc.slice(0, 40) + '...' : loc })),
      },
      {
        key: 'serviceArea',
        label: 'Service Areas',
        type: 'checkbox',
        options: [
          { value: 'has_areas', label: 'Has Service Areas' },
          { value: 'no_areas', label: 'No Service Areas' },
        ],
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
    ]
  }, [locations, labOwners])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      if (val && typeof val === 'object' && (val.start || val.end)) return count + 1
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
    if (activeFilters.name?.length) {
      result = result.filter((o) => activeFilters.name.includes(o.name))
    }
    if (activeFilters.email?.length) {
      result = result.filter((o) => activeFilters.email.includes(o.email))
    }
    if (activeFilters.phone?.length) {
      result = result.filter((o) => activeFilters.phone.includes(o.phone))
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
    if (activeFilters.status?.length) {
      result = result.filter((o) => {
        const isActive = o.role !== 'inactive'
        return activeFilters.status.includes(isActive ? 'active' : 'inactive')
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
  }, [labOwners, search, activeFilters, sortConfig, getSortValue])

  const stats = useMemo(() => {
    const list = labOwners || []
    return {
      total: list.length,
      active: list.filter((o) => o.role !== 'inactive').length,
      inactive: list.filter((o) => o.role === 'inactive').length,
      locations: new Set(list.map((o) => o.labAddress).filter(Boolean)).size,
    }
  }, [labOwners])

  const totalPages = Math.max(1, Math.ceil(filteredOwners.length / pageSize))
  const visibleOwners = filteredOwners.slice((page - 1) * pageSize, page * pageSize)

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

      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">Lab Owners</h1>
        <Can resource="lab_owners" action="create">
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
          </Button>
        </Can>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Owners</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage laboratory owners, their locations and service availability.</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Mobile Search */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search lab owner, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
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
              icon={Building2}
              borderColor="border-blue-200"
              iconColor="text-blue-500"
              cardBg="bg-blue-50"
              title="Total Lab Owners"
              value={stats.total}
              detailTop="All"
              detailBottom="owners"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Users}
              borderColor="border-emerald-200"
              iconColor="text-emerald-500"
              cardBg="bg-emerald-50"
              title="Active Labs"
              value={stats.active}
              detailTop="Currently"
              detailBottom="active"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Shield}
              borderColor="border-amber-200"
              iconColor="text-amber-500"
              cardBg="bg-amber-50"
              title="Inactive Labs"
              value={stats.inactive}
              detailTop="Currently"
              detailBottom="inactive"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={MapPinned}
              borderColor="border-purple-200"
              iconColor="text-purple-500"
              cardBg="bg-purple-50"
              title="Total Locations"
              value={stats.locations}
              detailTop="Unique"
              detailBottom="locations"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 sm:hidden">
        <span className="w-2 h-2 rounded-full bg-primary"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
      </div>

      {/* Lab Owners Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading lab owners…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load lab owners. Please try again.</div>
      ) : filteredOwners.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No lab owners found.</div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
          <div className="rounded-xl border border-border bg-white">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                <tr>
                  <SortableHeader title="Lab Owner" sortKey="name" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, name: true }))} />
                  <SortableHeader title="Contact" sortKey="contact" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, contact: true }))} />
                  <SortableHeader title="Lab Location" sortKey="location" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, location: true }))} />
                  <SortableHeader title="Service Areas" sortKey="serviceAreas" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, serviceAreas: true }))} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, status: true }))} />
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleOwners.map((owner) => {
                  const isActive = owner.role !== 'inactive'
                  const initials = owner.name ? owner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'LO'
                  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500']
                  let hash = 0
                  for (let i = 0; i < (owner.name || '').length; i++) hash = (hash * 31 + (owner.name || '').charCodeAt(i)) >>> 0
                  const avatarColor = avatarColors[hash % avatarColors.length]
                  return (
                    <tr key={owner._id} onClick={() => handleView(owner)} className="cursor-pointer border-t border-border transition hover:bg-accent/40">
                      {!hiddenColumns.name && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor} text-white font-semibold text-xs`}>
                              {initials}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{owner.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {owner._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.contact && (
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-foreground">{owner.email}</p>
                            <p className="text-xs text-muted-foreground">{owner.phone || '—'}</p>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.location && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <MapPin size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{owner.labAddress || '—'}</span>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.serviceAreas && (
                        <td className="px-4 py-3">
                          {owner.servicePincodes?.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-semibold">
                              {owner.servicePincodes.length} Area{owner.servicePincodes.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            type="button"
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
          totalItems={filteredOwners.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="lab owners"
        />
      </div>

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
