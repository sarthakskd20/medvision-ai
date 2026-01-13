'use client'

import { useState } from 'react'
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
    CheckCircle
} from 'lucide-react'

export default function PatientRegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })

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
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#e6f0ff]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/auth-bg.png"
                        alt="Background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-100"
                        priority
                    />
                </div>
                <div className="relative z-10 w-full max-w-[440px] bg-white p-10 shadow-2xl rounded-sm sm:rounded-lg text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Account Created!</h2>
                    <p className="text-slate-600 mb-6 font-light">
                        Redirecting to login...
                    </p>
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#e6f0ff]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/auth-bg.png"
                    alt="Background"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-100"
                    priority
                />
            </div>

            <div className="relative z-10 w-full max-w-[440px] bg-white p-10 shadow-2xl rounded-none sm:rounded-lg">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-6 w-6 text-primary-600" />
                        <span className="text-xl font-semibold text-slate-700">MedVision AI</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
                    <p className="text-sm text-slate-500">
                        Patient Registration
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="block w-full py-2.5 border-b border-slate-400 placeholder-slate-600 focus:outline-none focus:border-primary-600 transition-colors bg-transparent"
                            placeholder="Full name"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="block w-full py-2.5 border-b border-slate-400 placeholder-slate-600 focus:outline-none focus:border-primary-600 transition-colors bg-transparent"
                            placeholder="someone@example.com"
                        />
                    </div>

                    <div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="block w-full py-2.5 border-b border-slate-400 placeholder-slate-600 focus:outline-none focus:border-primary-600 transition-colors bg-transparent"
                            placeholder="Phone number (optional)"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full py-2.5 border-b border-slate-400 placeholder-slate-600 focus:outline-none focus:border-primary-600 transition-colors bg-transparent"
                            placeholder="Create password"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="block w-full py-2.5 border-b border-slate-400 placeholder-slate-600 focus:outline-none focus:border-primary-600 transition-colors bg-transparent"
                            placeholder="Confirm password"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 mt-2">
                            {error}
                        </div>
                    )}

                    <div className="pt-6 flex justify-end items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/auth/login')}
                            className="px-8 py-2 bg-slate-200 text-slate-800 font-medium hover:bg-slate-300 transition-colors rounded-sm"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm rounded-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Next'
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-xs text-slate-500">
                    <Link href="/auth/register/doctor" className="hover:underline hover:text-primary-600">Register as a Doctor instead</Link>
                </p>
            </div>

            <div className="absolute bottom-4 right-4 text-slate-500/50 text-xs text-white mix-blend-overlay">
                MedVision AI • Privacy & Terms
            </div>
        </div>
    )
}
