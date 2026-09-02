import React from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import Hero from '@/components/Hero'
import TestCategories from '@/components/TestCategories'
import Features from '@/components/Features'
import PopularTests from '@/components/PopularTests'
import PopularPackages from '@/components/PopularPackages'
import WhyChoose from '@/components/WhyChoose'

const Home = () => {
  return (
    <PublicLayout>
      <Hero />
      <Features />
      <TestCategories />
      <PopularTests />
      <PopularPackages />
      <WhyChoose />
    </PublicLayout>
  )
}
export default Home
