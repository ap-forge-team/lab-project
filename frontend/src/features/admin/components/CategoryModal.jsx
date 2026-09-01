import React, { useRef } from 'react'
import { X, Info, Upload } from 'lucide-react'
import { MedicalIcons, getIconById } from '@/components/icons/MedicalIcons'
import Button from '@/components/ui/Button'

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
  custom: 'bg-gray-100',
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
  custom: 'text-gray-500',
}

const CategoryModal = ({ isOpen, onClose, onSave, editingCategory, form, setForm, saving = false }) => {
  const fileInputRef = useRef(null)
  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleIconSelect = (iconId) => {
    handleChange('icon', iconId)
  }

  const handleCustomIconUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      alert('Please upload an SVG, PNG, or JPG file')
      return
    }

    const img = new Image()
    const reader = new FileReader()
    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 64
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxSize) { height = (height * maxSize) / width; width = maxSize }
        } else {
          if (height > maxSize) { width = (width * maxSize) / height; height = maxSize }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/png')

        setForm({ ...form, customIcon: compressed, icon: 'custom' })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleCustomIconUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
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
                Description
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
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${form.icon === 'custom' ? 'bg-primary/10' : (iconBgColors[form.icon] || 'bg-primary/10')}`}>
                  {form.customIcon ? (
                    <img src={form.customIcon} alt="Custom icon" className="w-full h-full object-cover" />
                  ) : (
                    (() => {
                      const IconComp = getIconById(form.icon || 'flask')
                      const textColor = iconTextColors[form.icon] || 'text-primary'
                      return <IconComp size={22} className={textColor} />
                    })()
                  )}
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
          <Button
            onClick={onSave}
            disabled={!form.name.trim()}
            loading={saving}
          >
            {editingCategory ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal
