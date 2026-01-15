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
    Stethoscope
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

// Mock data - will be replaced with API calls
const mockUpcomingAppointments = [
    {
        id: '1',
        doctorName: 'Dr. Priya Sharma',
        specialization: 'Cardiologist',
        mode: 'online',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'confirmed',
        doctorImage: null
    },
    {
        id: '2',
        doctorName: 'Dr. Rajesh Kumar',
        specialization: 'General Physician',
        mode: 'offline',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
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
        // Load patient info
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
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">{patientName}</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your health journey with MedVision AI</p>
                </div>
                <Link
                    href="/patient/doctors"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Book Appointment
                </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Upcoming', value: appointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Completed', value: 8, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Records', value: records.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Reminders', value: 2, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments */}
                <motion.div variants={item} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                        <Link href="/patient/appointments" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 text-sm">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {appointments.length === 0 ? (
                            <div className="p-8 text-center">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No upcoming appointments</p>
                                <Link href="/patient/doctors" className="text-primary-600 font-semibold mt-2 inline-block hover:underline">
                                    Book your first appointment
                                </Link>
                            </div>
                        ) : (
                            appointments.map((apt) => (
                                <div key={apt.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Doctor Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                                            <Stethoscope className="w-6 h-6 text-primary-600" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{apt.doctorName}</h3>
                                                    <p className="text-sm text-slate-500">{apt.specialization}</p>
                                                </div>
                                                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${apt.mode === 'online'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {apt.mode === 'online' ? (
                                                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Online</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> In-Person</span>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {formatDate(apt.scheduledTime)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {formatTime(apt.scheduledTime)}
                                                </span>
                                            </div>

                                            {apt.mode === 'offline' && apt.hospitalAddress && (
                                                <p className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {apt.hospitalAddress}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-4 flex justify-end">
                                        <Link
                                            href={`/patient/appointments/${apt.id}`}
                                            className="px-4 py-2 bg-primary-50 text-primary-600 font-semibold rounded-lg hover:bg-primary-100 transition-colors text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div variants={item} className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/patient/doctors" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                    <Search className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Find a Doctor</p>
                                    <p className="text-xs text-slate-500">Search by specialty</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                            </Link>
                            <Link href="/patient/records/upload" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Upload Records</p>
                                    <p className="text-xs text-slate-500">Add medical documents</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                            </Link>
                            <Link href="/patient/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                                    <User className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">My Profile</p>
                                    <p className="text-xs text-slate-500">Update your info</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                            </Link>
                        </div>
                    </div>

                    {/* Recent Records */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Recent Records</h3>
                            <Link href="/patient/records" className="text-primary-600 text-sm font-semibold hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {records.map((record) => (
                                <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">{record.name}</p>
                                        <p className="text-xs text-slate-500">{record.type} • {record.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Health Tip */}
                    <div className="bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-5 h-5" />
                            <span className="font-semibold">MedVision Tip</span>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">
                            Keep your medical records updated before appointments for faster, more accurate AI-powered analysis.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
