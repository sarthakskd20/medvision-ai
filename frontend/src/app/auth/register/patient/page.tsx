'use client'

import { useState } from 'react'
import Link from 'next/link'
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

        // Validate
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
            // For now, store in localStorage (replace with API call)
            const patientData = {
                id: `patient_${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: 'patient',
                created_at: new Date().toISOString()
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Store patient info
            localStorage.setItem('user', JSON.stringify(patientData))
            localStorage.setItem('auth_token', `patient_token_${Date.now()}`)

            setSuccess(true)

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/patient-portal')
            }, 2000)

        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-secondary-100 to-white flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="card p-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                        <p className="text-gray-600 mb-6">
                            Welcome, {formData.name}! Redirecting to your portal...
                        </p>
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-500" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary-100 to-white py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Activity className="h-10 w-10 text-primary-500" />
                        <span className="text-2xl font-bold text-gray-900">MedVision AI</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Create Patient Account</h1>
                    <p className="text-gray-500 mt-2">Access your health reports and AI interpretations</p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Your full name"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number (optional)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 234 567 8900"
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password * (min 8 characters)
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Create a password"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
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
                                Create Account
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/auth/login?role=patient" className="text-primary-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
