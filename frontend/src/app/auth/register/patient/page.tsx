'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Activity,
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
    Phone,
    CheckCircle,
    Heart,
    Shield,
    LineChart
} from 'lucide-react'

export default function PatientRegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [parallaxOffset, setParallaxOffset] = useState(0)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })

    useEffect(() => {
        const handleScroll = () => {
            setParallaxOffset(window.scrollY * 0.3)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

            const response = await fetch(`${apiUrl}/api/auth/patient/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    name: formData.name,
                    phone: formData.phone || null
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Registration failed')
            }

            setSuccess(true)

            setTimeout(() => {
                router.push('/auth/login?registered=true&role=patient')
            }, 2000)

        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/auth-bg.png"
                        alt="Background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-60"
                        priority
                    />
                </div>
                <div className="relative z-10 w-full max-w-[480px] bg-white p-12 shadow-2xl rounded-2xl text-center animate-scaleIn">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                        <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Account Created Successfully</h2>
                    <p className="text-slate-600 mb-6 text-lg">
                        Redirecting to login...
                    </p>
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 theme-patient">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 z-0 auth-parallax-bg"
                style={{ transform: `translateY(${parallaxOffset * 0.5}px) scale(1.1)` }}
            >
                <Image
                    src="/images/auth-bg.png"
                    alt="Background"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-70"
                    priority
                />
            </div>

            {/* Decorative Elements */}
            <div
                className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-400/20 blur-3xl"
                style={{ transform: `translateY(${-parallaxOffset * 0.2}px)` }}
            />
            <div
                className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl"
                style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
            />

            <div className="relative z-10 w-full max-w-[500px] bg-white p-10 shadow-2xl rounded-2xl animate-fadeInUp mx-4">
                {/* Header with Patient Theme */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">MedVision AI</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create Your Account</h1>
                    <p className="text-lg text-slate-600 font-medium">
                        Patient Registration
                    </p>
                </div>

                <form className="space-y-5 auth-form-large" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="block w-full py-3.5 px-4 border-2 border-slate-200 rounded-xl text-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="block w-full py-3.5 px-4 border-2 border-slate-200 rounded-xl text-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
                            placeholder="patient@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="block w-full py-3.5 px-4 border-2 border-slate-200 rounded-xl text-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full py-3.5 px-4 border-2 border-slate-200 rounded-xl text-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
                            placeholder="Minimum 8 characters"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="block w-full py-3.5 px-4 border-2 border-slate-200 rounded-xl text-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors bg-slate-50/50"
                            placeholder="Confirm your password"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex justify-between items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/auth/login')}
                            className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors rounded-xl"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Are you a medical professional?{' '}
                    <Link href="/auth/register/doctor" className="font-semibold text-blue-600 hover:underline">Register as a Doctor</Link>
                </p>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">Sign In</Link>
                </p>
            </div>

            <div className="absolute bottom-4 right-4 text-white/60 text-xs font-medium">
                MedVision AI - Privacy and Terms
            </div>
        </div>
    )
}
