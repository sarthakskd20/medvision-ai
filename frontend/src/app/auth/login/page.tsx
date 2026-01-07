'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Activity,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    Stethoscope,
    User
} from 'lucide-react'

type UserRole = 'doctor' | 'patient'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [role, setRole] = useState<UserRole>('doctor')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Read role from URL on mount
    useEffect(() => {
        const urlRole = searchParams.get('role')
        if (urlRole === 'patient' || urlRole === 'doctor') {
            setRole(urlRole)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed')
            }

            // Store token and user info
            localStorage.setItem('auth_token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Redirect based on role and verification status
            if (role === 'doctor') {
                if (data.user.verification_status === 'approved') {
                    router.push('/dashboard')
                } else {
                    router.push('/auth/pending')
                }
            } else {
                router.push('/patient-portal')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary-100 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Activity className="h-10 w-10 text-primary-500" />
                        <span className="text-2xl font-bold text-gray-900">MedVision AI</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
                </div>

                {/* Role Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex mb-6">
                    <button
                        onClick={() => setRole('doctor')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${role === 'doctor'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Stethoscope className="h-5 w-5" />
                        Doctor
                    </button>
                    <button
                        onClick={() => setRole('patient')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${role === 'patient'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <User className="h-5 w-5" />
                        Patient
                    </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="card p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link
                            href={role === 'doctor' ? '/auth/register/doctor' : '/auth/register/patient'}
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Register
                        </Link>
                    </div>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                    <p className="text-sm font-medium text-primary-800 mb-2">Demo Credentials (for testing)</p>
                    <div className="text-sm text-primary-700 space-y-1">
                        <p><strong>Email:</strong> dr.chen@medvision.ai</p>
                        <p><strong>Password:</strong> Demo@2025</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-secondary-100 to-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
