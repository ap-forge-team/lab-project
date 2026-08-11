import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '@/services/category.service'
import CategoryModal from './CategoryModal'

const ITEMS_PER_PAGE = 6

const CategoryManagement = () => {
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
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', status: 'active' })
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', description: '', status: 'active' })
  const [menuOpen, setMenuOpen] = useState(null)

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
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setCategories(list)
      if (list.length > 0 && !selectedCategory) {
        setSelectedCategory(list[0])
      }
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async (categoryId) => {
    try {
      const { data } = await getSubcategories(categoryId)
      setSubcategories(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
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
      if (editingCategory) {
        await updateCategory(editingCategory._id, categoryForm)
      } else {
        await createCategory(categoryForm)
      }
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', status: 'active' })
      fetchCategories()
    } catch (err) {
      console.error('Failed to save category', err)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      if (selectedCategory?._id === id) {
        setSelectedCategory(null)
        setSubcategories([])
      }
      fetchCategories()
    } catch (err) {
      console.error('Failed to delete category', err)
    }
  }

  const handleSaveSubcategory = async () => {
    try {
      if (editingSubcategory) {
        await updateSubcategory(selectedCategory._id, editingSubcategory._id, subcategoryForm)
      } else {
        await createSubcategory(selectedCategory._id, subcategoryForm)
      }
      setShowSubcategoryModal(false)
      setEditingSubcategory(null)
      setSubcategoryForm({ name: '', description: '', status: 'active' })
      fetchSubcategories(selectedCategory._id)
    } catch (err) {
      console.error('Failed to save subcategory', err)
    }
  }

  const handleDeleteSubcategory = async (subId) => {
    if (!confirm('Delete this subcategory?')) return
    try {
      await deleteSubcategory(selectedCategory._id, subId)
      fetchSubcategories(selectedCategory._id)
    } catch (err) {
      console.error('Failed to delete subcategory', err)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>Settings</span>
        <span>/</span>
        <span className="text-foreground font-medium">Categories</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Category Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create and manage test categories and their subcategories.
            </p>
          </div>
          <button
            onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', status: 'active' }); setShowCategoryModal(true) }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            <Plus size={16} />
            Add Category
          </button>
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-bold">{category.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.subcategoryCount || 0} Subcategories &middot; {category.testCount || 0} Tests
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
                        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingCategory(category); setCategoryForm({ name: category.name, description: category.description || '', status: category.status || 'active' }); setShowCategoryModal(true); setMenuOpen(null) }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category._id); setMenuOpen(null) }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', status: 'active' }); setShowCategoryModal(true) }}
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
              >
                <Plus size={14} /> Add New Category
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Subcategories */}
        <div className="flex-1 min-w-0">
          {selectedCategory ? (
            <>
              {/* Category Detail Card */}
              <div className="bg-white border border-border rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xl font-bold">{selectedCategory.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground">{selectedCategory.name}</h2>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {selectedCategory.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{selectedCategory.subcategoryCount || subcategories.length} Subcategories</span>
                        <span>&middot;</span>
                        <span>{selectedCategory.testCount || 0} Tests</span>
                      </div>
                      {selectedCategory.description && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedCategory.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingCategory(selectedCategory); setCategoryForm({ name: selectedCategory.name, description: selectedCategory.description || '', status: selectedCategory.status || 'active' }); setShowCategoryModal(true) }}
                    className="inline-flex items-center gap-2 border border-border text-foreground hover:bg-accent px-3 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <Edit2 size={14} /> Edit Category
                  </button>
                </div>
              </div>

              {/* Subcategories Table */}
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Subcategories</h3>
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                      {subcategories.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search subcategories..."
                        value={subSearchQuery}
                        onChange={(e) => { setSubSearchQuery(e.target.value); setCurrentPage(1) }}
                        className="pl-8 pr-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-[200px]"
                      />
                    </div>
                    <button
                      onClick={() => { setEditingSubcategory(null); setSubcategoryForm({ name: '', description: '', status: 'active' }); setShowSubcategoryModal(true) }}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                    >
                      <Plus size={14} /> Add Subcategory
                    </button>
                  </div>
                </div>

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
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {sub.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingSubcategory(sub); setSubcategoryForm({ name: sub.name, description: sub.description || '', status: sub.status || 'active' }); setShowSubcategoryModal(true) }}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub._id)}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition"
                              >
                                <Trash2 size={14} />
                              </button>
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
            </>
          ) : (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Select a category to view subcategories</p>
            </div>
          )}

          {/* How it works */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">How it works?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create categories and subcategories to organize tests better. You can add, edit, delete or reorder subcategories as per your requirement.
              </p>
            </div>
            <button className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline flex-shrink-0">
              Learn More <ExternalLink size={12} />
            </button>
          </div>
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  value={subcategoryForm.status}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button onClick={() => { setShowSubcategoryModal(false); setEditingSubcategory(null) }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">
                Cancel
              </button>
              <button
                onClick={handleSaveSubcategory}
                disabled={!subcategoryForm.name.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition disabled:opacity-50"
              >
                {editingSubcategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagement
