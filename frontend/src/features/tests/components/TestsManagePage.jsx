import React, { useMemo, useState, useCallback, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronsUpDown,
  Copy,
  Eye,
  EyeOff,
  FlaskConical,
  Grid2X2,
  List,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  MoreVertical,
  Trash2,
  XCircle,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import Pagination from '@/components/ui/Pagination'
import AddTestModal from './AddTestModal'
import BookTestModal from '@/features/booking/components/BookTestModal'
import { AuthContext } from '@/context/AuthContext'
import { deleteTest } from '@/services/test.service'
import { getIconById } from '@/components/icons/MedicalIcons'
import { TestCard } from './TestCard'

const PAGE_SIZE = 12
const PAGE_SIZES = [12, 24, 48]

const ICON_STYLES = {
  blood: { bg: 'bg-red-50', text: 'text-red-500' },
  flask: { bg: 'bg-teal-50', text: 'text-teal-500' },
  shield: { bg: 'bg-violet-50', text: 'text-violet-500' },
  heart: { bg: 'bg-pink-50', text: 'text-pink-500' },
  kidney: { bg: 'bg-orange-50', text: 'text-orange-500' },
  liver: { bg: 'bg-red-50', text: 'text-red-500' },
  thyroid: { bg: 'bg-pink-50', text: 'text-pink-500' },
  stomach: { bg: 'bg-teal-50', text: 'text-teal-500' },
  brain: { bg: 'bg-teal-50', text: 'text-teal-500' },
  user: { bg: 'bg-orange-50', text: 'text-orange-500' },
  dna: { bg: 'bg-blue-50', text: 'text-blue-500' },
  pill: { bg: 'bg-orange-50', text: 'text-orange-500' },
  ribbon: { bg: 'bg-pink-50', text: 'text-pink-500' },
  microscope: { bg: 'bg-blue-50', text: 'text-blue-500' },
  stethoscope: { bg: 'bg-teal-50', text: 'text-teal-500' },
}

const DEFAULT_ICON_STYLE = { bg: 'bg-blue-50', text: 'text-blue-500' }

const getTestIcon = (test) => {
  const iconName = test.icon?.name || test.category?.icon || 'flask'
  return getIconById(iconName)
}

const getTestIconStyle = (test) => {
  const iconName = test.icon?.name || test.category?.icon || 'flask'
  return ICON_STYLES[iconName] || DEFAULT_ICON_STYLE
}

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

const TestDetailsPanel = ({ test, style, catColor, onClose }) => {
  if (!test) return null
  const Icon = getTestIcon(test)
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

const TestsManagePage = ({ tests, isLoading, isError, onRefresh }) => {
  const { user } = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const isPatient = user?.role === 'patient'
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [showCreate, setShowCreate] = useState(false)
  const [bookModal, setBookModal] = useState({ open: false, test: null })
  const [selectedTestId, setSelectedTestId] = useState(null)
  const [editModal, setEditModal] = useState({ open: false, test: null, mode: 'create' })
  const [deleteModal, setDeleteModal] = useState({ open: false, test: null, loading: false })
  const [menuOpen, setMenuOpen] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [hiddenColumns, setHiddenColumns] = useState({})

  const handleSort = useCallback((key, direction) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === direction) {
        return { key: null, direction: null }
      }
      return { key, direction }
    })
  }, [])

  useEffect(() => {
    if (searchParams.get('modal') === 'create-test') {
      setShowCreate(true)
      searchParams.delete('modal')
      setSearchParams(searchParams, { replace: true })
    }
    if (searchParams.get('book') === 'true') {
      setBookModal({ open: true, test: null })
      searchParams.delete('book')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

  const getSortValue = useCallback((test, key) => {
    switch (key) {
      case 'name': return getTitle(test).toLowerCase()
      case 'code': return (test.code || test.testCode || '').toLowerCase()
      case 'category': return getCategory(test).toLowerCase()
      case 'sampleType': return getValue(test, ['sampleType', 'sample'], '').toLowerCase()
      case 'price': return Number(getValue(test, ['price'], 0)) || 0
      case 'tat': return getValue(test, ['reportTime', 'tat', 'turnaroundTime'], '')
      case 'status': return isActive(test) ? 'active' : 'inactive'
      default: return ''
    }
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = tests.filter((test) => {
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
  }, [tests, search, activeFilters, sortConfig, getSortValue])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleTests = filtered.slice((page - 1) * pageSize, page * pageSize)

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
  const selectedTestStyle = selectedTest ? getTestIconStyle(selectedTest) : DEFAULT_ICON_STYLE
  const selectedTestCatColor = selectedTest ? getCategoryColor(getCategory(selectedTest)) : CATEGORY_COLORS[0]

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">Tests</h1>
        {isPatient ? (
          <Button onClick={() => setBookModal({ open: true, test: null })} className="shrink-0">
            <ShoppingCart size={18} className="mr-2" />Book a Test
          </Button>
        ) : (
          <Can resource="tests" action="create">
            <Button onClick={() => setShowCreate(true)} className="shrink-0">
              <Plus size={18} className="mr-2" />Add Test
            </Button>
          </Can>
        )}
      </div>

      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and view all laboratory tests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search tests by name or code..." className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" />
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
              <button type="button" aria-label="Grid view" onClick={() => { setView('grid'); setSelectedTestId(null) }} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
            </Tooltip>
            <Tooltip title="List View" arrow placement="top">
              <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded p-1.5 ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
            </Tooltip>
          </div>
          {isPatient ? (
            <Button onClick={() => setBookModal({ open: true, test: null })} className="shrink-0">
              <ShoppingCart size={18} className="mr-2" />Book a Test
            </Button>
          ) : (
            <Can resource="tests" action="create">
              <Button onClick={() => setShowCreate(true)} className="shrink-0">
                <Plus size={18} className="mr-2" />Add Test
              </Button>
            </Can>
          )}
        </div>
      </div>

      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search tests by name or code..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
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
            <button type="button" aria-label="Grid view" onClick={() => { setView('grid'); setSelectedTestId(null) }} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
          </Tooltip>
          <Tooltip title="List View" arrow placement="top">
            <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded p-1.5 ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
          </Tooltip>
        </div>
      </div>

      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={List}
              borderColor="border-blue-200"
              iconColor="text-blue-500"
              cardBg="bg-blue-50"
              title="Total Tests"
              value={tests.length}
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
              title="Active Tests"
              value={activeTests.length}
              detailTop={tests.length ? `${((activeTests.length / tests.length) * 100).toFixed(2)}%` : '0%'}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={XCircle}
              borderColor="border-orange-200"
              iconColor="text-orange-500"
              cardBg="bg-orange-50"
              title="Inactive Tests"
              value={tests.length - activeTests.length}
              detailTop={tests.length ? `${(((tests.length - activeTests.length) / tests.length) * 100).toFixed(2)}%` : '0%'}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={FlaskConical}
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

      {isLoading ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading tests…</div> : isError ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load tests. Please try again.</div> : visibleTests.length === 0 ? <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No tests match the selected filters.</div> : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTests.map((test, index) => {
            const id = getTestId(test, index)
            return (
              <TestCard
                key={id}
                test={test}
                isPatient={isPatient}
                onView={() => setSelectedTestId(id)}
                onEdit={isPatient ? undefined : () => handleEdit(test)}
                onDuplicate={isPatient ? undefined : () => handleDuplicate(test)}
                onDelete={isPatient ? undefined : () => handleDelete(test)}
                onBook={isPatient ? () => setBookModal({ open: true, test }) : undefined}
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
                  <SortableHeader title="Test Name" sortKey="name" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, name: true }))} />
                  <SortableHeader title="Test Code" sortKey="code" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, code: true }))} />
                  <SortableHeader title="Category" sortKey="category" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, category: true }))} />
                  <SortableHeader title="Sample Type" sortKey="sampleType" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, sampleType: true }))} />
                  <SortableHeader title="Price (₹)" sortKey="price" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, price: true }))} />
                  <SortableHeader title="TAT" sortKey="tat" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, tat: true }))} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, status: true }))} />
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTests.map((test, index) => {
                  const id = getTestId(test, index)
                  const catColor = getCategoryColor(getCategory(test))
                  return (
                    <tr key={id} onClick={() => setSelectedTestId(id)} className={`cursor-pointer border-t border-border transition hover:bg-accent/40 ${selectedTestId === id ? 'bg-primary/5' : ''}`}>
                      {!hiddenColumns.name && <td className="px-4 py-3 font-medium text-foreground">{getTitle(test)}</td>}
                      {!hiddenColumns.code && <td className="px-4 py-3 text-muted-foreground">{test.code || test.testCode || '—'}</td>}
                      {!hiddenColumns.category && <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${catColor.bg} ${catColor.text}`}>{getCategory(test)}</span></td>}
                      {!hiddenColumns.sampleType && <td className="px-4 py-3">{getValue(test, ['sampleType', 'sample'])}</td>}
                      {!hiddenColumns.price && <td className="px-4 py-3">{getValue(test, ['price'], null) != null ? Number(getValue(test, ['price'], null)).toLocaleString('en-IN') : '—'}</td>}
                      {!hiddenColumns.tat && <td className="px-4 py-3">{getValue(test, ['reportTime', 'tat', 'turnaroundTime'])}</td>}
                      {!hiddenColumns.status && <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs ${isActive(test) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isActive(test) ? 'Active' : 'Inactive'}</span></td>}
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {isPatient && (
                            <Tooltip title="Book" arrow placement="top">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setBookModal({ open: true, test }) }}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition"
                              >
                                <ShoppingCart size={15} />
                              </button>
                            </Tooltip>
                          )}
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
        </div>
      )}

      {selectedTest && (
        <TestDetailsPanel test={selectedTest} style={selectedTestStyle} catColor={selectedTestCatColor} onClose={() => setSelectedTestId(null)} />
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
          itemName="tests"
        />
      </div>

      <AddTestModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={onRefresh} />
      <AddTestModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, test: null, mode: 'create' })}
        onCreated={onRefresh}
        initialData={editModal.test}
        testId={editModal.test?._id || editModal.test?.id}
        mode={editModal.mode}
      />
      <BookTestModal
        open={bookModal.open}
        onClose={() => setBookModal({ open: false, test: null })}
        preselectedTest={bookModal.test}
        onBooked={onRefresh}
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

      {filterPanelOpen && createPortal(
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Filters"
          categories={filterCategories}
          activeFilters={activeFilters}
        />,
        document.body
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
            {isPatient && (
              <button onClick={(e) => { e.stopPropagation(); setBookModal({ open: true, test: menuOpen.test }); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <ShoppingCart size={14} /> Book
              </button>
            )}
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