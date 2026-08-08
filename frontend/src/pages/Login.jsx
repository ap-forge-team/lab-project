import React, { useState, useEffect, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { loginUser } from '@/services/auth.service'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Logo from '@/components/ui/Logo'

const DNAAnimation = () => {
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    let frameId
    let offset = 0
    const numNodes = 14
    const centerX = 130 // 260 / 2
    const amplitude = 70
    const step = 0.55
    
    const nodesA = []
    const nodesB = []
    const rungs = []
    
    for (let i = 0; i < numNodes; i++) {
      const rung = document.createElement('div')
      rung.style.position = 'absolute'
      rung.style.height = '2px'
      rung.style.background = 'rgba(255,255,255,0.2)'
      containerRef.current.appendChild(rung)
      rungs.push(rung)
      
      const nodeA = document.createElement('div')
      nodeA.style.position = 'absolute'
      nodeA.style.width = '10px'
      nodeA.style.height = '10px'
      nodeA.style.borderRadius = '50%'
      nodeA.style.background = '#2563EB'
      containerRef.current.appendChild(nodeA)
      nodesA.push(nodeA)
      
      const nodeB = document.createElement('div')
      nodeB.style.position = 'absolute'
      nodeB.style.width = '10px'
      nodeB.style.height = '10px'
      nodeB.style.borderRadius = '50%'
      nodeB.style.background = '#ffffff'
      containerRef.current.appendChild(nodeB)
      nodesB.push(nodeB)
    }
    
    const animate = () => {
      offset += 0.012
      
      for (let i = 0; i < numNodes; i++) {
        const y = i * (320 / numNodes)
        
        // Strand A
        const sinA = Math.sin(i * step + offset)
        const xA = centerX + amplitude * sinA
        const scaleA = 0.6 + 0.4 * ((sinA + 1) / 2)
        
        nodesA[i].style.left = `${xA - 5}px`
        nodesA[i].style.top = `${y - 5}px`
        nodesA[i].style.transform = `scale(${scaleA})`
        nodesA[i].style.opacity = 0.4 + 0.6 * scaleA
        nodesA[i].style.zIndex = sinA > 0 ? 10 : 1
        
        // Strand B
        const sinB = Math.sin(i * step + offset + Math.PI)
        const xB = centerX + amplitude * sinB
        const scaleB = 0.6 + 0.4 * ((sinB + 1) / 2)
        
        nodesB[i].style.left = `${xB - 5}px`
        nodesB[i].style.top = `${y - 5}px`
        nodesB[i].style.transform = `scale(${scaleB})`
        nodesB[i].style.opacity = (0.4 + 0.6 * scaleB) * 0.7
        nodesB[i].style.zIndex = sinB > 0 ? 10 : 1
        
        // Rung
        const minX = Math.min(xA, xB)
        const diffX = Math.abs(xA - xB)
        rungs[i].style.left = `${minX}px`
        rungs[i].style.width = `${diffX}px`
        rungs[i].style.top = `${y - 1}px`
        const avgScale = (scaleA + scaleB) / 2
        rungs[i].style.opacity = 0.1 + 0.2 * avgScale
      }
      
      frameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      cancelAnimationFrame(frameId)
      if (containerRef.current) {
         containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return <div id="dna-canvas" ref={containerRef} style={{ width: 260, height: 320, position: 'relative', overflow: 'hidden', margin: '0 auto' }} />
}

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 80 + Math.random() * 200,
  startX: Math.random() * 100,
  startY: Math.random() * 100,
  speedX: (Math.random() - 0.5) * 0.03,
  speedY: -(0.008 + Math.random() * 0.012),
  phase: Math.random() * Math.PI * 2,
  opacity: 0.08 + Math.random() * 0.07
}))

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const bubblesRef = useRef([])
  const posRef = useRef(BUBBLES.map(b => ({ x: b.startX, y: b.startY })))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    
    let frameId
    let frameCount = 0
    
    const animate = () => {
      frameCount++
      
      BUBBLES.forEach((bubble, i) => {
        posRef.current[i].x += bubble.speedX + 0.008 * Math.sin(frameCount * 0.01 + bubble.phase)
        posRef.current[i].y += bubble.speedY
        
        if (posRef.current[i].y < -20) {
          posRef.current[i].y = 110
          posRef.current[i].x = Math.random() * 100
        }
        if (posRef.current[i].x < -20) posRef.current[i].x = 110
        if (posRef.current[i].x > 120) posRef.current[i].x = -10
        
        if (bubblesRef.current[i]) {
          bubblesRef.current[i].style.left = `${posRef.current[i].x}%`
          bubblesRef.current[i].style.top = `${posRef.current[i].y}%`
        }
      })
      
      frameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => cancelAnimationFrame(frameId)
  }, [])

  const onSubmit = async (data) => {
    try {
      const { data: response } = await loginUser(data)
      login(response)
      toast.success('Login Successful')
      if (location.state?.redirectTo) {
        navigate(location.state.redirectTo, {
          state: {
            selectedItem: location.state?.selectedItem,
            bookingType: location.state?.bookingType,
          },
        })
      } else if (response.role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN)
      } else if (response.role === ROLES.LAB_ASSISTANT) {
        navigate(ROUTES.LAB_ASSISTANT)
      } else if (response.role === ROLES.LAB_OWNER) {
        navigate(ROUTES.LAB_OWNER)
      } else {
        navigate(ROUTES.BOOKING)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed')
    }
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Panel — desktop: side panel, mobile: full background */}
      <div className="flex flex-col w-full md:w-[44%] bg-tertiary px-[32px] py-[36px] relative overflow-hidden justify-between">
        {/* Top: Logo */}
        <Logo variant="white" />
        
        {/* Middle: DNA Animation & Text */}
        <div className="flex flex-col items-center justify-center z-10 w-full mt-4">
          <DNAAnimation />
          <h2 className="font-heading font-bold text-white mt-6 mb-5 text-center type-primary-heading-h2-regular md:type-primary-heading-h2-regular">
            Trusted diagnostics, at your door.
          </h2>
          
          <div className="space-y-4 w-full max-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={12} className="text-white" />
              </div>
              <span className="text-white type-primary-body-b2 font-medium">NABL Certified Labs</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={12} className="text-white" />
              </div>
              <span className="text-white type-primary-body-b2 font-medium">Reports in 24 Hours</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={12} className="text-white" />
              </div>
              <span className="text-white type-primary-body-b2 font-medium">Home Sample Collection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={12} className="text-white" />
              </div>
              <span className="text-white type-primary-body-b2 font-medium">100% Accurate Results</span>
            </div>
          </div>
        </div>

        {/* Bottom: Stat Boxes */}
        <div className="flex justify-between items-center z-10 w-full max-w-[320px] mx-auto mt-6">
          <div className="text-center">
            <h4 className="text-white font-bold text-lg">50k+</h4>
            <p className="text-white/60 text-xs">Patients</p>
          </div>
          <div className="w-[1px] h-8 bg-white/20"></div>
          <div className="text-center">
            <h4 className="text-white font-bold text-lg">1200+</h4>
            <p className="text-white/60 text-xs">Cities</p>
          </div>
          <div className="w-[1px] h-8 bg-white/20"></div>
          <div className="text-center">
            <h4 className="text-white font-bold text-lg">5.0</h4>
            <p className="text-white/60 text-xs">Rating</p>
          </div>
        </div>
      </div>

      {/* Right Panel — desktop: form side, mobile: floating card overlay */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-6 lg:px-[60px] relative overflow-hidden">
        {/* Floating Bubble Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {BUBBLES.map((bubble, i) => (
            <div
              key={bubble.id}
              ref={(el) => (bubblesRef.current[i] = el)}
              style={{
                position: 'absolute',
                left: `${bubble.startX}%`,
                top: `${bubble.startY}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                borderRadius: '50%',
                border: '1.5px solid rgba(37, 99, 235, 0.2)',
                background: `rgba(37, 99, 235, ${bubble.opacity})`,
                willChange: 'transform'
              }}
            />
          ))}
        </div>

        <div className="w-full max-w-[440px] bg-white p-[40px] border border-border rounded-[10px] shadow-sm relative z-10">
          <div className="text-center md:text-left mb-6">
            <h2 className="type-primary-heading-h0-mobile lg:type-primary-heading-h0 text-foreground">Sign In</h2>
            <p className="text-muted-foreground mt-2 type-primary-body-b2 md:type-primary-body-b1">
              Login to continue your healthcare journey.
            </p>
          </div>

          {/* 3-column trust micro-strip */}
          <div className="flex items-center justify-between bg-background rounded-lg p-2.5 mb-6 border border-border">
            <div className="flex flex-col items-center flex-1">
              <ShieldCheck size={16} className="text-secondary mb-1" />
              <span className="type-primary-body-b3 lg:type-primary-body-b2 text-muted-foreground">NABL labs</span>
            </div>
            <div className="w-[1px] h-8 bg-border"></div>
            <div className="flex flex-col items-center flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary mb-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="type-primary-body-b3 lg:type-primary-body-b2 text-muted-foreground">24hr reports</span>
            </div>
            <div className="w-[1px] h-8 bg-border"></div>
            <div className="flex flex-col items-center flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="type-primary-body-b3 lg:type-primary-body-b2 text-muted-foreground">Home collection</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-2">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="type-primary-body-b2-medium text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Sign In
            </Button>
          </form>

          {/* SSL Note */}
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="type-primary-body-b3 lg:type-primary-body-b2 text-muted-foreground">Secured by 256-bit SSL encryption</span>
          </div>

          <p className="mt-6 text-muted-foreground text-center type-primary-body-b2 md:type-primary-body-b1">
            Don't have an account?{' '}
            <Link to={ROUTES.SIGNUP} className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Mobile: Floating Card Overlay */}
      <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
        <div className="w-full max-w-[400px] bg-white p-[32px] rounded-[16px] shadow-2xl relative">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div className="mb-6">
            <h2 className="type-primary-heading-h0-mobile text-foreground">Sign In</h2>
            <p className="text-muted-foreground mt-2 type-primary-body-b2">
              Login to continue your healthcare journey.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-2">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="type-primary-body-b2-medium text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Sign In
            </Button>
          </form>

          {/* SSL Note */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="type-primary-body-b3 text-muted-foreground">Secured by 256-bit SSL encryption</span>
          </div>

          <p className="mt-5 text-muted-foreground text-center type-primary-body-b2">
            Don't have an account?{' '}
            <Link to={ROUTES.SIGNUP} className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
