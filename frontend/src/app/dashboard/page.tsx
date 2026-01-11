'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    Search,
    User,
    Calendar,
    ChevronRight,
    Home,
    LogOut,
    Shield,
    Clock,
    Stethoscope
} from 'lucide-react'
import { api } from '@/lib/api'

export default function DashboardPage() {
    const router = useRouter()
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch current doctor info
    const { data: doctor, isLoading: doctorLoading } = useQuery({
        queryKey: ['currentDoctor'],
        queryFn: api.getCurrentDoctor,
        retry: false,
    })

    // Fetch patients
    const { data: patients, isLoading: patientsLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: api.getPatients,
    })

    const filteredPatients = patients?.filter((patient: any) =>
        patient.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const handleSignOut = () => {
        localStorage.removeItem('authToken')
        router.push('/auth/login')
    }

    // Get doctor's first name for greeting
    const doctorName = doctor?.name?.split(' ')[0] || 'Doctor'
    const verificationStatus = doctor?.verification_status || 'pending'

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Doctor's Command Center
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Welcome back, Dr. {doctorName}. Select a patient to begin AI-assisted analysis.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Verification Badge */}
                            {verificationStatus === 'approved' ? (
                                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                    <Shield className="h-4 w-4" />
                                    Verified
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                                    <Clock className="h-4 w-4" />
                                    Pending Verification
                                </div>
                            )}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-72 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="card p-6">
                            <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                            <p className="text-3xl font-semibold text-gray-900">{patients?.length || 0}</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-gray-500 mb-1">Analyses Today</p>
                            <p className="text-3xl font-semibold text-gray-900">12</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-gray-500 mb-1">Avg. Token Usage</p>
                            <p className="text-3xl font-semibold text-gray-900">1.2M</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-gray-500 mb-1">Time Saved</p>
                            <p className="text-3xl font-semibold text-gray-900">6.2 hrs</p>
                        </div>
                    </div>

                    {/* Patient List */}
                    <div className="card">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Patient Queue</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Stethoscope className="h-4 w-4" />
                                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {patientsLoading ? (
                            <div className="p-8 text-center text-gray-500">
                                Loading patients...
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No patients found
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {filteredPatients.map((patient: any) => (
                                    <li key={patient.id}>
                                        <Link
                                            href={`/dashboard/patient/${patient.id}`}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-primary-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {patient.profile?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {patient.profile?.diagnosis}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        <Calendar className="inline h-4 w-4 mr-1" />
                                                        {patient.profile?.diagnosed_date}
                                                    </p>
                                                    <div className="flex gap-1 mt-1">
                                                        {patient.profile?.genetic_markers?.slice(0, 3).map((marker: string) => (
                                                            <span
                                                                key={marker}
                                                                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                                                            >
                                                                {marker}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
