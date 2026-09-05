import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Spinner } from '@/components/ui/Loader'
import { usePatientDashboard } from '@/hooks/usePatientDashboard'
import PatientStatsGrid from '@/features/patient/components/PatientDashboardStats'
import PatientUpcomingBooking from '@/features/patient/components/PatientUpcomingBooking'
import PatientRecommendedTests from '@/features/patient/components/PatientRecommendedTests'
import PatientRecentBookings from '@/features/patient/components/PatientRecentBookings'
import PatientRecommendedPackages from '@/features/patient/components/PatientRecommendedPackages'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const Dashboard = () => {
  const navigate = useNavigate()
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = usePatientDashboard()

  const stats = dashboardData?.stats || {}
  const upcomingBooking = dashboardData?.upcomingBooking || null
  const recentBookings = dashboardData?.recentBookings || []
  const recommendedTests = dashboardData?.recommendedTests || []
  const recommendedPackages = dashboardData?.recommendedPackages || []

  const isInitialLoading = dashboardLoading && !dashboardData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
          </div>
        ) : dashboardError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-red-600 text-xs font-medium">Failed to load dashboard data. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back! 👋
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Take charge of your health. Book tests, track reports and stay healthy.
                </p>
              </div>
              <button
                onClick={() => navigate('/booking/tests?book=true')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition shrink-0"
              >
                Book a Test
              </button>
            </div>

            {/* Stats Grid */}
            <PatientStatsGrid stats={stats} upcomingBooking={upcomingBooking} />

            {/* Upcoming Booking */}
            <PatientUpcomingBooking data={upcomingBooking} />

            {/* Recommended Tests */}
            <PatientRecommendedTests data={recommendedTests} />

            {/* Recent Bookings */}
            <PatientRecentBookings data={recentBookings} />

            {/* Frequently Booked Packages */}
            <PatientRecommendedPackages data={recommendedPackages} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
