'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    ChevronRight,
    FileText,
    Activity,
    Bell,
    User,
    Search,
    Plus,
    Stethoscope,
    Upload,
    Sparkles
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
}

const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
}

// Mock data
const mockUpcomingAppointments = [
    {
        id: '1',
        doctorName: 'Dr. Priya Sharma',
        specialization: 'Cardiologist',
        mode: 'online',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'confirmed',
        doctorImage: null
    },
    {
        id: '2',
        doctorName: 'Dr. Rajesh Kumar',
        specialization: 'General Physician',
        mode: 'offline',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'confirmed',
        hospitalAddress: 'City Hospital, Room 204',
        doctorImage: null
    }
]

const mockRecentRecords = [
    { id: '1', name: 'Blood Test Report', date: '2026-01-10', type: 'Lab Report' },
    { id: '2', name: 'Chest X-Ray', date: '2025-12-15', type: 'Imaging' }
]

export default function PatientDashboard() {
    const [patientName, setPatientName] = useState('Patient')
    const [appointments, setAppointments] = useState(mockUpcomingAppointments)
    const [records, setRecords] = useState(mockRecentRecords)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)
                setPatientName(user.name?.split(' ')[0] || 'Patient')
            } catch (e) {
                console.error('Failed to parse user data')
            }
        }
    }, [])

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const formatDate = (date: Date) => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow'
        }
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">{patientName}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-xl font-medium">Manage your health journey with MedVision AI</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/patient/doctors"
                        className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-teal-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Book Appointment
                    </Link>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Upcoming', value: appointments.length, icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                    { label: 'Completed', value: 8, icon: Activity, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
                    { label: 'Records', value: records.length, icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                    { label: 'Reminders', value: 2, icon: Bell, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Content - Three Column Layout */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* Appointments - SHORTER HEIGHT with fixed max-h */}
                <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Upcoming Appointments</h2>
                        <Link href="/patient/appointments" className="text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 flex items-center gap-1 text-base">
                            View All <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    {/* FIXED HEIGHT - not expanding */}
                    <div className="max-h-64 overflow-y-auto">
                        {appointments.length === 0 ? (
                            <div className="p-8 text-center">
                                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-lg text-slate-500 dark:text-slate-400">No upcoming appointments</p>
                                <Link href="/patient/doctors" className="text-primary-600 font-bold mt-2 inline-block hover:underline text-lg">
                                    Book your first appointment
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 dark:from-primary-900 dark:to-teal-900 flex items-center justify-center flex-shrink-0">
                                                <Stethoscope className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{apt.doctorName}</h3>
                                                        <p className="text-base text-slate-500 dark:text-slate-400">{apt.specialization}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${apt.mode === 'online'
                                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                                        : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                        }`}>
                                                        {apt.mode === 'online' ? (
                                                            <span className="flex items-center gap-1"><Video className="w-4 h-4" /> Online</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> In-Person</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-4 text-base text-slate-600 dark:text-slate-300">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {formatDate(apt.scheduledTime)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        {formatTime(apt.scheduledTime)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/patient/appointments/${apt.id}`}
                                                className="px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column - Upload & Quick Actions */}
                <motion.div variants={item} className="space-y-5">
                    {/* Upload Records - TEAL/PRIMARY COLOR SCHEME */}
                    <Link href="/patient/records/upload" className="block bg-gradient-to-br from-primary-500 via-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-extrabold text-white">Upload Records</h3>
                                <p className="text-white text-base font-medium opacity-90">Add your medical documents</p>
                            </div>
                            <ChevronRight className="w-6 h-6 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="/patient/doctors" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group border border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                                    <Search className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-slate-800 dark:text-white">Find a Doctor</p>
                                    <p className="text-base text-slate-500 dark:text-slate-400">Search by specialty</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </Link>
                            <Link href="/patient/profile" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group border border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                                    <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-slate-800 dark:text-white">My Profile</p>
                                    <p className="text-base text-slate-500 dark:text-slate-400">Update your info</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </Link>
                        </div>
                    </div>

                    {/* Recent Records */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent Records</h3>
                            <Link href="/patient/records" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {records.map((record) => (
                                <div key={record.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                    <div className="w-11 h-11 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-500">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base text-slate-800 dark:text-white truncate">{record.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{record.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* MedVision Tip - Bottom */}
            <motion.div
                variants={item}
                className="bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold">MedVision AI Tip</span>
                            <p className="text-white/80 text-base font-medium mt-1">Powered by advanced AI</p>
                        </div>
                    </div>
                    <p className="flex-1 text-white/90 text-lg font-medium">
                        Keep your medical records updated before appointments for faster, more accurate AI-powered health analysis and personalized recommendations.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
