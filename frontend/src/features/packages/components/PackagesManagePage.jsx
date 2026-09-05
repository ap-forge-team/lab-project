import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronsUpDown,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  XCircle,
  MoreVertical,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import Pagination from '@/components/ui/Pagination'
import CreatePackageModal from './CreatePackageModal'
import { deletePackage } from '@/services/package.service'
import { PackageCard } from './PackageCard'
import BookTestModal from '@/features/booking/components/BookTestModal'

const PAGE_SIZE = 12
const PAGE_SIZES = [12, 24, 48]

const CATEGORY_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-red-100', text: 'text-red-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
]

const getCategoryColor = (name) => {
  const str = String(name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}

const getTitle = (pkg) => pkg.title || pkg.name || 'Untitled Package'
const getCategory = (pkg) => pkg.category?.name || pkg.category || 'Uncategorised'
const isActive = (pkg) => pkg.isActive !== false && pkg.status?.toLowerCase() !== 'inactive'
const getValue = (pkg, keys, fallback = '—') => keys.map((key) => pkg[key]).find((value) => value != null && value !== '') ?? fallback

const formatPrice = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? `₹${numeric.toLocaleString('en-IN')}` : '—'
}

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

const DetailRow = ({ label, value, valueClass = 'text-foreground' }) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
)

const PackageDetailsPanel = ({ pkg, onClose }) => {
  if (!pkg) return null
  const catColor = getCategoryColor(getCategory(pkg))
  return (
    <Modal open={!!pkg} title="Package Details" onClose={onClose} size="md">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500"><Package size={22} /></span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{getTitle(pkg)}</p>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${isActive(pkg) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(pkg) ? 'Active' : 'Inactive'}</span>
          </div>
          <span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(pkg)}</span>
        </div>
      </div>
      <div className="mt-4 divide-y divide-border border-t border-border">
        <DetailRow label="Price" value={formatPrice(pkg.price)} />
        <DetailRow label="Tests Included" value={pkg.testsIncluded?.length || 0} />
        <DetailRow label="Description" value={pkg.description || '—'} />
      </div>
      <div className="mt-3 divide-y divide-border border-t border-border">
        <DetailRow label="Created On" value={getValue(pkg, ['createdAt', 'createdOn'])} />
        <DetailRow label="Last Updated" value={getValue(pkg, ['updatedAt', 'lastUpdated'])} />
      </div>
    </Modal>
  )
}

const PackagesManagePage = ({ packages, isLoading, isError, onRefresh }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPatient = user?.role === ROLES.PATIENT
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [editModal, setEditModal] = useState({ open: false, pkg: null, mode: 'create' })
  const [deleteModal, setDeleteModal] = useState({ open: false, pkg: null, loading: false })
  const [menuOpen, setMenuOpen] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [hiddenColumns, setHiddenColumns] = useState({})
  const [bookModal, setBookModal] = useState({ open: false, test: null })

  const handleSort = useCallback((key, direction) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === direction) {
        return { key: null, direction: null }
      }
      return { key, direction }
    })
  }, [])

  useEffect(() => {
    if (searchParams.get('modal') === 'create-package') {
      setShowCreate(true)
      searchParams.delete('modal')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const categories = useMemo(() => [...new Set(packages.map(getCategory))].sort(), [packages])
  const activePackages = useMemo(() => packages.filter(isActive), [packages])

  const filterCategories = useMemo(() => {
    const nameOptions = (packages || []).map((p) => ({ value: getTitle(p), label: getTitle(p) }))
    const categoryOptions = categories.map((c) => ({ value: c, label: c }))
    return [
      {
        key: 'name',
        label: 'Package Name',
        type: 'search-checkbox',
        searchPlaceholder: 'Search packages...',
        options: nameOptions,
      },
      {
        key: 'category',
        label: 'Category',
        type: 'checkbox',
        options: categoryOptions,
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
  }, [packages, categories])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      return count
    }, 0)
  }, [activeFilters])

  const handleApplyFilters = useCallback((filters) => {
    setActiveFilters(filters)
    setPage(1)
  }, [])

  const getSortValue = useCallback((pkg, key) => {
    switch (key) {
      case 'name': return getTitle(pkg).toLowerCase()
      case 'category': return getCategory(pkg).toLowerCase()
      case 'tests': return pkg.testsIncluded?.length || 0
      case 'price': return Number(pkg.price) || 0
      case 'status': return isActive(pkg) ? 'active' : 'inactive'
      default: return ''
    }
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = packages.filter((pkg) => {
      const matchesSearch = !term || `${getTitle(pkg)} ${getCategory(pkg)}`.toLowerCase().includes(term)
      if (!matchesSearch) return false
      if (activeFilters.name?.length && !activeFilters.name.includes(getTitle(pkg))) return false
      if (activeFilters.category?.length && !activeFilters.category.includes(getCategory(pkg))) return false
      if (activeFilters.status?.length) {
        const pkgActive = isActive(pkg)
        if (!activeFilters.status.includes(pkgActive ? 'active' : 'inactive')) return false
      }
      return true
    })

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
  }, [packages, search, activeFilters, sortConfig, getSortValue])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visiblePackages = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleEdit = useCallback((pkg) => {
    setEditModal({ open: true, pkg, mode: 'edit' })
  }, [])

  const handleDuplicate = useCallback((pkg) => {
    const { _id, id: _id2, createdAt: _c, updatedAt: _u, __v, ...rest } = pkg
    setEditModal({ open: true, pkg: rest, mode: 'duplicate' })
  }, [])

  const handleDelete = useCallback((pkg) => {
    setDeleteModal({ open: true, pkg, loading: false })
  }, [])

  const confirmDelete = useCallback(async () => {
    const pkg = deleteModal.pkg
    if (!pkg) return
    const packageId = pkg._id || pkg.id
    setDeleteModal((prev) => ({ ...prev, loading: true }))
    try {
      await deletePackage(packageId)
      toast.success('Package deleted successfully')
      setDeleteModal({ open: false, pkg: null, loading: false })
      onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete package')
      setDeleteModal((prev) => ({ ...prev, loading: false }))
    }
  }, [deleteModal.pkg, onRefresh])
  const getPackageId = (pkg, index) => pkg._id || pkg.id || `${getTitle(pkg)}-${index}`
  const selectedPackage = visiblePackages.find((pkg, index) => getPackageId(pkg, index) === selectedPackageId) || null

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">Packages</h1>
        {isPatient ? (
          <Button onClick={() => setBookModal({ open: true, test: null })} className="shrink-0">
            <ShoppingCart size={18} className="mr-2" />Book a Test
          </Button>
        ) : (
          <Can resource="packages" action="create">
            <Button onClick={() => setShowCreate(true)} className="shrink-0">
              <Plus size={18} className="mr-2" />Add Package
            </Button>
          </Can>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and view all health-check packages</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search packages by name..." className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" />
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
              <button type="button" aria-label="Grid view" onClick={() => { setView('grid'); setSelectedPackageId(null) }} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
            </Tooltip>
            <Tooltip title="List View" arrow placement="top">
              <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded p-1.5 ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
            </Tooltip>
          </div>
          {isPatient ? (
            <Button onClick={() => setBookModal({ open: true, test: null })}>
              <ShoppingCart size={18} className="mr-2" />Book a Test
            </Button>
          ) : (
            <Can resource="packages" action="create">
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={18} className="mr-2" />Add Package
              </Button>
            </Can>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search packages by name..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
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
            <button type="button" aria-label="Grid view" onClick={() => { setView('grid'); setSelectedPackageId(null) }} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
          </Tooltip>
          <Tooltip title="List View" arrow placement="top">
            <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded p-1.5 ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
          </Tooltip>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={List}
              borderColor="border-blue-200"
              iconColor="text-blue-500"
              cardBg="bg-blue-50"
              title="Total Packages"
              value={packages.length}
              detailTop="All"
              detailBottom="time"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={CheckCircle2}
              borderColor="border-emerald-200"
              iconColor="text-emerald-500"
              cardBg="bg-emerald-50"
              title="Active Packages"
              value={activePackages.length}
              detailTop={packages.length ? `${((activePackages.length / packages.length) * 100).toFixed(2)}%` : '0%'}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={XCircle}
              borderColor="border-orange-200"
              iconColor="text-orange-500"
              cardBg="bg-orange-50"
              title="Inactive Packages"
              value={packages.length - activePackages.length}
              detailTop={packages.length ? `${(((packages.length - activePackages.length) / packages.length) * 100).toFixed(2)}%` : '0%'}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Package}
              borderColor="border-violet-200"
              iconColor="text-violet-500"
              cardBg="bg-violet-50"
              title="Categories"
              value={categories.length}
              detailTop="Total"
              detailBottom="categories"
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

      {isLoading ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading packages…</div> : isError ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load packages. Please try again.</div> : visiblePackages.length === 0 ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No packages match the selected filters.</div> : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visiblePackages.map((pkg, index) => {
            const id = getPackageId(pkg, index)
            return (
              <PackageCard
                key={id}
                pkg={pkg}
                onView={() => setSelectedPackageId(id)}
                onEdit={() => handleEdit(pkg)}
                onDuplicate={() => handleDuplicate(pkg)}
                onDelete={() => handleDelete(pkg)}
              />
            )
          })}
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
          <div className="rounded-xl border border-border bg-white">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                <tr>
                  <SortableHeader title="Package Name" sortKey="name" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, name: true }))} />
                  <SortableHeader title="Category" sortKey="category" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, category: true }))} />
                  <SortableHeader title="Tests Included" sortKey="tests" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, tests: true }))} />
                  <SortableHeader title="Price (₹)" sortKey="price" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, price: true }))} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, status: true }))} />
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePackages.map((pkg, index) => {
                  const id = getPackageId(pkg, index)
                  const catColor = getCategoryColor(getCategory(pkg))
                  return (
                    <tr key={id} onClick={() => setSelectedPackageId(id)} className={`cursor-pointer border-t border-border transition hover:bg-accent/40 ${selectedPackageId === id ? 'bg-primary/5' : ''}`}>
                      {!hiddenColumns.name && <td className="px-4 py-3 font-medium text-foreground">{getTitle(pkg)}</td>}
                      {!hiddenColumns.category && <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(pkg)}</span></td>}
                      {!hiddenColumns.tests && <td className="px-4 py-3">{pkg.testsIncluded?.length || 0} tests</td>}
                      {!hiddenColumns.price && <td className="px-4 py-3">{pkg.price != null ? Number(pkg.price).toLocaleString('en-IN') : '—'}</td>}
                      {!hiddenColumns.status && <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs ${isActive(pkg) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(pkg) ? 'Active' : 'Inactive'}</span></td>}
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (menuOpen?.id === id) {
                                setMenuOpen(null)
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setMenuOpen({ id, pkg, top: rect.bottom + 4, left: rect.right - 140 })
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

      {selectedPackage && (
        <PackageDetailsPanel pkg={selectedPackage} onClose={() => setSelectedPackageId(null)} />
      )}

      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="packages"
        />
      </div>

      <CreatePackageModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={onRefresh} />
      <CreatePackageModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, pkg: null, mode: 'create' })}
        onCreated={onRefresh}
        initialData={editModal.pkg}
        packageId={editModal.pkg?._id || editModal.pkg?.id}
        mode={editModal.mode}
      />
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, pkg: null, loading: false })}
        onConfirm={confirmDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${getTitle(deleteModal.pkg || {})}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteModal.loading}
      />

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

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setMenuOpen(null)} />
          <div
            className="fixed bg-white border border-border rounded-lg shadow-lg py-1 z-[100] min-w-[140px]"
            style={{ top: menuOpen.top, left: menuOpen.left }}
          >
            <button onClick={(e) => { e.stopPropagation(); setSelectedPackageId(menuOpen.id); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Eye size={14} /> View
            </button>
            <Can resource="packages" action="update">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(menuOpen.pkg); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <Pencil size={14} /> Edit
              </button>
            </Can>
            <Can resource="packages" action="create">
              <button onClick={(e) => { e.stopPropagation(); handleDuplicate(menuOpen.pkg); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <Copy size={14} /> Duplicate
              </button>
            </Can>
            <Can resource="packages" action="delete">
              <button onClick={(e) => { e.stopPropagation(); handleDelete(menuOpen.pkg); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                <Trash2 size={14} /> Delete
              </button>
            </Can>
          </div>
        </>
      )}

      {isPatient && (
        <BookTestModal
          open={bookModal.open}
          onClose={() => setBookModal({ open: false, test: null })}
          preselectedTest={bookModal.test}
          onBooked={onRefresh}
        />
      )}
    </section>
  )
}

export default PackagesManagePage
