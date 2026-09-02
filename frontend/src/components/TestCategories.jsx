import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useCategories } from '@/hooks/useCategories'
import { useTests } from '@/hooks/useTests'
import { getIconById } from '@/components/icons/MedicalIcons'

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

const TestCategories = () => {
  const navigate = useNavigate()

  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useCategories()
  const { data: testsData } = useTests()

  const categoriesRes = categoriesData?.data
  const categories = categoriesRes?.categories || categoriesRes?.data?.categories || []
  const testsRes = testsData?.data
  const tests = Array.isArray(testsRes?.data) ? testsRes.data : Array.isArray(testsRes) ? testsRes : []

  const categoriesWithCount = categories
    .filter((cat) => cat.isActive !== false)
    .map((cat) => {
      const count = tests.filter((test) => {
        const testCategory = typeof test.category === 'object' ? test.category?._id : test.category
        return testCategory === cat._id
      }).length
      return { ...cat, testCount: count }
    })

  const handleCategoryClick = (categoryName) => {
    navigate(`${ROUTES.TESTS}?category=${encodeURIComponent(categoryName)}`)
  }

  if (categoriesLoading) {
    return (
      <section className="bg-white py-10 border-b border-border">
        <div className="enterprise-container">
          <h2 className="font-heading font-bold text-xl lg:text-2xl text-foreground text-center mb-8">
            Popular Health Test Categories
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 lg:justify-center lg:flex-wrap lg:gap-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-[120px] lg:w-[155px] bg-gray-50 border border-gray-100 rounded-2xl p-4 lg:p-5 animate-pulse">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-200 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categoriesError || categoriesWithCount.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-10 border-b border-border">
      <div className="enterprise-container">
        <h2 className="font-heading font-bold text-xl lg:text-2xl text-foreground text-center mb-8">
          Popular Health Test Categories
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-4 lg:justify-center lg:flex-wrap lg:gap-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categoriesWithCount.map((cat) => {
            const iconId = cat.icon || 'flask'
            const IconComponent = getIconById(iconId)
            const bgColor = iconBgColors[iconId] || 'bg-primary/10'
            const textColor = iconTextColors[iconId] || 'text-primary'
            return (
              <div
                key={cat._id}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex-shrink-0 w-[120px] lg:w-[155px] bg-gray-50 hover:bg-primary/5 border border-gray-100 hover:border-primary/20 rounded-2xl p-4 lg:p-5 cursor-pointer transition group text-center"
              >
                <div
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition overflow-hidden ${cat.customIcon ? 'bg-primary/10' : bgColor}`}
                >
                  {cat.customIcon ? (
                    <img src={cat.customIcon} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <IconComponent size={24} className={`${textColor} lg:hidden`} />
                      <IconComponent size={28} className={`${textColor} hidden lg:block`} />
                    </>
                  )}
                </div>
                <h3 className="font-semibold text-xs lg:text-sm text-foreground mb-1 truncate">
                  {cat.name}
                </h3>
                <div className="flex items-center justify-center gap-1 text-[10px] lg:text-xs text-muted-foreground">
                  <span>{cat.testCount}+ Tests</span>
                  <ChevronRight size={10} className="lg:hidden text-muted-foreground group-hover:text-primary transition" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TestCategories
