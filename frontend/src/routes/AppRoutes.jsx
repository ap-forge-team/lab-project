import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './ProtectedRoutes'
import { Spinner } from '@/components/ui/Loader'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import PageTransition from '@/components/layout/PageTransition'

const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Booking = lazy(() => import('@/pages/Booking'))
const PackagesPage = lazy(() => import('@/pages/PackagesPage'))
const TestsPage = lazy(() => import('@/pages/TestsPage'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const AdminSettings = lazy(() => import('@/pages/AdminSettings'))
const SidebarPage = lazy(() => import('@/pages/SidebarPage'))
const LabAssistantDashboard = lazy(() => import('@/pages/LabAssistantDashboard'))
const LabOwnerDashboard = lazy(() => import('@/pages/LabOwnerDashboard'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const VerifyOtp = lazy(() => import('@/pages/VerifyOtp'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const AboutUs = lazy(() => import('@/pages/AboutUs'))
const ContactUs = lazy(() => import('@/pages/ContactUs'))
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('@/pages/TermsOfService'))
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'))
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const AppRoutes = () => {
  const location = useLocation()
  return (
    <Suspense fallback={<Spinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path={ROUTES.HOME} element={<PageTransition><Home /></PageTransition>} />
        <Route path={ROUTES.LOGIN} element={<PageTransition><Login /></PageTransition>} />
        <Route
          path={ROUTES.LAB_OWNER}
          element={
            <ProtectedRoute roles={[ROLES.LAB_OWNER]}>
              <PageTransition><LabOwnerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.ABOUT} element={<PageTransition><AboutUs /></PageTransition>} />
        <Route path={ROUTES.CONTACT} element={<PageTransition><ContactUs /></PageTransition>} />
        <Route path={ROUTES.SIGNUP} element={<PageTransition><Signup /></PageTransition>} />
        <Route path={ROUTES.PACKAGES} element={<PageTransition><PackagesPage /></PageTransition>} />
        <Route
          path={ROUTES.LAB_ASSISTANT}
          element={
            <ProtectedRoute roles={[ROLES.LAB_ASSISTANT]}>
              <PageTransition><LabAssistantDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.TESTS} element={<PageTransition><TestsPage /></PageTransition>} />
        <Route
          path={ROUTES.ADMIN}
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <PageTransition><AdminSettings /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/:page"
          element={<ProtectedRoute roles={[ROLES.ADMIN]}><PageTransition><SidebarPage /></PageTransition></ProtectedRoute>}
        />
        <Route
          path={`${ROUTES.ADMIN_SETTINGS}/:section`}
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <PageTransition><AdminSettings /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BOOKING}
          element={
            <ProtectedRoute roles={[ROLES.PATIENT]}>
              <PageTransition><Booking /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab-owner/:page"
          element={<ProtectedRoute roles={[ROLES.LAB_OWNER]}><PageTransition><SidebarPage /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/lab-assistant/:page"
          element={<ProtectedRoute roles={[ROLES.LAB_ASSISTANT]}><PageTransition><SidebarPage /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/booking/:page"
          element={<ProtectedRoute roles={[ROLES.PATIENT]}><PageTransition><SidebarPage /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/upload-prescription"
          element={<ProtectedRoute roles={[ROLES.PATIENT]}><PageTransition><SidebarPage page="upload-prescription" /></PageTransition></ProtectedRoute>}
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute roles={[ROLES.PATIENT]}>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path={ROUTES.VERIFY_OTP} element={<PageTransition><VerifyOtp /></PageTransition>} />
        <Route path={ROUTES.RESET_PASSWORD} element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path={ROUTES.PRIVACY_POLICY} element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path={ROUTES.TERMS_OF_SERVICE} element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path={ROUTES.REFUND_POLICY} element={<PageTransition><RefundPolicy /></PageTransition>} />
        <Route path={ROUTES.COOKIE_POLICY} element={<PageTransition><CookiePolicy /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
export default AppRoutes
