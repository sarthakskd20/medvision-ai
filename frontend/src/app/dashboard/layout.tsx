'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Newspaper,
    Network,
    BarChart3,
    Users,
    LogOut
} from 'lucide-react'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'

const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Feed', href: '/dashboard/feed', icon: Newspaper },
    { label: 'Network', href: '/dashboard/network', icon: Network },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Patient Management', href: '/dashboard/patients', icon: Users },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Sidebar - LARGER WIDTH */}
            <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-30 hidden lg:flex flex-col shadow-xl dark:shadow-none">
                {/* Logo Section - LARGER */}
                <div className="h-24 flex items-center px-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-primary-50/50 dark:from-primary-900/20 to-transparent">
                    <Link href="/dashboard" className="flex items-center gap-4">
                        {/* Using actual MedVision logo image */}
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-600 overflow-hidden">
                            <Image
                                src="/images/medvision-logo.png"
                                alt="MedVision"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain dark:brightness-110"
                            />
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-teal-600 dark:from-primary-400 dark:to-teal-400">
                                MedVision
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 block font-semibold">Doctor Portal</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation - LARGER FONTS */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        const isHovered = hoveredItem === item.label

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onMouseEnter={() => setHoveredItem(item.label)}
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
                                            layoutId="activeDoctorTab"
                                            className="absolute inset-0 bg-gradient-to-r from-primary-600 to-teal-500 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                        />
                                    )}

                                    {/* Hover Background */}
                                    {!isActive && isHovered && (
                                        <motion.div
                                            layoutId="hoverDoctorTab"
                                            className="absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}

                                    {/* Icon - LARGER */}
                                    <item.icon className={`w-6 h-6 relative z-10 transition-transform duration-200 ${isHovered && !isActive ? 'scale-110' : ''}`} />
                                    {/* Label - LARGER & BOLDER */}
                                    <span className="text-lg font-bold relative z-10">{item.label}</span>

                                    {/* Active Pulse Dot */}
                                    {isActive && (
                                        <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse z-10" />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-base font-bold text-slate-500 dark:text-slate-400">Theme</span>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold group text-lg"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>

                    <div className="px-4 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">System Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content - adjusted margin for wider sidebar */}
            <main className="flex-1 lg:ml-80 min-h-screen">
                <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
