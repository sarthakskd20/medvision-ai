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
    Shield,
    Clock,
    Stethoscope,
    Users,
    Rss,
    BarChart3,
    Bell
} from 'lucide-react'
import { api } from '@/lib/api'
import ProfileDropdown from '@/components/ui/ProfileDropdown'

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
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    // Get doctor's first name for greeting
    const doctorName = doctor?.name?.split(' ')[0] || 'Doctor'
    const verificationStatus = doctor?.verification_status || 'pending'

    // Navigation items
    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/feed', icon: Rss, label: 'Feed' },
        { href: '/dashboard/network', icon: Users, label: 'Network' },
        { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    ]

    // Stats data (will be replaced with real data)
    const stats = [
        { label: 'Total Patients', value: patients?.length || 0, type: 'default' },
        { label: 'Pending Cases', value: 3, type: 'warning' },
        { label: 'This Week', value: 12, type: 'accent' },
        { label: 'AI Analyses', value: 47, type: 'success' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Dark theme */}
            <aside className="w-64 sidebar flex flex-col">
                {/* Logo */}
                <div className="p-5 border-b border-slate-700/50">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white">MedVision AI</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Patients section header */}
                    <div className="mt-8 mb-3 px-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Patient Management
                        </p>
                    </div>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href="/dashboard/patients"
                                className={`sidebar-nav-item ${pathname === '/dashboard/patients' ? 'active' : ''}`}
                            >
                                <Stethoscope className="h-5 w-5" />
                                All Patients
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Profile Dropdown at Bottom (Discord-style) */}
                <ProfileDropdown
                    doctor={doctor}
                    onSignOut={handleSignOut}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">
                                Welcome back, Dr. {doctorName}
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Your AI-assisted clinical command center
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Verification Badge */}
                            {verificationStatus === 'approved' ? (
                                <div className="badge badge-success">
                                    <Shield className="h-3.5 w-3.5" />
                                    Verified
                                </div>
                            ) : (
                                <div className="badge badge-warning">
                                    <Clock className="h-3.5 w-3.5" />
                                    Pending Verification
                                </div>
                            )}

                            {/* Notifications */}
                            <button className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-64 bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`stat-card ${stat.type === 'accent' ? 'stat-card-accent' : stat.type === 'success' ? 'stat-card-success' : ''}`}
                            >
                                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                                <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <Link href="/dashboard/patients/new" className="card card-interactive p-6 group">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                <User className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Add New Patient</h3>
                            <p className="text-sm text-slate-500">Register a new patient for AI analysis</p>
                        </Link>

                        <Link href="/dashboard/feed" className="card card-interactive p-6 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <Rss className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Medical Feed</h3>
                            <p className="text-sm text-slate-500">Latest posts from your network</p>
                        </Link>

                        <Link href="/dashboard/network" className="card card-interactive p-6 group">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Your Network</h3>
                            <p className="text-sm text-slate-500">Connect with fellow doctors</p>
                        </Link>
                    </div>

                    {/* Patient List */}
                    <div className="card">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Patients</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Stethoscope className="h-4 w-4" />
                                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {patientsLoading ? (
                            <div className="p-8">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full skeleton" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-48 skeleton" />
                                                <div className="h-3 w-32 skeleton" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">No patients yet</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Add your first patient to begin AI-assisted analysis
                                </p>
                                <Link href="/dashboard/patients/new" className="btn btn-primary">
                                    Add Patient
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {filteredPatients.slice(0, 5).map((patient: any) => (
                                    <li key={patient.id}>
                                        <Link
                                            href={`/dashboard/patient/${patient.id}`}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {patient.profile?.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {patient.profile?.diagnosis}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-500">
                                                        <Calendar className="inline h-3.5 w-3.5 mr-1" />
                                                        {patient.profile?.diagnosed_date}
                                                    </p>
                                                    <div className="flex gap-1 mt-1 justify-end">
                                                        {patient.profile?.genetic_markers?.slice(0, 2).map((marker: string) => (
                                                            <span
                                                                key={marker}
                                                                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                                                            >
                                                                {marker}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {filteredPatients.length > 5 && (
                            <div className="px-6 py-4 border-t border-slate-200 text-center">
                                <Link href="/dashboard/patients" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                                    View all patients
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
