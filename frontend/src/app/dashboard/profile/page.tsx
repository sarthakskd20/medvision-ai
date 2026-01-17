'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
    Activity,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Award,
    Shield,
    Clock,
    Calendar,
    Home,
    LogOut,
    ArrowLeft,
    Stethoscope,
    FileText
} from 'lucide-react'
import { api } from '@/lib/api'

export default function DoctorProfilePage() {
    const router = useRouter()
    const pathname = usePathname()

    const { data: doctor, isLoading, error } = useQuery({
        queryKey: ['currentDoctor'],
        queryFn: api.getCurrentDoctor,
        retry: false,
    })

    const handleSignOut = () => {
        localStorage.removeItem('authToken')
        router.push('/auth/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        )
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load profile</p>
                    <Link href="/auth/login" className="text-primary-500 hover:underline">
                        Please login again
                    </Link>
                </div>
            </div>
        )
    }

    const verificationStatus = doctor.verification_status || 'pending'

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Activity className="h-7 w-7 text-primary-500" />
                        <span className="text-lg font-semibold text-gray-900">MedVision AI</span>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard'
                                        ? 'bg-primary-50 text-primary-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Home className="h-5 w-5" />
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/profile"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard/profile'
                                        ? 'bg-primary-50 text-primary-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <User className="h-5 w-5" />
                                My Profile
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
                            <p className="text-gray-500 mt-1">View and manage your account details</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 max-w-4xl">
                    {/* Profile Header Card */}
                    <div className="card p-6 mb-6">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-12 w-12 text-primary-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        Dr. {doctor.name}
                                    </h2>
                                    {verificationStatus === 'approved' ? (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                            <Shield className="h-4 w-4" />
                                            Verified
                                        </span>
                                    ) : verificationStatus === 'rejected' ? (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                                            <Shield className="h-4 w-4" />
                                            Rejected
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                                            <Clock className="h-4 w-4" />
                                            Pending Verification
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    {doctor.specialization || 'General Practice'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900">{doctor.email}</p>
                                    </div>
                                </div>
                                {doctor.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="text-gray-900">{doctor.phone}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Country</p>
                                        <p className="text-gray-900">{doctor.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Registration Number</p>
                                        <p className="text-gray-900 font-mono">{doctor.registration_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Specialization</p>
                                        <p className="text-gray-900">{doctor.specialization}</p>
                                    </div>
                                </div>
                                {doctor.hospital && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Hospital / Clinic</p>
                                            <p className="text-gray-900">{doctor.hospital}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="card p-6 col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="text-gray-900">
                                            {doctor.created_at
                                                ? new Date(doctor.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Verification Status</p>
                                        <p className={`capitalize ${verificationStatus === 'approved' ? 'text-green-600' :
                                                verificationStatus === 'rejected' ? 'text-red-600' :
                                                    'text-yellow-600'
                                            }`}>
                                            {verificationStatus}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Account ID</p>
                                        <p className="text-gray-900 font-mono text-sm">{doctor.id?.slice(0, 8)}...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
