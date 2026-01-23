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
    Menu,
    X
} from 'lucide-react'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex">
            {/* Sidebar - LARGER WIDTH */}
            <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-30 hidden lg:flex flex-col shadow-xl dark:shadow-none">
                {/* Logo Section with Theme Toggle */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
                    <Link href="/patient" className="flex items-center gap-4 group">
                        {/* Using actual MedVision logo image with theme contrast */}
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/30">
                            <Image
                                src="/images/medvision-logo.png"
                                alt="MedVision"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain transition-transform duration-500 group-hover:rotate-12"
                            />
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">MedVision</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 block font-semibold">Patient Portal</span>
                        </div>
                    </Link>
                    {/* Theme Toggle in Sidebar */}
                    <ThemeToggle />
                </div>

                {/* User Welcome */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-primary-50/50 dark:from-primary-900/20 to-transparent">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{getGreeting()}</p>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-white truncate">{patientName}</p>
                </div>

                {/* Navigation - LARGER FONTS */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {patientSidebarItems.map((navItem) => {
                        const isActive = pathname === navItem.href ||
                            (navItem.href !== '/patient' && pathname.startsWith(navItem.href))
                        const isHovered = hoveredItem === navItem.label

                        return (
                            <Link
                                key={navItem.label}
                                href={navItem.href}
                                onMouseEnter={() => setHoveredItem(navItem.label)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="relative block"
                            >
                                <div className={`relative z-10 flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'text-white shadow-lg shadow-primary-500/25'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
                                    }`}>
                                    {/* Active Background */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePatientTab"
                                            className="absolute inset-0 bg-gradient-to-r from-primary-600 to-teal-500 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                        />
                                    )}

                                    {/* Hover Background */}
                                    {!isActive && isHovered && (
                                        <motion.div
                                            layoutId="hoverPatientTab"
                                            className="absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}

                                    {/* Icon - LARGER */}
                                    <navItem.icon className={`w-6 h-6 relative z-10 transition-transform duration-200 ${isHovered && !isActive ? 'scale-110' : ''}`} />

                                    {/* Label - LARGER & BOLDER */}
                                    <span className="text-lg font-bold relative z-10">{navItem.label}</span>

                                    {/* Notification Badge */}
                                    {navItem.label === 'My Appointments' && notifications > 0 && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center z-10">
                                            {notifications}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Book Appointment CTA */}
                <div className="px-4 py-4">
                    <Link
                        href="/patient/doctors"
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary-600 to-teal-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-95"
                    >
                        <Calendar className="w-5 h-5" />
                        Book Appointment
                    </Link>
                </div>

                {/* Bottom Section - Sign Out only */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold group text-lg"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40 flex items-center justify-between px-4">
                <Link href="/patient" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                        <Image
                            src="/images/medvision-logo.png"
                            alt="MedVision"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain transition-transform duration-500 group-hover:rotate-12"
                        />
                    </div>
                    <span className="font-extrabold text-xl text-slate-800 dark:text-white">MedVision</span>
                </Link>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="w-72 h-full bg-white dark:bg-slate-800 shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <Link href="/patient" className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                                    <Image
                                        src="/images/medvision-logo.png"
                                        alt="MedVision"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 object-contain transition-transform duration-500 group-hover:rotate-12"
                                    />
                                </div>
                                <div>
                                    <span className="font-extrabold text-xl text-slate-800 dark:text-white">MedVision</span>
                                    <span className="text-sm text-slate-400 block">Patient Portal</span>
                                </div>
                            </Link>
                        </div>
                        <nav className="p-4 space-y-2">
                            {patientSidebarItems.map((navItem) => {
                                const isActive = pathname === navItem.href
                                return (
                                    <Link
                                        key={navItem.label}
                                        href={navItem.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-lg ${isActive
                                            ? 'bg-gradient-to-r from-primary-600 to-teal-500 text-white'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <navItem.icon className="w-6 h-6" />
                                        {navItem.label}
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold text-lg"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-40 flex items-center justify-around px-2">
                {patientSidebarItems.slice(0, 5).map((navItem) => {
                    const isActive = pathname === navItem.href
                    return (
                        <Link
                            key={navItem.label}
                            href={navItem.href}
                            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${isActive
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-slate-400 dark:text-slate-500'
                                }`}
                        >
                            <navItem.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                            <span className="text-xs font-bold">{navItem.label.split(' ')[0]}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Main Content - adjusted margin for wider sidebar */}
            <main className="flex-1 lg:ml-80 pt-16 pb-16 lg:pt-0 lg:pb-0 min-h-screen">
                <div className="p-5 md:p-8 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
