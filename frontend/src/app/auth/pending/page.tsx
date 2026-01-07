'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Activity,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    RefreshCw,
    LogOut
} from 'lucide-react'

export default function PendingVerificationPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [status, setStatus] = useState<string>('pending')
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            const parsed = JSON.parse(userData)
            setUser(parsed)
            setStatus(parsed.verification_status)
        } else {
            router.push('/auth/login')
        }
    }, [router])

    const checkStatus = async () => {
        if (!user) return
        setIsChecking(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
            const res = await fetch(`${apiUrl}/api/auth/verification-status/${user.id}`)
            const data = await res.json()

            setStatus(data.status)

            // Update localStorage
            const updatedUser = { ...user, verification_status: data.status }
            localStorage.setItem('user', JSON.stringify(updatedUser))

            // If approved, redirect to dashboard
            if (data.status === 'approved') {
                router.push('/dashboard')
            }
        } catch (err) {
            console.error('Failed to check status:', err)
        } finally {
            setIsChecking(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    const getStatusInfo = () => {
        switch (status) {
            case 'approved':
                return {
                    icon: <CheckCircle className="h-16 w-16 text-green-500" />,
                    title: 'Verification Approved',
                    message: 'Your account has been verified. You can now access the dashboard.',
                    color: 'green'
                }
            case 'rejected':
                return {
                    icon: <XCircle className="h-16 w-16 text-red-500" />,
                    title: 'Verification Rejected',
                    message: 'Unfortunately, your documents could not be verified. Please contact support or try registering again with clearer documents.',
                    color: 'red'
                }
            case 'manual_review':
                return {
                    icon: <FileText className="h-16 w-16 text-amber-500" />,
                    title: 'Under Manual Review',
                    message: 'Your documents are being reviewed by our team. This usually takes 1-2 business days.',
                    color: 'amber'
                }
            default:
                return {
                    icon: <Clock className="h-16 w-16 text-primary-500" />,
                    title: 'Verification Pending',
                    message: 'We are verifying your documents using AI analysis. This usually takes a few moments.',
                    color: 'primary'
                }
        }
    }

    const statusInfo = getStatusInfo()

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary-100 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Activity className="h-10 w-10 text-primary-500" />
                        <span className="text-2xl font-bold text-gray-900">MedVision AI</span>
                    </Link>
                </div>

                <div className="card p-8 text-center">
                    <div className="mb-6">{statusInfo.icon}</div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {statusInfo.title}
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {statusInfo.message}
                    </p>

                    {user && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-medium text-gray-700 mb-2">Your Details:</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Name:</strong> {user.name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Specialization:</strong> {user.specialization}</p>
                                <p><strong>Registration:</strong> {user.registration_number}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {status === 'approved' && (
                            <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
                                Go to Dashboard
                            </Link>
                        )}

                        {status === 'pending' && (
                            <button
                                onClick={checkStatus}
                                disabled={isChecking}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isChecking ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <RefreshCw className="h-5 w-5" />
                                        Check Status
                                    </>
                                )}
                            </button>
                        )}

                        {status === 'rejected' && (
                            <Link href="/auth/register/doctor" className="btn-primary w-full flex items-center justify-center gap-2">
                                Register Again
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
