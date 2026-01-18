'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Clock,
    Play,
    CheckCircle,
    XCircle,
    User,
    Calendar,
    Video,
    MapPin,
    Brain,
    ChevronRight,
    AlertCircle,
    RefreshCw,
    CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Appointment {
    id: string
    patient_id: string
    patient_name: string
    patient_age?: number
    patient_gender?: string
    queue_number: number
    status: 'waiting' | 'in_progress' | 'completed' | 'no_show' | 'pending' | 'confirmed'
    mode: 'online' | 'offline'
    chief_complaint?: string
    scheduled_time: string
    meet_link?: string
    queue_date?: string
}

export default function DoctorAppointmentsPage() {
    const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today')
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [upcomingByDate, setUpcomingByDate] = useState<Record<string, Appointment[]>>({})
    const [loading, setLoading] = useState(true)
    const [currentPatient, setCurrentPatient] = useState<Appointment | null>(null)
    const [doctorStatus, setDoctorStatus] = useState<'idle' | 'consulting'>('idle')
    const [meetLink, setMeetLink] = useState<string>('')
    const [doctorId, setDoctorId] = useState<string>('')

    useEffect(() => {
        const userData = localStorage.getItem('user')
        const user = userData ? JSON.parse(userData) : {}
        const id = user.email || user.id
        setDoctorId(id)

        // Load meet link from localStorage
        const savedMeetLink = localStorage.getItem('doctor_meet_link') || ''
        setMeetLink(savedMeetLink)

        if (id) {
            fetchAppointments(id)
        }
    }, [])

    const fetchAppointments = async (id: string) => {
        try {
            setLoading(true)

            // Fetch today's appointments
            try {
                const result = await api.getDoctorAppointmentsToday(id)
                if (result.appointments) {
                    setAppointments(result.appointments)
                }
            } catch {
                // Use empty array if API fails
                setAppointments([])
            }

            // Fetch upcoming 7-day appointments
            try {
                const upcomingResult = await api.getDoctorAppointmentsUpcoming(id, 7)
                if (upcomingResult.appointments_by_date) {
                    setUpcomingByDate(upcomingResult.appointments_by_date)
                }
            } catch {
                setUpcomingByDate({})
            }
        } finally {
            setLoading(false)
        }
    }

    const startConsultation = (appointment: Appointment) => {
        setCurrentPatient(appointment)
        setDoctorStatus('consulting')
        setAppointments(prev => prev.map(a =>
            a.id === appointment.id ? { ...a, status: 'in_progress' as const } : a
        ))
    }

    const endConsultation = () => {
        if (currentPatient) {
            setAppointments(prev => prev.map(a =>
                a.id === currentPatient.id ? { ...a, status: 'completed' as const } : a
            ))
        }
        setCurrentPatient(null)
        setDoctorStatus('idle')
    }

    const markNoShow = (appointment: Appointment) => {
        setAppointments(prev => prev.map(a =>
            a.id === appointment.id ? { ...a, status: 'no_show' as const } : a
        ))
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (dateStr === today.toISOString().split('T')[0]) return 'Today'
        if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow'

        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const waitingPatients = appointments.filter(a => a.status === 'waiting' || a.status === 'pending' || a.status === 'confirmed')
    const completedPatients = appointments.filter(a => a.status === 'completed')

    // Count total upcoming appointments
    const totalUpcoming = Object.values(upcomingByDate).reduce((sum, arr) => sum + arr.length, 0)

    const renderAppointmentCard = (appointment: Appointment, showDate: boolean = false) => (
        <div
            key={appointment.id}
            className={`p-4 flex items-center gap-4 ${appointment.status === 'in_progress'
                ? 'bg-primary-50'
                : appointment.status === 'completed'
                    ? 'bg-green-50'
                    : appointment.status === 'no_show'
                        ? 'bg-red-50'
                        : 'hover:bg-slate-50'
                } transition-colors`}
        >
            {/* Token Number */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${appointment.status === 'in_progress'
                ? 'bg-primary-600 text-white'
                : appointment.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                #{appointment.queue_number}
            </div>

            {/* Patient Info */}
            <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{appointment.patient_name || appointment.patient_id}</h3>
                <p className="text-sm text-slate-500">
                    {appointment.patient_age ? `${appointment.patient_age} yrs` : ''}
                    {appointment.patient_age && appointment.patient_gender && ', '}
                    {appointment.patient_gender}
                    {appointment.chief_complaint && ` • ${appointment.chief_complaint}`}
                </p>
                {showDate && appointment.scheduled_time && (
                    <p className="text-xs text-slate-400 mt-1">
                        {new Date(appointment.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>

            {/* Mode Badge */}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${appointment.mode === 'online'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
                }`}>
                {appointment.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                {appointment.mode === 'online' ? 'Online' : 'In-Person'}
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'waiting' || appointment.status === 'pending' || appointment.status === 'confirmed'
                ? 'bg-amber-100 text-amber-700'
                : appointment.status === 'in_progress'
                    ? 'bg-primary-100 text-primary-700'
                    : appointment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                {(appointment.status === 'waiting' || appointment.status === 'pending' || appointment.status === 'confirmed') && 'Scheduled'}
                {appointment.status === 'in_progress' && 'In Progress'}
                {appointment.status === 'completed' && 'Completed'}
                {appointment.status === 'no_show' && 'No Show'}
            </div>

            {/* Actions - Only for today's appointments */}
            {activeTab === 'today' && (appointment.status === 'waiting' || appointment.status === 'pending' || appointment.status === 'confirmed') && !currentPatient && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => startConsultation(appointment)}
                        className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        Start
                    </button>
                    <button
                        onClick={() => markNoShow(appointment)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                        No Show
                    </button>
                </div>
            )}

            {/* View Patient Profile - For upcoming appointments */}
            {activeTab === 'upcoming' && (
                <Link
                    href={`/dashboard/patient/${appointment.patient_id}`}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                    <User className="w-4 h-4" />
                    View Profile
                </Link>
            )}

            {appointment.status === 'in_progress' && (
                <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                    In Session
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
                    <p className="text-slate-500 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => fetchAppointments(doctorId)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'today'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Today
                    {appointments.length > 0 && (
                        <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                            {appointments.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'upcoming'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    Next 7 Days
                    {totalUpcoming > 0 && (
                        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs">
                            {totalUpcoming}
                        </span>
                    )}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'today' && (
                    <motion.div
                        key="today"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
                                        <p className="text-xs text-slate-500">Total Today</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{waitingPatients.length}</p>
                                        <p className="text-xs text-slate-500">Waiting</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{completedPatients.length}</p>
                                        <p className="text-xs text-slate-500">Completed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {doctorStatus === 'consulting' ? 'Active' : 'Ready'}
                                        </p>
                                        <p className="text-xs text-slate-500">Status</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Consultation Banner */}
                        {currentPatient && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-primary-600 to-teal-600 rounded-2xl p-6 text-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                            <User className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-80">Currently Consulting</p>
                                            <h3 className="text-xl font-bold">{currentPatient.patient_name}</h3>
                                            <p className="text-sm opacity-80">
                                                Token #{currentPatient.queue_number} • {currentPatient.patient_age} yrs, {currentPatient.patient_gender}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {currentPatient.mode === 'online' && meetLink && (
                                            <a
                                                href={meetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join Meet
                                            </a>
                                        )}
                                        <Link
                                            href={`/dashboard/patient/${currentPatient.patient_id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                        >
                                            <Brain className="w-4 h-4" />
                                            AI Analysis
                                        </Link>
                                        <button
                                            onClick={endConsultation}
                                            className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            End Consultation
                                        </button>
                                    </div>
                                </div>
                                {currentPatient.chief_complaint && (
                                    <div className="mt-4 pt-4 border-t border-white/20">
                                        <p className="text-sm opacity-80">Chief Complaint</p>
                                        <p className="font-medium">{currentPatient.chief_complaint}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Queue List */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Today's Queue</h2>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-slate-500">Loading appointments...</div>
                            ) : appointments.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No appointments for today</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {appointments.map((appointment) => renderAppointmentCard(appointment))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'upcoming' && (
                    <motion.div
                        key="upcoming"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Upcoming Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                        <CalendarDays className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{totalUpcoming}</p>
                                        <p className="text-xs text-slate-500">Total Upcoming</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{Object.keys(upcomingByDate).length}</p>
                                        <p className="text-xs text-slate-500">Days with Appointments</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Appointments by Date */}
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                                Loading upcoming appointments...
                            </div>
                        ) : Object.keys(upcomingByDate).length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="font-medium">No upcoming appointments</p>
                                <p className="text-sm">Appointments for the next 7 days will appear here</p>
                            </div>
                        ) : (
                            Object.entries(upcomingByDate)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([date, dateAppointments]) => (
                                    <div key={date} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-slate-600" />
                                            <h3 className="text-lg font-bold text-slate-900">{formatDate(date)}</h3>
                                            <span className="text-sm text-slate-500">{date}</span>
                                            <span className="ml-auto bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                {dateAppointments.length} patient{dateAppointments.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {dateAppointments.map((appointment) => renderAppointmentCard(appointment, true))}
                                        </div>
                                    </div>
                                ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No Meet Link Warning */}
            {!meetLink && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <div className="flex-1">
                        <p className="text-amber-800 font-medium">Google Meet link not configured</p>
                        <p className="text-sm text-amber-600">Set up your Meet link in Profile to enable online consultations</p>
                    </div>
                    <Link href="/dashboard/profile" className="text-amber-700 font-semibold hover:underline">
                        Configure Now
                    </Link>
                </div>
            )}
        </div>
    )
}
