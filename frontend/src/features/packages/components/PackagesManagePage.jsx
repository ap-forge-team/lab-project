import React, { useMemo, useState, useCallback } from 'react'
import {
  CheckCircle2,
  Copy,
  Eye,
  Grid2X2,
  List,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
  MoreVertical,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import Pagination from '@/components/ui/Pagination'
import CreatePackageModal from './CreatePackageModal'
import { deletePackage } from '@/services/package.service'

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

const StatCard = ({ icon: Icon, iconClass, title, value, detail }) => (
  <div className="rounded-xl border border-border bg-white p-3 shadow-sm sm:p-4">
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>{React.createElement(Icon, { size: 20 })}</span>
      <div><p className="text-xs text-muted-foreground">{title}</p><p className="mt-0.5 text-xl font-bold text-foreground">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p></div>
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return packages.filter((pkg) => {
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
  }, [packages, search, activeFilters])
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and view all health-check packages</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
          <Can resource="packages" action="create">
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={18} className="mr-2" />Add Package
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={List} iconClass="bg-blue-50 text-primary" title="Total Packages" value={packages.length} detail="All time" />
        <StatCard icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-500" title="Active Packages" value={activePackages.length} detail={packages.length ? `${((activePackages.length / packages.length) * 100).toFixed(2)}% of total` : '0% of total'} />
        <StatCard icon={XCircle} iconClass="bg-orange-50 text-orange-500" title="Inactive Packages" value={packages.length - activePackages.length} detail={packages.length ? `${(((packages.length - activePackages.length) / packages.length) * 100).toFixed(2)}% of total` : '0% of total'} />
        <StatCard icon={Package} iconClass="bg-violet-50 text-violet-500" title="Categories" value={categories.length} detail="Total categories" />
      </div>

      {isLoading ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading packages…</div> : isError ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load packages. Please try again.</div> : visiblePackages.length === 0 ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No packages match the selected filters.</div> : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{visiblePackages.map((pkg, index) => {
          const id = getPackageId(pkg, index)
          const catColor = getCategoryColor(getCategory(pkg))
          const testsList = (pkg.testsIncluded || []).slice(0, 4)
          return (
            <article
              key={id}
              className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-44 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                {pkg.image ? (
                  <img src={pkg.image} alt={getTitle(pkg)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-blue-200" />
                  </div>
                )}
                <span className={`absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ${isActive(pkg) ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isActive(pkg) ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm leading-snug" title={getTitle(pkg)}>{getTitle(pkg)}</h3>
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(pkg)}</span>
                </div>

                <div className="mt-2">
                  <span className="text-lg font-bold text-foreground">{formatPrice(pkg.price)}</span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">{pkg.testsIncluded?.length || 0} Tests Included</p>

                {/* Test list */}
                {testsList.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {testsList.map((t) => {
                  const testName = typeof t === 'object' ? (t.title || t.name) : ''
                      if (!testName) return null
                      return (
                        <li key={typeof t === 'object' ? t._id : t} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                          <span className="truncate">{testName}</span>
                        </li>
                      )
                    })}
                    {(pkg.testsIncluded?.length || 0) > 4 && (
                      <li className="text-[11px] text-primary font-medium pl-6">+{pkg.testsIncluded.length - 4} more tests</li>
                    )}
                  </ul>
                )}

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    NABL Accredited Labs
                  </span>
                  <div className="flex items-center gap-1">
                    <Tooltip title="View" arrow placement="top">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedPackageId(id) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Eye size={14} /></button>
                    </Tooltip>
                    <Can resource="packages" action="update">
                      <Tooltip title="Edit" arrow placement="top">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(pkg) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Pencil size={14} /></button>
                      </Tooltip>
                    </Can>
                    <Can resource="packages" action="create">
                      <Tooltip title="Duplicate" arrow placement="top">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDuplicate(pkg) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Copy size={14} /></button>
                      </Tooltip>
                    </Can>
                    <Can resource="packages" action="delete">
                      <Tooltip title="Delete" arrow placement="top">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(pkg) }} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                      </Tooltip>
                    </Can>
                  </div>
                </div>
              </div>
            </article>
          )
        })}</div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Package Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Tests Included</th>
                  <th className="px-4 py-3">Price (₹)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePackages.map((pkg, index) => {
                  const id = getPackageId(pkg, index)
                  const catColor = getCategoryColor(getCategory(pkg))
                  return (
                    <tr key={id} onClick={() => setSelectedPackageId(id)} className={`cursor-pointer border-t border-border transition hover:bg-accent/40 ${selectedPackageId === id ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{getTitle(pkg)}</td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(pkg)}</span></td>
                      <td className="px-4 py-3">{pkg.testsIncluded?.length || 0} tests</td>
                      <td className="px-4 py-3">{pkg.price != null ? Number(pkg.price).toLocaleString('en-IN') : '—'}</td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs ${isActive(pkg) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(pkg) ? 'Active' : 'Inactive'}</span></td>
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
    </section>
  )
}

export default PackagesManagePage
