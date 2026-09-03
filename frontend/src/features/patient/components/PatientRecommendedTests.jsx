import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const testIcons = ['❤️', '💧', '🩸', '🫀', '🧪', '🔬']

const PatientRecommendedTests = ({ data }) => {
  const navigate = useNavigate()

  if (!data || data.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Recommended Tests For You</h3>
        <button
          onClick={() => navigate(ROUTES.TESTS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data.map((test, index) => {
          const discount = test.price > test.offerPrice
            ? Math.round(((test.price - test.offerPrice) / test.price) * 100)
            : 0

          return (
            <div
              key={test._id}
              className="rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <span className="text-xl">{testIcons[index % testIcons.length]}</span>
              </div>
              <p className="font-semibold text-foreground text-sm truncate">{test.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Includes {test.testsCount} Test{test.testsCount > 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="font-bold text-foreground">₹{test.offerPrice}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground line-through">₹{test.price}</span>
                    <span className="text-[10px] font-semibold text-green-600">{discount}% OFF</span>
                  </>
                )}
              </div>
              <button
                onClick={() => navigate(ROUTES.TESTS)}
                className="w-full mt-3 py-1.5 px-3 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
              >
                Book Now
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PatientRecommendedTests
