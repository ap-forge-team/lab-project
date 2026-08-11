import React from 'react'
import { X, Info, Upload } from 'lucide-react'
import { MedicalIcons, getIconById } from '@/components/icons/MedicalIcons'

const CategoryModal = ({ isOpen, onClose, onSave, editingCategory, form, setForm }) => {
  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleIconSelect = (iconId) => {
    handleChange('icon', iconId)
  }

  const SelectedIcon = getIconById(form.icon || 'flask')
  const descLength = form.description?.length || 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-2">
          <div>
            <h3 className="font-heading font-bold text-xl text-foreground">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {editingCategory
                ? 'Update this test category and its details.'
                : 'Create a new test category and configure its details.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Icon & Visual */}
          <div>
            <p className="text-sm font-semibold text-foreground">
              Icon & Visual <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Choose an icon and visual identity for this category.
            </p>

            <p className="text-sm font-medium text-foreground mb-2">
              Choose Icon <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-5 gap-2.5">
              {MedicalIcons.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleIconSelect(id)}
                  title={label}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition
                    ${(form.icon || 'flask') === id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-gray-50 border border-border hover:bg-accent'
                    }`}
                >
                  <Icon size={24} />
                  {(form.icon || 'flask') === id && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-start gap-1.5 mt-3 text-xs text-muted-foreground">
              <Info size={13} className="mt-0.5 flex-shrink-0" />
              <span>You can upload a custom icon in SVG, PNG or JPG format.</span>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold mt-3 hover:underline"
            >
              <Upload size={14} /> Upload Custom Icon
            </button>
          </div>

          {/* Right — Form fields + Preview */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value.slice(0, 150))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                rows={3}
                maxLength={150}
                placeholder="Enter a short description about this category"
              />
              <p className="text-right text-[11px] text-muted-foreground mt-1">{descLength}/150</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">Inactive categories will not be visible for selection.</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isActive', !form.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  form.isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Preview</p>
              <div className="border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <SelectedIcon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {form.name || 'Category Name'}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        form.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {form.description || 'Category description will appear here...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">X Subcategories &middot; Y Tests</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-foreground border border-border hover:bg-accent rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!form.name.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition disabled:opacity-50"
          >
            {editingCategory ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal
