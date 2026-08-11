import React, { useState } from 'react'
import {
  X,
  Droplet,
  FlaskConical,
  ShieldPlus,
  HeartPulse,
  Waves,
  Droplets,
  Brain,
  User,
  Dna,
  Pill,
  Ribbon,
  Activity,
  Upload,
  Plus,
  Info,
} from 'lucide-react'

const ICONS = [
  { id: 'droplet', icon: Droplet },
  { id: 'flask', icon: FlaskConical },
  { id: 'shield', icon: ShieldPlus },
  { id: 'heart', icon: HeartPulse },
  { id: 'kidney', icon: Waves },
  { id: 'liver', icon: Droplets },
  { id: 'thyroid', icon: Activity },
  { id: 'stomach', icon: Dna },
  { id: 'brain', icon: Brain },
  { id: 'user', icon: User },
  { id: 'vitamin', icon: Pill },
  { id: 'ribbon', icon: Ribbon },
]

const CategoryModal = ({ isOpen, onClose, onSave, editingCategory, form, setForm }) => {
  const [selectedIcon, setSelectedIcon] = useState(form.icon || 'droplet')

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleIconSelect = (iconId) => {
    setSelectedIcon(iconId)
    handleChange('icon', iconId)
  }

  const SelectedIconComp = ICONS.find((i) => i.id === selectedIcon)?.icon || Droplet
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
              {ICONS.map(({ id, icon: IconComp }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleIconSelect(id)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition
                    ${selectedIcon === id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-gray-50 border border-border hover:bg-accent'
                    }`}
                >
                  <IconComp
                    size={20}
                    className={selectedIcon === id ? 'text-primary' : 'text-foreground/70'}
                  />
                  {selectedIcon === id && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
              <button
                type="button"
                className="w-12 h-12 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition"
              >
                <Plus size={18} />
              </button>
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

            <div>
              <p className="text-sm font-medium text-foreground mb-1">Status</p>
              <button
                type="button"
                onClick={() => handleChange('status', form.status === 'active' ? 'inactive' : 'active')}
                className="flex items-center gap-2"
              >
                <span
                  className={`w-9 h-5 rounded-full transition relative ${
                    form.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
                      form.status === 'active' ? 'left-4' : 'left-0.5'
                    }`}
                  />
                </span>
                <span className="text-sm text-foreground capitalize">{form.status || 'Active'}</span>
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                Inactive categories will not be visible for selection.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Preview</p>
              <div className="border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <SelectedIconComp size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {form.name || 'Category Name'}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        form.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {form.status === 'active' ? 'Active' : 'Inactive'}
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