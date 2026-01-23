'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    ChevronRight,
    Stethoscope
} from 'lucide-react'
import api from '@/lib/api'

interface DashboardStats {
    upcomingAppointments: number
    completedVisits: number
    medicalRecords: number
    healthScore: string
}

interface Appointment {
    id: string
    doctor_id: string
    doctorName: string
    specialization: string
    mode: 'online' | 'offline'
    scheduled_time: string | Date
    status: string
    hospital_address?: string
}

// Demo doctor mapping for hackathon
const doctorInfo: Record<string, { name: string; specialization: string }> = {
    '1': { name: 'Dr. Priya Sharma', specialization: 'Cardiologist' },
    '2': { name: 'Dr. Rajesh Kumar', specialization: 'General Physician' },
    '3': { name: 'Dr. Amit Patel', specialization: 'Dermatologist' },
    '4': { name: 'Dr. Sunita Gupta', specialization: 'ENT Specialist' },
    '5': { name: 'Dr. Vikram Singh', specialization: 'Orthopedic Surgeon' }
}

export default function PatientDashboard() {
    const [patientName, setPatientName] = useState('Patient')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        upcomingAppointments: 0,
        completedVisits: 0,
        medicalRecords: 0,
        healthScore: 'Good'
    })
    const [appointments, setAppointments] = useState<Appointment[]>([])

    const statsRef = useRef<HTMLDivElement>(null)
    const appointmentsRef = useRef<HTMLDivElement>(null)
    const [statsVisible, setStatsVisible] = useState(false)
    const [appointmentsVisible, setAppointmentsVisible] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const userData = localStorage.getItem('user')
            if (userData) {
                try {
                    const user = JSON.parse(userData)
                    setPatientName(user.name || user.fullName || 'Patient')

                    const patientId = user.email || user.id
                    if (patientId) {
                        // Fetch real appointments
                        const appointmentsData = await api.getPatientAppointments(patientId)
                        const mappedAppointments = appointmentsData.map((apt: any) => {
                            const docInfo = doctorInfo[apt.doctor_id] || {
                                name: `Dr. Unknown (${apt.doctor_id})`,
                                specialization: 'Specialist'
                            }
                            return {
                                ...apt,
                                doctorName: apt.doctorName || docInfo.name,
                                specialization: apt.specialization || docInfo.specialization
                            }
                        })
                        setAppointments(mappedAppointments)

                        // Calculate stats
                        const upcoming = mappedAppointments.filter((a: any) =>
                            ['pending', 'confirmed', 'in_progress'].includes(a.status)
                        ).length
                        const completed = mappedAppointments.filter((a: any) =>
                            a.status === 'completed'
                        ).length

                        // Fetch records count
                        let recordsCount = 0
                        try {
                            const recordsData = await api.getPatientReports(patientId)
                            recordsCount = recordsData.length
                        } catch (e) {
                            // Records API might 404 if no reports exist
                        }

                        setStats({
                            upcomingAppointments: upcoming,
                            completedVisits: completed,
                            medicalRecords: recordsCount,
                            healthScore: 'Good'
                        })
                    }
                } catch (e) {
                    console.error('Failed to load data:', e)
                }
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    useEffect(() => {
        const observerOptions = { threshold: 0.2 }

        const statsObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setStatsVisible(true)
        }, observerOptions)

        const appointmentsObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setAppointmentsVisible(true)
        }, observerOptions)

        if (statsRef.current) statsObserver.observe(statsRef.current)
        if (appointmentsRef.current) appointmentsObserver.observe(appointmentsRef.current)

        return () => {
            statsObserver.disconnect()
            appointmentsObserver.disconnect()
        }
    }, [])

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    const formatTime = (dateArg: Date | string) => {
        const date = typeof dateArg === 'string' ? new Date(dateArg) : dateArg
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const formatDate = (dateArg: Date | string) => {
        const date = typeof dateArg === 'string' ? new Date(dateArg) : dateArg
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
        <div className="space-y-8">
            {/* Compact Greeting */}
            <section className="pt-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="w-12 h-0.5 bg-teal-600 dark:bg-[#16c401] mb-4" />
                    <h1 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200">
                        {getGreeting()},
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-[#16c401] mt-1">
                        {patientName}
                    </h2>
                </motion.div>
            </section>

            {/* Today's Overview - LARGE */}
            <section ref={statsRef}>
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">Your Health Overview</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Track your medical journey</p>
                    </div>
                    <div className="w-24 h-1 bg-[#0d9488]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Upcoming Appointments Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0, duration: 0.6 }}
                        className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-8 hover:border-teal-500 dark:hover:border-[#16c401] transition-colors"
                    >
                        <div className="w-14 h-14 mb-6 relative overflow-hidden">
                            <Image src="/images/icon-patient-calendar.png" alt="Appointments" fill className="object-contain" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.upcomingAppointments}</p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">Upcoming</p>
                    </motion.div>

                    {/* Completed Visits Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-8 hover:border-teal-500 dark:hover:border-[#16c401] transition-colors"
                    >
                        <div className="w-14 h-14 mb-6 relative overflow-hidden">
                            <Image src="/images/icon-patient-checkmark.png" alt="Completed" fill className="object-contain" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.completedVisits}</p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">Completed</p>
                    </motion.div>

                    {/* Medical Records Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-8 hover:border-teal-500 dark:hover:border-[#16c401] transition-colors"
                    >
                        <div className="w-14 h-14 mb-6 relative overflow-hidden">
                            <Image src="/images/icon-patient-records.png" alt="Records" fill className="object-contain" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.medicalRecords}</p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">Records</p>
                    </motion.div>

                    {/* Health Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-8 hover:border-teal-500 dark:hover:border-[#16c401] transition-colors"
                    >
                        <div className="w-14 h-14 mb-6 relative overflow-hidden">
                            <Image src="/images/icon-patient-health.png" alt="Health" fill className="object-contain" />
                        </div>
                        <p className="text-5xl font-black text-slate-900 dark:text-white">{stats.healthScore}</p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">Health</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Actions with Medical Images */}
            <section className="mt-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Quick Actions</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your healthcare needs</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Book Appointment Card */}
                    <Link href="/patient/doctors" className="group">
                        <div className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-teal-500 dark:hover:border-[#16c401] transition-all">
                            <div className="w-full h-40 relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800">
                                <Image
                                    src="/images/patient-book-appointment.png"
                                    alt="Book Appointment"
                                    fill
                                    className="object-contain group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Book Appointment</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Find and book with specialists</p>
                        </div>
                    </Link>

                    {/* Upload Records Card */}
                    <Link href="/patient/records/upload" className="group">
                        <div className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-teal-500 dark:hover:border-[#16c401] transition-all">
                            <div className="w-full h-40 relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800">
                                <Image
                                    src="/images/patient-upload-records.png"
                                    alt="Upload Records"
                                    fill
                                    className="object-contain group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Upload Records</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add medical documents securely</p>
                        </div>
                    </Link>

                    {/* Find Doctor Card */}
                    <Link href="/patient/doctors" className="group">
                        <div className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-teal-500 dark:hover:border-[#16c401] transition-all">
                            <div className="w-full h-40 relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800">
                                <Image
                                    src="/images/patient-find-doctor.png"
                                    alt="Find Doctor"
                                    fill
                                    className="object-contain group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Find a Doctor</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Search by specialty or name</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Appointments Section */}
            <section ref={appointmentsRef}>
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">Upcoming Appointments</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Your scheduled visits</p>
                    </div>
                    <Link
                        href="/patient/appointments"
                        className="px-6 py-3 bg-[#0d9488] text-white font-bold hover:bg-teal-700 dark:hover:bg-[#12a801] transition-colors"
                    >
                        View All
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                        Loading appointments...
                    </div>
                ) : appointments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={appointmentsVisible ? { opacity: 1 } : {}}
                        className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-16 text-center"
                    >
                        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 border-2 border-slate-200 dark:border-slate-600">
                            <Calendar className="w-10 h-10 text-slate-400" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-700 dark:text-slate-300 mb-3">No Appointments Scheduled</h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Book your first appointment with a specialist.</p>
                        <Link
                            href="/patient/doctors"
                            className="inline-block px-6 py-3 bg-[#0d9488] text-white font-bold hover:bg-teal-700 transition-colors"
                        >
                            Find a Doctor
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {appointments.slice(0, 5).map((appointment, i) => (
                            <motion.div
                                key={appointment.id || i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={appointmentsVisible ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <Link
                                    href="/patient/appointments"
                                    className="block bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-[#0d9488] transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[#0d9488] font-black text-xl">
                                                <Stethoscope className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {appointment.doctorName || 'Doctor'}
                                                </h4>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    {appointment.specialization}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-2">
                                                        {appointment.mode === 'online' ? (
                                                            <><Video className="w-4 h-4" /> Video Call</>
                                                        ) : (
                                                            <><MapPin className="w-4 h-4" /> In-Person</>
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDate(appointment.scheduled_time)} at {formatTime(appointment.scheduled_time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wide ${appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {appointment.status?.replace('_', ' ') || 'Pending'}
                                            </span>
                                            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-[#0d9488] transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            <div className="h-16" />
        </div>
    )
}
