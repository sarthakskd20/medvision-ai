'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    ChevronRight,
    Stethoscope,
    AlertCircle,
    CheckCircle,
    XCircle,
    Filter
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

// Mock data
const mockAppointments = [
    {
        id: '1',
        doctorName: 'Dr. Priya Sharma',
        specialization: 'Cardiologist',
        mode: 'online',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'confirmed',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        hospitalAddress: null
    },
    {
        id: '2',
        doctorName: 'Dr. Rajesh Kumar',
        specialization: 'General Physician',
        mode: 'offline',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'confirmed',
        meetLink: null,
        hospitalAddress: 'City Hospital, Room 204, Mumbai'
    },
    {
        id: '3',
        doctorName: 'Dr. Amit Patel',
        specialization: 'Dermatologist',
        mode: 'online',
        scheduledTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        meetLink: null,
        hospitalAddress: null
    },
    {
        id: '4',
        doctorName: 'Dr. Sunita Gupta',
        specialization: 'ENT Specialist',
        mode: 'offline',
        scheduledTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        status: 'completed',
        meetLink: null,
        hospitalAddress: 'Max Healthcare, Delhi'
    }
]

export default function PatientAppointmentsPage() {
    const [appointments, setAppointments] = useState(mockAppointments)
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'no_show': return 'bg-slate-100 text-slate-700'
            default: return 'bg-slate-100 text-slate-600'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-4 h-4" />
            case 'completed': return <CheckCircle className="w-4 h-4" />
            case 'cancelled': return <XCircle className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    const formatDate = (date: Date) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

        if (appointmentDate.getTime() === today.getTime()) {
            return 'Today'
        } else if (appointmentDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow'
        }
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const isUpcoming = (date: Date) => date > new Date()

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true
        if (filter === 'upcoming') return isUpcoming(apt.scheduledTime) && apt.status !== 'cancelled'
        if (filter === 'completed') return apt.status === 'completed'
        if (filter === 'cancelled') return apt.status === 'cancelled'
        return true
    })

    const upcomingCount = appointments.filter(apt => isUpcoming(apt.scheduledTime) && apt.status !== 'cancelled').length
    const completedCount = appointments.filter(apt => apt.status === 'completed').length

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
                    <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage your upcoming and past appointments</p>
                </div>
                <Link
                    href="/patient/doctors"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
                >
                    <Calendar className="w-5 h-5" />
                    Book New
                </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Upcoming', value: upcomingCount, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Completed', value: completedCount, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Total', value: appointments.length, color: 'text-slate-600', bg: 'bg-slate-50' }
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} p-4 rounded-xl`}>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-slate-600">{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value as typeof filter)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${filter === f.value
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </motion.div>

            {/* Appointments List */}
            <motion.div variants={container} className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <motion.div variants={item} className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No appointments found</h3>
                        <p className="text-slate-500 mb-4">
                            {filter === 'upcoming' ? "You don't have any upcoming appointments" : "No appointments match this filter"}
                        </p>
                        <Link href="/patient/doctors" className="text-primary-600 font-semibold hover:underline">
                            Book an appointment
                        </Link>
                    </motion.div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <motion.div
                            key={apt.id}
                            variants={item}
                            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Doctor Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                                        <Stethoscope className="w-7 h-7 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{apt.doctorName}</h3>
                                        <p className="text-sm text-slate-500">{apt.specialization}</p>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-800">{formatDate(apt.scheduledTime)}</p>
                                        <p className="text-sm text-slate-500">{formatTime(apt.scheduledTime)}</p>
                                    </div>

                                    {/* Mode Badge */}
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${apt.mode === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {apt.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                        {apt.mode === 'online' ? 'Online' : 'In-Person'}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(apt.status)}`}>
                                        {getStatusIcon(apt.status)}
                                        {apt.status}
                                    </span>
                                </div>
                            </div>

                            {/* Action Row */}
                            {isUpcoming(apt.scheduledTime) && apt.status === 'confirmed' && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                    {apt.mode === 'online' && apt.meetLink ? (
                                        <a
                                            href={apt.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            <Video className="w-4 h-4" />
                                            Join Meeting
                                        </a>
                                    ) : apt.mode === 'offline' && apt.hospitalAddress ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {apt.hospitalAddress}
                                        </div>
                                    ) : null}

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/patient/appointments/${apt.id}`}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm"
                                        >
                                            View Details
                                        </Link>
                                        <button className="px-4 py-2 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {apt.status === 'completed' && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Consultation completed</span>
                                    <Link
                                        href={`/patient/appointments/${apt.id}`}
                                        className="text-primary-600 font-semibold text-sm hover:underline flex items-center gap-1"
                                    >
                                        View Summary <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    )
}
