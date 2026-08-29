import React, { useMemo, useState, useCallback } from 'react'
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Droplet,
  Eye,
  FlaskConical,
  Grid2X2,
  HeartPulse,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Syringe,
  TestTube2,
  MoreVertical,
  Trash2,
  Upload,
  Wind,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import AddTestModal from './AddTestModal'
import { deleteTest } from '@/services/test.service'

const PAGE_SIZE = 12
const PAGE_SIZES = [12, 24, 48]
const CARD_STYLES = [
  { icon: Droplet, bg: 'bg-blue-50', text: 'text-blue-500' },
  { icon: FlaskConical, bg: 'bg-teal-50', text: 'text-teal-500' },
  { icon: Activity, bg: 'bg-orange-50', text: 'text-orange-500' },
  { icon: Shield, bg: 'bg-violet-50', text: 'text-violet-500' },
  { icon: Droplet, bg: 'bg-rose-50', text: 'text-rose-500' },
  { icon: Syringe, bg: 'bg-amber-50', text: 'text-amber-500' },
  { icon: HeartPulse, bg: 'bg-sky-50', text: 'text-sky-500' },
  { icon: Wind, bg: 'bg-indigo-50', text: 'text-indigo-500' },
]

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

const getTitle = (test) => test.title || test.name || test.testName || 'Untitled Test'
const getCategory = (test) => test.category?.name || test.category || 'Uncategorised'
const isActive = (test) => test.isActive !== false && test.status?.toLowerCase() !== 'inactive'
const getValue = (test, keys, fallback = '—') => keys.map((key) => test[key]).find((value) => value != null && value !== '') ?? fallback

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

const TestDetailsPanel = ({ test, style, catColor, onClose }) => {
  if (!test) return null
  const Icon = style.icon
  return (
    <Modal open={!!test} title="Test Details" onClose={onClose} size="md">
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}><Icon size={22} /></span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{getTitle(test)}</p>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${isActive(test) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(test) ? 'Active' : 'Inactive'}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Test Code: {test.code || test.testCode || '—'}</p>
          <span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(test)}</span>
        </div>
      </div>
      <div className="mt-4 divide-y divide-border border-t border-border">
        <DetailRow label="Sample Type" value={getValue(test, ['sampleType', 'sample'])} />
        <DetailRow label="Price" value={formatPrice(getValue(test, ['price'], null))} />
        <DetailRow label="Turnaround Time (TAT)" value={getValue(test, ['reportTime', 'tat', 'turnaroundTime'])} />
        <DetailRow label="Method" value={getValue(test, ['method'])} />
      </div>
      {test.description && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="mt-1 text-sm text-foreground">{test.description}</p>
        </div>
      )}
      <div className="mt-3 divide-y divide-border border-t border-border">
        <DetailRow label="Created On" value={getValue(test, ['createdAt', 'createdOn'])} />
        <DetailRow label="Last Updated" value={getValue(test, ['updatedAt', 'lastUpdated'])} />
      </div>
    </Modal>
  )
}

const TestsManagePage = ({ tests, isLoading, isError, onRefresh }) => {
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTestId, setSelectedTestId] = useState(null)
  const [editModal, setEditModal] = useState({ open: false, test: null, mode: 'create' })
  const [deleteModal, setDeleteModal] = useState({ open: false, test: null, loading: false })
  const [menuOpen, setMenuOpen] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)

  const categories = useMemo(() => [...new Set(tests.map(getCategory))].sort(), [tests])
  const activeTests = useMemo(() => tests.filter(isActive), [tests])

  const filterCategories = useMemo(() => {
    const nameOptions = (tests || []).map((t) => ({ value: getTitle(t), label: getTitle(t) }))
    const categoryOptions = categories.map((c) => ({ value: c, label: c }))
    const sampleTypeOptions = [...new Set((tests || []).map((t) => getValue(t, ['sampleType', 'sample'], null)).filter(Boolean))].map((s) => ({ value: s, label: s }))
    return [
      {
        key: 'name',
        label: 'Test Name',
        type: 'search-checkbox',
        searchPlaceholder: 'Search tests...',
        options: nameOptions,
      },
      {
        key: 'category',
        label: 'Category',
        type: 'checkbox',
        options: categoryOptions,
      },
      {
        key: 'sampleType',
        label: 'Sample Type',
        type: 'checkbox',
        options: sampleTypeOptions,
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
  }, [tests, categories])

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
    return tests.filter((test) => {
      const matchesSearch = !term || `${getTitle(test)} ${test.code || ''} ${getCategory(test)}`.toLowerCase().includes(term)
      if (!matchesSearch) return false
      if (activeFilters.name?.length && !activeFilters.name.includes(getTitle(test))) return false
      if (activeFilters.category?.length && !activeFilters.category.includes(getCategory(test))) return false
      if (activeFilters.sampleType?.length) {
        const sample = getValue(test, ['sampleType', 'sample'], null)
        if (!activeFilters.sampleType.includes(sample)) return false
      }
      if (activeFilters.status?.length) {
        const testActive = isActive(test)
        if (!activeFilters.status.includes(testActive ? 'active' : 'inactive')) return false
      }
      return true
    })
  }, [tests, search, activeFilters])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleTests = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pageNumbers = totalPages <= 5
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [1, 2, 3, 'ellipsis', totalPages]

  const handleEdit = useCallback((test) => {
    setEditModal({ open: true, test, mode: 'edit' })
  }, [])

  const handleDuplicate = useCallback((test) => {
    const { _id, id: _id2, createdAt: _c, updatedAt: _u, __v, ...rest } = test
    setEditModal({ open: true, test: rest, mode: 'duplicate' })
  }, [])

  const handleDelete = useCallback((test) => {
    setDeleteModal({ open: true, test, loading: false })
  }, [])

  const confirmDelete = useCallback(async () => {
    const test = deleteModal.test
    if (!test) return
    const testId = test._id || test.id
    setDeleteModal((prev) => ({ ...prev, loading: true }))
    try {
      await deleteTest(testId)
      toast.success('Test deleted successfully')
      setDeleteModal({ open: false, test: null, loading: false })
      onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete test')
      setDeleteModal((prev) => ({ ...prev, loading: false }))
    }
  }, [deleteModal.test, onRefresh])
  const getTestId = (test, index) => test._id || test.id || `${getTitle(test)}-${index}`
  const selectedTest = visibleTests.find((test, index) => getTestId(test, index) === selectedTestId) || null
  const selectedTestIndex = selectedTest ? visibleTests.indexOf(selectedTest) : -1
  const selectedTestStyle = selectedTestIndex >= 0 ? CARD_STYLES[selectedTestIndex % CARD_STYLES.length] : CARD_STYLES[0]
  const selectedTestCatColor = selectedTest ? getCategoryColor(getCategory(selectedTest)) : CATEGORY_COLORS[0]

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Tests</h1><p className="mt-1 text-sm text-muted-foreground">Manage and view all laboratory tests</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {/* <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"><Upload size={17} />Import Tests</button>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"><Download size={17} />Export</button> */}
          <Can resource="tests" action="create"><Button onClick={() => setShowCreate(true)}><Plus size={18} className="mr-2" />Add Test</Button></Can>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={List} iconClass="bg-blue-50 text-primary" title="Total Tests" value={tests.length} detail="All time" />
        <StatCard icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-500" title="Active Tests" value={activeTests.length} detail={tests.length ? `${((activeTests.length / tests.length) * 100).toFixed(2)}% of total` : '0% of total'} />
        <StatCard icon={XCircle} iconClass="bg-orange-50 text-orange-500" title="Inactive Tests" value={tests.length - activeTests.length} detail={tests.length ? `${(((tests.length - activeTests.length) / tests.length) * 100).toFixed(2)}% of total` : '0% of total'} />
        <StatCard icon={FlaskConical} iconClass="bg-violet-50 text-violet-500" title="Categories" value={categories.length} detail="Total categories" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search tests by name or code..." className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <FilterButton
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
          }}
          activeCount={activeFilterCount}
        />
        <div className="flex items-center rounded-lg border border-border p-1">
          <button type="button" aria-label="Grid view" onClick={() => { setView('grid'); setSelectedTestId(null) }} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
          <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded p-1.5 ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
        </div>
      </div>

      {isLoading ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading tests…</div> : isError ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load tests. Please try again.</div> : visibleTests.length === 0 ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No tests match the selected filters.</div> : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{visibleTests.map((test, index) => {
          const style = CARD_STYLES[index % CARD_STYLES.length]
          const Icon = style.icon
          const catColor = getCategoryColor(getCategory(test))
          return <article key={test._id || test.id || `${getTitle(test)}-${index}`} className="flex min-h-[250px] flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md"><div className="flex gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}><Icon size={22} /></span><div className="min-w-0"><h2 className="truncate font-semibold text-foreground" title={getTitle(test)}>{getTitle(test)}</h2><p className="mt-0.5 text-xs text-muted-foreground">{test.code || test.testCode || '—'}</p><span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(test)}</span></div></div><dl className="mt-3.5 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Sample Type</dt><dd className="text-right text-foreground">{getValue(test, ['sampleType', 'sample'])}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Method</dt><dd className="text-right text-foreground">{getValue(test, ['method'])}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Price</dt><dd className="text-right font-medium text-foreground">{formatPrice(getValue(test, ['price'], null))}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">TAT</dt><dd className="text-right text-foreground">{getValue(test, ['reportTime', 'tat', 'turnaroundTime'])}</dd></div></dl><div className="mt-auto flex items-center justify-between border-t border-border pt-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${isActive(test) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(test) ? 'Active' : 'Inactive'}</span><div className="relative"><button type="button" onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setMenuOpen({ id: getTestId(test, index), test, top: rect.bottom + 4, left: rect.right - 140 }) }} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition"><MoreVertical size={16} /></button></div></div></article>
        })}</div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Test Name</th>
                  <th className="px-4 py-3">Test Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Sample Type</th>
                  <th className="px-4 py-3">Price (₹)</th>
                  <th className="px-4 py-3">TAT</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTests.map((test, index) => {
                  const id = getTestId(test, index)
                  const catColor = getCategoryColor(getCategory(test))
                  return (
                    <tr key={id} onClick={() => setSelectedTestId(id)} className={`cursor-pointer border-t border-border transition hover:bg-accent/40 ${selectedTestId === id ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{getTitle(test)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{test.code || test.testCode || '—'}</td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(test)}</span></td>
                      <td className="px-4 py-3">{getValue(test, ['sampleType', 'sample'])}</td>
                      <td className="px-4 py-3">{getValue(test, ['price'], null) != null ? Number(getValue(test, ['price'], null)).toLocaleString('en-IN') : '—'}</td>
                      <td className="px-4 py-3">{getValue(test, ['reportTime', 'tat', 'turnaroundTime'])}</td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs ${isActive(test) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(test) ? 'Active' : 'Inactive'}</span></td>
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
                                setMenuOpen({ id, test, top: rect.bottom + 4, left: rect.right - 140 })
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
          {selectedTest && (
            <TestDetailsPanel test={selectedTest} style={selectedTestStyle} catColor={selectedTestCatColor} onClose={() => setSelectedTestId(null)} />
          )}
        </div>
      )}

      {filtered.length > 0 && <div className="flex flex-col gap-3 pb-2 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between"><p>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} tests</p><div className="flex flex-wrap items-center gap-2"><button type="button" aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"><ChevronLeft size={17} /></button>{pageNumbers.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className="px-1">…</span> : <button key={item} type="button" onClick={() => setPage(item)} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 font-medium transition ${page === item ? 'bg-primary text-white' : 'hover:bg-accent text-foreground'}`}>{item}</button>)}<button type="button" aria-label="Next page" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"><ChevronRight size={17} /></button><select aria-label="Tests per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="ml-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}</select></div></div>}

      <AddTestModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={onRefresh} />
      <AddTestModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, test: null, mode: 'create' })}
        onCreated={onRefresh}
        initialData={editModal.test}
        testId={editModal.test?._id || editModal.test?.id}
        mode={editModal.mode}
      />
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, test: null, loading: false })}
        onConfirm={confirmDelete}
        title="Delete Test"
        message={`Are you sure you want to delete "${getTitle(deleteModal.test || {})}"? This action cannot be undone.`}
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
            <button onClick={(e) => { e.stopPropagation(); setSelectedTestId(menuOpen.id); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Eye size={14} /> View
            </button>
            <Can resource="tests" action="update">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(menuOpen.test); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <Pencil size={14} /> Edit
              </button>
            </Can>
            <Can resource="tests" action="create">
              <button onClick={(e) => { e.stopPropagation(); handleDuplicate(menuOpen.test); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <Copy size={14} /> Duplicate
              </button>
            </Can>
            <Can resource="tests" action="delete">
              <button onClick={(e) => { e.stopPropagation(); handleDelete(menuOpen.test); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                <Trash2 size={14} /> Delete
              </button>
            </Can>
          </div>
        </>
      )}
    </section>
  )
}

export default TestsManagePage