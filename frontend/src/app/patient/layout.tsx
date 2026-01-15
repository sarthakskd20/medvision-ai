'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    Search,
    LogOut,
    Bell,
    Clock,
    Activity
} from 'lucide-react'
import Image from 'next/image'

const patientSidebarItems = [
    { label: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { label: 'Find Doctors', href: '/patient/doctors', icon: Search },
    { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Medical Records', href: '/patient/records', icon: FileText },
    { label: 'My Profile', href: '/patient/profile', icon: User },
]

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const [patientName, setPatientName] = useState('Patient')
    const [notifications, setNotifications] = useState(2)

    useEffect(() => {
        // Load patient info from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)
                setPatientName(user.name || 'Patient')
            } catch (e) {
                console.error('Failed to parse user data')
            }
        }
    }, [])

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 fixed h-full z-30 hidden lg:flex flex-col shadow-xl">
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <Link href="/patient" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-slate-800">MedVision</span>
                            <span className="text-xs text-slate-400 block">Patient Portal</span>
                        </div>
                    </Link>
                </div>

                {/* User Welcome */}
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50/50 to-transparent">
                    <p className="text-xs text-slate-500 font-medium">{getGreeting()}</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{patientName}</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {patientSidebarItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/patient' && pathname.startsWith(item.href))
                        const isHovered = hoveredItem === item.label

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onMouseEnter={() => setHoveredItem(item.label)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="relative block"
                            >
                                <div className={`relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'text-white shadow-lg shadow-primary-500/25'
                                    : 'text-slate-600 hover:text-primary-600'
                                    }`}>
                                    {/* Active Background */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="patientActiveTab"
                                            className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    {/* Hover Background */}
                                    {!isActive && isHovered && (
                                        <motion.div
                                            layoutId="patientHoverTab"
                                            className="absolute inset-0 bg-primary-50 rounded-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}

                                    {/* Icon & Text */}
                                    <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
                                    <span className="font-semibold relative z-10">{item.label}</span>

                                    {/* Notification badge for appointments */}
                                    {item.label === 'My Appointments' && notifications > 0 && (
                                        <span className="ml-auto relative z-10 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {notifications}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Quick Action: Book Appointment */}
                <div className="px-4 pb-4">
                    <Link
                        href="/patient/doctors"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-95"
                    >
                        <Calendar className="w-5 h-5" />
                        Book Appointment
                    </Link>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
                <Link href="/patient" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">MedVision</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button className="relative p-2 text-slate-500 hover:text-slate-700">
                        <Bell className="w-5 h-5" />
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                {notifications}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen">
                <div className="p-4 pt-20 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2">
                {patientSidebarItems.slice(0, 4).map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/patient' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
