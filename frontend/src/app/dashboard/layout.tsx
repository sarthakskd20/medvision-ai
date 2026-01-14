'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Newspaper,
    Network,
    BarChart3,
    Users,
    Settings,
    LogOut,
    Stethoscope,
    Activity
} from 'lucide-react'
import Image from 'next/image'

const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Feed', href: '/dashboard/feed', icon: Newspaper },
    { label: 'Network', href: '/dashboard/network', icon: Network },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Patient Management', href: '/dashboard/patients', icon: Users },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-200 fixed h-full z-30 hidden lg:flex flex-col">
                {/* Logo Section */}
                <div className="h-24 flex items-center px-8 border-b border-slate-100 bg-gradient-to-r from-primary-50/50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Image
                                src="/images/medvision-logo.png"
                                alt="MedVision"
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain brightness-0 invert"
                            />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-teal-600">
                            MedVision
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
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
                                <div className={`relative z-10 flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'text-white shadow-lg shadow-primary-500/25'
                                        : 'text-slate-500 hover:text-primary-600'
                                    }`}>
                                    {/* Active Background */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    {/* Hover Background (Glass) */}
                                    {!isActive && isHovered && (
                                        <motion.div
                                            layoutId="hoverTab"
                                            className="absolute inset-0 bg-primary-50 rounded-2xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}

                                    {/* Icon & Text */}
                                    <item.icon className={`w-6 h-6 relative z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
                                    <span className={`text-lg font-bold relative z-10`}>{item.label}</span>

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
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>

                    <div className="mt-6 px-4 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-slate-400">System Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-80 min-h-screen">
                <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
