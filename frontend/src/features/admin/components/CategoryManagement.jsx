import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  X,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from 'lucide-react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus,
} from '@/services/category.service'
import CategoryModal from './CategoryModal'
import Button from '@/components/ui/Button'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Can from '@/components/Can'
import { getIconById } from '@/components/icons/MedicalIcons'
import { ROUTES } from '@/constants/routes'

const ITEMS_PER_PAGE = 6

const iconBgColors = {
  blood: 'bg-red-100',
  flask: 'bg-teal-100',
  shield: 'bg-purple-100',
  heart: 'bg-pink-100',
  kidney: 'bg-orange-100',
  liver: 'bg-rose-100',
  thyroid: 'bg-pink-100',
  stomach: 'bg-teal-100',
  brain: 'bg-teal-100',
  user: 'bg-orange-100',
  dna: 'bg-blue-100',
  pill: 'bg-amber-100',
  ribbon: 'bg-pink-100',
  microscope: 'bg-blue-100',
  stethoscope: 'bg-teal-100',
}

const iconTextColors = {
  blood: 'text-red-500',
  flask: 'text-teal-500',
  shield: 'text-purple-500',
  heart: 'text-pink-500',
  kidney: 'text-orange-500',
  liver: 'text-rose-500',
  thyroid: 'text-pink-500',
  stomach: 'text-teal-500',
  brain: 'text-teal-500',
  user: 'text-orange-500',
  dna: 'text-blue-500',
  pill: 'text-amber-500',
  ribbon: 'text-pink-500',
  microscope: 'text-blue-500',
  stethoscope: 'text-teal-500',
}

const CategoryManagement = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [subSearchQuery, setSubSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: 'flask', customIcon: null, isActive: true })
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', description: '', isActive: true })
  const [menuOpen, setMenuOpen] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, target: null })
  const [deleting, setDeleting] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingSubcategory, setSavingSubcategory] = useState(false)
  const [activeTab, setActiveTab] = useState('subcategories')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory?._id) {
      fetchSubcategories(selectedCategory._id)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data } = await getCategories()
      const list = data?.categories || []
      setCategories(list)
      if (list.length > 0 && !selectedCategory) {
        setSelectedCategory(list[0])
      } else if (selectedCategory) {
        const updated = list.find((c) => c._id === selectedCategory._id)
        if (updated) setSelectedCategory(updated)
      }
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async (categoryId) => {
    try {
      const { data } = await getSubcategories({ category: categoryId })
      setSubcategories(data?.subcategories || [])
    } catch (err) {
      console.error('Failed to fetch subcategories', err)
      setSubcategories([])
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSubcategories = subcategories.filter((s) =>
    s.name?.toLowerCase().includes(subSearchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSubcategories.length / ITEMS_PER_PAGE)
  const paginatedSubcategories = filteredSubcategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSaveCategory = async () => {
    try {
      setSavingCategory(true)
      if (editingCategory) {
        await updateCategory(editingCategory._id, categoryForm)
      } else {
        await createCategory(categoryForm)
      }
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', icon: 'flask', customIcon: null, isActive: true })
      fetchCategories()
    } catch (err) {
      console.error('Failed to save category', err)
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    setDeleteModal({ open: true, type: 'category', target: id })
  }

  const handleConfirmDeleteCategory = async () => {
    try {
      setDeleting(true)
      await deleteCategory(deleteModal.target)
      toast.success('Category deleted successfully')
      if (selectedCategory?._id === deleteModal.target) {
        setSelectedCategory(null)
        setSubcategories([])
      }
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    } finally {
      setDeleting(false)
      setDeleteModal({ open: false, type: null, target: null })
    }
  }

  const handleToggleCategoryStatus = async (id) => {
    try {
      await toggleCategoryStatus(id)
      fetchCategories()
    } catch (err) {
      console.error('Failed to toggle category status', err)
    }
  }

  const handleSaveSubcategory = async () => {
    try {
      setSavingSubcategory(true)
      const payload = { ...subcategoryForm, category: selectedCategory._id }
      if (editingSubcategory) {
        await updateSubcategory(editingSubcategory._id, payload)
      } else {
        await createSubcategory(payload)
      }
      setShowSubcategoryModal(false)
      setEditingSubcategory(null)
      setSubcategoryForm({ name: '', description: '', isActive: true })
      fetchSubcategories(selectedCategory._id)
    } catch (err) {
      console.error('Failed to save subcategory', err)
    } finally {
      setSavingSubcategory(false)
    }
  }

  const handleDeleteSubcategory = async (subId) => {
    setDeleteModal({ open: true, type: 'subcategory', target: subId })
  }

  const handleConfirmDeleteSubcategory = async () => {
    try {
      setDeleting(true)
      await deleteSubcategory(deleteModal.target)
      toast.success('Subcategory deleted successfully')
      fetchSubcategories(selectedCategory._id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subcategory')
    } finally {
      setDeleting(false)
      setDeleteModal({ open: false, type: null, target: null })
    }
  }

  const handleConfirmDelete = async () => {
    if (deleteModal.type === 'category') {
      await handleConfirmDeleteCategory()
    } else if (deleteModal.type === 'subcategory') {
      await handleConfirmDeleteSubcategory()
    }
  }

  const handleToggleSubcategoryStatus = async (id) => {
    try {
      await toggleSubcategoryStatus(id)
      fetchSubcategories(selectedCategory._id)
    } catch (err) {
      console.error('Failed to toggle subcategory status', err)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-foreground">Category Management</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1 ml-7">
              Create and manage test categories and their subcategories.
            </p>
          </div>
          <Can resource="categories" action="create">
            <button
              onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', icon: 'flask', customIcon: null, isActive: true }); setShowCategoryModal(true) }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition flex-shrink-0"
            >
              <Plus size={16} />
              Add Category
            </button>
          </Can>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left Panel - Categories */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-foreground">Categories</h3>
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  {categories.length} Total
                </span>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No categories found</div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => { setSelectedCategory(category); setCurrentPage(1); setSubSearchQuery('') }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-border transition
                      ${selectedCategory?._id === category._id
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-accent border-l-2 border-l-transparent'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${category.customIcon ? 'bg-primary/10' : (iconBgColors[category.icon] || 'bg-primary/10')}`}>
                      {category.customIcon ? (
                        <img src={category.customIcon} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        (() => {
                          const IconComponent = getIconById(category.icon || 'flask')
                          const textColor = iconTextColors[category.icon] || 'text-primary'
                          return <IconComponent size={20} className={textColor} />
                        })()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{category.name}</p>
                        {!category.isActive && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.subcategoryCount || 0} Subcategories &nbsp;&middot;&nbsp; {category.testCount || 0} Tests
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === category._id ? null : category._id) }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === category._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                          <Can resource="categories" action="update">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(category)
                                setCategoryForm({
                                  name: category.name,
                                  description: category.description || '',
                                  icon: category.icon || 'flask',
                                  customIcon: category.customIcon || null,
                                  isActive: category.isActive !== false,
                                })
                                setShowCategoryModal(true)
                                setMenuOpen(null)
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          </Can>
                          <Can resource="categories" action="update">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleCategoryStatus(category._id); setMenuOpen(null) }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                            >
                              {category.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              {category.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          </Can>
                          <Can resource="categories" action="delete">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category._id); setMenuOpen(null) }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </Can>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border">
              <Can resource="categories" action="create">
                <button
                  onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', icon: 'flask', customIcon: null, isActive: true }); setShowCategoryModal(true) }}
                  className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
                >
                  <Plus size={14} /> Add New Category
                </button>
              </Can>
            </div>
          </div>
        </div>

        {/* Right Panel - Subcategories */}
        <div className="flex-1 min-w-0">
          {selectedCategory ? (
            <>
              {/* Category Detail Card */}
              <div className="bg-white border border-border rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${selectedCategory.customIcon ? 'bg-primary/10' : (iconBgColors[selectedCategory.icon] || 'bg-primary/10')}`}>
                      {selectedCategory.customIcon ? (
                        <img src={selectedCategory.customIcon} alt={selectedCategory.name} className="w-full h-full object-cover" />
                      ) : (
                        (() => {
                          const IconComponent = getIconById(selectedCategory.icon || 'flask')
                          const textColor = iconTextColors[selectedCategory.icon] || 'text-primary'
                          return <IconComponent size={28} className={textColor} />
                        })()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-foreground">{selectedCategory.name}</h2>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          selectedCategory.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedCategory.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{subcategories.length} Subcategories</span>
                        <span>&middot;</span>
                        <span>{selectedCategory.testCount || 0} Tests</span>
                      </div>
                      {selectedCategory.description && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedCategory.description}</p>
                      )}
                    </div>
                  </div>
                  <Can resource="categories" action="update">
                    <button
                      onClick={() => {
                        setEditingCategory(selectedCategory)
                        setCategoryForm({
                          name: selectedCategory.name,
                          description: selectedCategory.description || '',
                          icon: selectedCategory.icon || 'flask',
                          customIcon: selectedCategory.customIcon || null,
                          isActive: selectedCategory.isActive !== false,
                        })
                        setShowCategoryModal(true)
                      }}
                      className="inline-flex items-center gap-2 border border-border text-foreground hover:bg-accent px-3 py-2 rounded-lg text-sm font-medium transition flex-shrink-0"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </Can>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="border-b border-border">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('subcategories')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === 'subcategories'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Subcategories <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{subcategories.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === 'details'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab('icon')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === 'icon'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Icon & Visuals
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === 'settings'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Settings
                    </button>
                  </div>
                </div>

                {activeTab === 'subcategories' && (
                  <div>
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Subcategories</h3>
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                          {subcategories.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative hidden sm:block">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search subcategories..."
                            value={subSearchQuery}
                            onChange={(e) => { setSubSearchQuery(e.target.value); setCurrentPage(1) }}
                            className="pl-8 pr-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-[200px]"
                          />
                        </div>
                        <Can resource="subcategories" action="create">
                          <button
                            onClick={() => { setEditingSubcategory(null); setSubcategoryForm({ name: '', description: '', isActive: true }); setShowSubcategoryModal(true) }}
                            className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
                          >
                            <Plus size={14} /> Add Subcategory
                          </button>
                        </Can>
                      </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="sm:hidden">
                      {paginatedSubcategories.length === 0 ? (
                        <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No subcategories found
                        </div>
                      ) : (
                        paginatedSubcategories.map((sub) => (
                          <div key={sub._id} className="px-4 py-3 border-b border-border last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground">{sub.name}</p>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    sub.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {sub.isActive !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                {sub.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {sub.testCount || 0} Tests
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-3">
                                <Can resource="subcategories" action="update">
                                  <button
                                    onClick={() => {
                                      setEditingSubcategory(sub)
                                      setSubcategoryForm({
                                        name: sub.name,
                                        description: sub.description || '',
                                        isActive: sub.isActive !== false,
                                      })
                                      setShowSubcategoryModal(true)
                                    }}
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                </Can>
                                <ChevronRight size={16} className="text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {filteredSubcategories.length > 5 && (
                        <button className="w-full px-4 py-3 text-sm text-primary font-semibold hover:bg-accent transition border-t border-border">
                          View All {filteredSubcategories.length} Subcategories
                        </button>
                      )}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden sm:block">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Subcategory Name</th>
                            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tests</th>
                            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedSubcategories.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                                No subcategories found
                              </td>
                            </tr>
                          ) : (
                            paginatedSubcategories.map((sub) => (
                              <tr key={sub._id} className="border-b border-border hover:bg-accent/50 transition">
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-foreground">{sub.name}</p>
                                  {sub.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{sub.description}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{sub.testCount || 0} Tests</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleToggleSubcategoryStatus(sub._id)}
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer ${
                                      sub.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {sub.isActive !== false ? 'Active' : 'Inactive'}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <Can resource="subcategories" action="update">
                                      <button
                                        onClick={() => {
                                          setEditingSubcategory(sub)
                                          setSubcategoryForm({
                                            name: sub.name,
                                            description: sub.description || '',
                                            isActive: sub.isActive !== false,
                                          })
                                          setShowSubcategoryModal(true)
                                        }}
                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                    </Can>
                                    <Can resource="subcategories" action="delete">
                                      <button
                                        onClick={() => handleDeleteSubcategory(sub._id)}
                                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </Can>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubcategories.length)} of{' '}
                            {filteredSubcategories.length} subcategories
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
                                    ? 'bg-primary text-white'
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
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedCategory.description || 'No description provided.'}</p>
                  </div>
                )}

                {activeTab === 'icon' && (
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Category Icon</h3>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${selectedCategory.customIcon ? 'bg-primary/10' : (iconBgColors[selectedCategory.icon] || 'bg-primary/10')}`}>
                        {selectedCategory.customIcon ? (
                          <img src={selectedCategory.customIcon} alt={selectedCategory.name} className="w-full h-full object-cover" />
                        ) : (
                          (() => {
                            const IconComponent = getIconById(selectedCategory.icon || 'flask')
                            const textColor = iconTextColors[selectedCategory.icon] || 'text-primary'
                            return <IconComponent size={32} className={textColor} />
                          })()
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-foreground font-medium">{selectedCategory.customIcon ? 'Custom Icon' : selectedCategory.icon || 'flask'}</p>
                        <p className="text-xs text-muted-foreground">{selectedCategory.customIcon ? 'Uploaded image' : 'Icon identifier'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Category Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          selectedCategory.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedCategory.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Subcategories</span>
                        <span className="text-sm font-medium text-foreground">{subcategories.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Tests</span>
                        <span className="text-sm font-medium text-foreground">{selectedCategory.testCount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </>
          ) : (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Select a category to view subcategories</p>
            </div>
          )}

         
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null) }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        form={categoryForm}
        setForm={setCategoryForm}
        saving={savingCategory}
      />

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <button onClick={() => { setShowSubcategoryModal(false); setEditingSubcategory(null) }} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Subcategory name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Description (optional)"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Active</label>
                <button
                  type="button"
                  onClick={() => setSubcategoryForm({ ...subcategoryForm, isActive: !subcategoryForm.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    subcategoryForm.isActive ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    subcategoryForm.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => { setShowSubcategoryModal(false); setEditingSubcategory(null) }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">
                Cancel
              </button>
              <Button
                onClick={handleSaveSubcategory}
                disabled={!subcategoryForm.name.trim()}
                loading={savingSubcategory}
              >
                {editingSubcategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, target: null })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteModal.type === 'category' ? 'Category' : 'Subcategory'}`}
        message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default CategoryManagement
