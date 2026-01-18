'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Activity, ArrowUpRight, Search, FileText, Video, MapPin } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

interface DashboardStats {
    totalPatients: number
    todayAppointments: number
    completedToday: number
    pendingToday: number
}

interface RecentAppointment {
    id: string
    patient_name: string
    patient_id: string
    status: string
    mode: 'online' | 'offline'
    scheduled_time: string
}

export default function DashboardOverview() {
    const [doctorName, setDoctorName] = useState('Doctor')
    const [doctorId, setDoctorId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        todayAppointments: 0,
        completedToday: 0,
        pendingToday: 0
    })
    const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])

    useEffect(() => {
        // Read user data from localStorage ONCE on mount
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)

                // Check if this is a doctor account
                // If role is patient or name contains 'patient', redirect to patient dashboard
                if (user.role === 'patient' ||
                    (user.name && user.name.toLowerCase().includes('patient')) ||
                    (user.email && !user.registration_number && !user.specialization)) {
                    console.log('Non-doctor account detected, redirecting to patient dashboard')
                    window.location.href = '/patient'
                    return
                }

                // Get doctor name - use stored name directly
                let name = user.fullName || user.name || user.displayName || ''

                // Remove "Dr." prefix if it exists (we add it in the UI)
                if (name.toLowerCase().startsWith('dr.')) {
                    name = name.substring(3).trim()
                } else if (name.toLowerCase().startsWith('dr ')) {
                    name = name.substring(2).trim()
                }

                setDoctorName(name || 'Doctor')

                // Store doctor ID for API calls - use id field first, not email
                const id = user.id || user.email
                setDoctorId(id)

                console.log('Dashboard loaded - Doctor:', name, 'ID:', id, 'Role:', user.role)
            } catch (e) {
                console.error('Error parsing user data:', e)
            }
        } else {
            // No user data, redirect to login
            window.location.href = '/auth/login'
        }
    }, [])

    // Fetch appointments when doctorId is set
    useEffect(() => {
        if (doctorId) {
            fetchAppointments(doctorId)
        } else {
            setLoading(false)
        }
    }, [doctorId])

    const fetchAppointments = async (docId: string) => {
        try {
            setLoading(true)
            const result = await api.getDoctorAppointmentsToday(docId)
            if (result && result.appointments) {
                setRecentAppointments(result.appointments.slice(0, 5))

                // Calculate stats
                const total = result.appointments.length
                const completed = result.appointments.filter((a: any) => a.status === 'completed').length
                const pending = result.appointments.filter((a: any) => a.status === 'waiting' || a.status === 'in_progress').length

                setStats({
                    totalPatients: total,
                    todayAppointments: total,
                    completedToday: completed,
                    pendingToday: pending
                })
            }
        } catch (e) {
            console.log('Could not fetch appointments:', e)
        } finally {
            setLoading(false)
        }
    }

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2"
                    >
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">Dr. {doctorName}</span>
                    </motion.h1>
                    <p className="text-xl text-slate-500 font-medium">Here's your clinical overview for today.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-700 shadow-sm"
                        />
                    </div>
                </motion.div>
            </header>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                {[
                    { label: 'Today\'s Queue', value: stats.todayAppointments.toString(), change: 'Today', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Pending', value: stats.pendingToday.toString(), change: 'Waiting', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Completed', value: stats.completedToday.toString(), change: 'Done', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Total Patients', value: stats.totalPatients.toString(), change: 'All Time', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-4xl font-extrabold text-slate-900 mb-2">{stat.value}</h3>
                        <p className="text-slate-500 font-semibold">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Today's Appointments</h2>
                    <Link href="/dashboard/appointments" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-2 group">
                        View Queue <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading appointments...</div>
                ) : recentAppointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Appointments Today</h3>
                        <p className="text-slate-500">Your schedule is clear for today.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {recentAppointments.map((appointment, i) => (
                            <Link
                                key={appointment.id || i}
                                href="/dashboard/appointments"
                                className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                        {appointment.patient_name?.[0] || 'P'}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                            {appointment.patient_name || 'Patient'}
                                        </h4>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Token #{i + 1}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${appointment.mode === 'online'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {appointment.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                        {appointment.mode === 'online' ? 'Online' : 'In-Person'}
                                    </span>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        appointment.status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                                            appointment.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                        }`}>
                                        {appointment.status === 'waiting' && 'Waiting'}
                                        {appointment.status === 'in_progress' && 'In Progress'}
                                        {appointment.status === 'completed' && 'Completed'}
                                        {appointment.status === 'no_show' && 'No Show'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
