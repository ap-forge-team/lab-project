import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { registerUser } from '@/services/auth.service'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Logo from '@/components/ui/Logo'

const OrbitAnimation = () => {
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    let frameId
    let angle = 0
    const centerX = 140
    const centerY = 140
    
    // Rings config: radius, count, bg, direction
    const rings = [
      { radius: 50, count: 8, bg: '#2563EB', dir: 1 },
      { radius: 90, count: 10, bg: 'rgba(255,255,255,0.6)', dir: -1 },
      { radius: 125, count: 6, bg: 'rgba(37,99,235,0.4)', dir: 1 },
    ]
    
    const particles = []
    
    rings.forEach((ring) => {
      for (let i = 0; i < ring.count; i++) {
        const particle = document.createElement('div')
        particle.style.width = '8px'
        particle.style.height = '8px'
        particle.style.borderRadius = '50%'
        particle.style.position = 'absolute'
        particle.style.background = ring.bg
        containerRef.current.appendChild(particle)
        particles.push({ el: particle, ring, index: i })
      }
    })
    
    // Center circle
    const center = document.createElement('div')
    center.style.width = '44px'
    center.style.height = '44px'
    center.style.borderRadius = '50%'
    center.style.background = 'rgba(37,99,235,0.15)'
    center.style.border = '1px solid rgba(37,99,235,0.4)'
    center.style.position = 'absolute'
    center.style.left = `${centerX - 22}px`
    center.style.top = `${centerY - 22}px`
    center.style.display = 'flex'
    center.style.alignItems = 'center'
    center.style.justifyContent = 'center'
    center.style.color = '#2563EB'
    center.style.fontSize = '20px'
    center.style.fontWeight = 'bold'
    center.innerHTML = '+'
    containerRef.current.appendChild(center)
    
    const animate = () => {
      angle += 0.008
      
      particles.forEach((p) => {
        const { ring, index } = p
        const theta = index * (2 * Math.PI / ring.count) + angle * ring.dir
        const x = centerX + ring.radius * Math.cos(theta)
        const y = centerY + ring.radius * Math.sin(theta)
        p.el.style.left = `${x - 4}px`
        p.el.style.top = `${y - 4}px`
      })
      
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

  return (
    <div ref={containerRef} style={{ width: 280, height: 280, position: 'relative', margin: '0 auto' }} />
  )
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

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service and Privacy Policy' }),
  }),
})

const Signup = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const bubblesRef = useRef([])
  const posRef = useRef(BUBBLES.map(b => ({ x: b.startX, y: b.startY })))

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const passwordValue = watch('password') || ''
  const getPasswordStrength = () => {
    if (!passwordValue) return 0
    let str = 0
    if (passwordValue.length >= 6) str += 1
    if (/[A-Z]/.test(passwordValue)) str += 1
    if (/[0-9]/.test(passwordValue) || /[^A-Za-z0-9]/.test(passwordValue)) str += 1
    return str
  }
  const strength = useMemo(() => getPasswordStrength(), [passwordValue])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Bubble animation loop
    let frameId
    let frameCount = 0
    
    if (!prefersReducedMotion) {
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
    }
    
    if (location.state?.message) {
      toast.info(location.state.message)
      window.history.replaceState({}, document.title)
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  const onSubmit = async (data) => {
    try {
      const { data: response } = await registerUser(data)
      login(response)
      toast.success('Account Created Successfully')
      if (location.state?.redirectTo) {
        navigate(location.state.redirectTo, {
          state: {
            selectedItem: location.state?.selectedItem,
            bookingType: location.state?.bookingType,
          },
        })
      } else {
        navigate(ROUTES.BOOKING)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup Failed')
    }
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Panel — desktop: side panel, mobile: full background */}
      <div className="flex flex-col w-full md:w-[44%] bg-tertiary px-[32px] py-[36px] relative overflow-hidden justify-between">
        {/* Top: Logo */}
        <Logo variant="white" />
        
        {/* Middle: Orbit Animation & Text */}
        <div className="flex flex-col items-center justify-center z-10 w-full mt-4">
          <OrbitAnimation />
          <div className="text-center mt-6 mb-5">
            <h2 className="font-heading font-bold text-white mb-2 type-primary-heading-h2-regular">
              Join 50,000+ patients
            </h2>
            <p className="type-primary-body-b3 text-white/50">
              Book lab tests from NABL certified labs across 1200+ cities.
            </p>
          </div>
          
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

      {/* Right Panel — desktop: form side */}
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
            <h2 className="type-primary-heading-h0-mobile lg:type-primary-heading-h0 text-foreground">Create your account</h2>
            <p className="text-muted-foreground mt-2 type-primary-body-b2 md:type-primary-body-b1">
              Start booking lab tests in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="Enter your full name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone Number"
              type="tel"
              required
              placeholder="Enter your phone number"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="Create password"
                error={errors.password?.message}
                {...register('password')}
              />
              
              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 w-1/3 rounded-full transition-colors ${
                        strength >= level
                          ? strength === 1
                            ? 'bg-destructive'
                            : strength === 2
                            ? 'bg-warning'
                            : 'bg-success'
                          : 'bg-accent'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="type-primary-body-b3 md:type-primary-body-b2 text-muted-foreground leading-relaxed">
                I confirm that I have read and agree to Checked Up's{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>{' '}
                and{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-destructive type-primary-body-b3 mt-1">{errors.agreeToTerms.message}</p>
            )}
            
            <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="bg-primary hover:bg-primary/90 text-white mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-muted-foreground text-center type-primary-body-b2 md:type-primary-body-b1">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Mobile: Floating Card Overlay */}
      <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/5 backdrop-blur-[2px]">
        <div className="w-full max-w-[400px] bg-white p-[32px] rounded-[16px] shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div className="mb-6">
            <div className="mb-4 md:hidden">
              <Logo variant="default" />
            </div>
            <h2 className="type-primary-heading-h0-mobile text-foreground">Create your account</h2>
            <p className="text-muted-foreground mt-2 type-primary-body-b2">
              Start booking lab tests in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Full Name" type="text" required placeholder="Enter your full name" error={errors.name?.message} {...register('name')} />
            <Input label="Email Address" type="email" required placeholder="Enter your email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone Number" type="tel" required placeholder="Enter your phone number" error={errors.phone?.message} {...register('phone')} />
            <div>
              <Input label="Password" type="password" required placeholder="Create password" error={errors.password?.message} {...register('password')} />
              {passwordValue && (
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className={`h-1.5 w-1/3 rounded-full transition-colors ${strength >= level ? strength === 1 ? 'bg-destructive' : strength === 2 ? 'bg-warning' : 'bg-success' : 'bg-accent'}`} />
                  ))}
                </div>
              )}
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('agreeToTerms')} className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer" />
              <span className="type-primary-body-b3 text-muted-foreground leading-relaxed">
                I confirm that I have read and agree to Checked Up's{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>{' '}and{' '}
                <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
              </span>
            </label>
            {errors.agreeToTerms && <p className="text-destructive type-primary-body-b3 mt-1">{errors.agreeToTerms.message}</p>}
            <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="bg-primary hover:bg-primary/90 text-white mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-muted-foreground text-center type-primary-body-b2">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
