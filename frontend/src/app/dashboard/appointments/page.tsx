'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    RefreshCw
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
    status: 'waiting' | 'in_progress' | 'completed' | 'no_show'
    mode: 'online' | 'offline'
    chief_complaint?: string
    scheduled_time: string
    meet_link?: string
}

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPatient, setCurrentPatient] = useState<Appointment | null>(null)
    const [doctorStatus, setDoctorStatus] = useState<'idle' | 'consulting'>('idle')
    const [meetLink, setMeetLink] = useState<string>('')

    useEffect(() => {
        fetchTodayAppointments()
        // Load meet link from localStorage
        const savedMeetLink = localStorage.getItem('doctor_meet_link') || ''
        setMeetLink(savedMeetLink)
    }, [])

    const fetchTodayAppointments = async () => {
        try {
            setLoading(true)
            const userData = localStorage.getItem('user')
            const user = userData ? JSON.parse(userData) : {}
            const doctorId = user.email || user.id

            // Try API first, fallback to mock data
            try {
                const result = await api.getDoctorAppointmentsToday(doctorId)
                if (result.appointments) {
                    setAppointments(result.appointments)
                }
            } catch {
                // Mock data for demonstration
                setAppointments([
                    {
                        id: '1',
                        patient_id: 'p1',
                        patient_name: 'Rahul Sharma',
                        patient_age: 32,
                        patient_gender: 'Male',
                        queue_number: 1,
                        status: 'waiting',
                        mode: 'online',
                        chief_complaint: 'Persistent headache for 3 days',
                        scheduled_time: new Date().toISOString()
                    },
                    {
                        id: '2',
                        patient_id: 'p2',
                        patient_name: 'Priya Patel',
                        patient_age: 28,
                        patient_gender: 'Female',
                        queue_number: 2,
                        status: 'waiting',
                        mode: 'online',
                        chief_complaint: 'Fever and cold symptoms',
                        scheduled_time: new Date().toISOString()
                    },
                    {
                        id: '3',
                        patient_id: 'p3',
                        patient_name: 'Amit Kumar',
                        patient_age: 45,
                        patient_gender: 'Male',
                        queue_number: 3,
                        status: 'waiting',
                        mode: 'offline',
                        chief_complaint: 'Joint pain and stiffness',
                        scheduled_time: new Date().toISOString()
                    }
                ])
            }
        } finally {
            setLoading(false)
        }
    }

    const startConsultation = (appointment: Appointment) => {
        setCurrentPatient(appointment)
        setDoctorStatus('consulting')
        // Update appointment status
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

    const waitingPatients = appointments.filter(a => a.status === 'waiting')
    const completedPatients = appointments.filter(a => a.status === 'completed')

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Today's Appointments</h1>
                    <p className="text-slate-500 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={fetchTodayAppointments}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

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

            {/* Waiting Status */}
            {doctorStatus === 'idle' && waitingPatients.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                    <Clock className="w-6 h-6 text-amber-600" />
                    <p className="text-amber-800 font-medium">
                        Waiting for next patient... {waitingPatients.length} patient(s) in queue
                    </p>
                </div>
            )}

            {/* Queue List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Patient Queue</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No appointments for today</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.map((appointment) => (
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
                                    <h3 className="font-semibold text-slate-900">{appointment.patient_name}</h3>
                                    <p className="text-sm text-slate-500">
                                        {appointment.patient_age} yrs, {appointment.patient_gender} • {appointment.chief_complaint}
                                    </p>
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
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'waiting'
                                    ? 'bg-amber-100 text-amber-700'
                                    : appointment.status === 'in_progress'
                                        ? 'bg-primary-100 text-primary-700'
                                        : appointment.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {appointment.status === 'waiting' && 'Waiting'}
                                    {appointment.status === 'in_progress' && 'In Progress'}
                                    {appointment.status === 'completed' && 'Completed'}
                                    {appointment.status === 'no_show' && 'No Show'}
                                </div>

                                {/* Actions */}
                                {appointment.status === 'waiting' && !currentPatient && (
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

                                {appointment.status === 'in_progress' && (
                                    <div className="flex items-center gap-2 text-primary-600">
                                        <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                                        In Session
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* No Meet Link Warning */}
            {!meetLink && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <div className="flex-1">
                        <p className="text-amber-800 font-medium">Google Meet link not configured</p>
                        <p className="text-sm text-amber-600">Set up your Meet link in Settings to enable online consultations</p>
                    </div>
                    <Link href="/dashboard/settings" className="text-amber-700 font-semibold hover:underline">
                        Configure Now
                    </Link>
                </div>
            )}
        </div>
    )
}
