'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    ArrowRight,
    User,
    Users,
    Stethoscope,
    FileText,
    Upload,
    CheckCircle,
    Calendar,
    Clock,
    Video,
    MapPin,
    AlertCircle,
    X,
    Plus,
    Trash2,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

// Types
interface BasicInfo {
    fullName: string
    age: string
    gender: string
    bloodGroup: string
    allergies: string[]
    currentMedications: string[]
}

interface ChiefComplaint {
    description: string
    duration: string
    durationUnit: string
    severity: number
    previousTreatment: string
}

interface MedicalHistory {
    conditions: string[]
    surgeries: { name: string; year: string }[]
    familyHistory: string
    smoking: string
    alcohol: string
    exercise: string
}

interface UploadedDocument {
    id: string
    file: File
    name: string
    type: string
    uploadDate: string  // Auto-set to current date, backend will extract from PDF if available
    description: string
}

// Slot interface for type safety
interface Slot {
    time: string
    datetime: string
    display: string
}

interface DoctorData {
    id: string
    name: string
    specialization: string
    hospital?: string
    acceptsOnline: boolean
    acceptsOffline: boolean
    consultationFee: number
    availableSlots: Slot[]
}

const conditionOptions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Thyroid Disorder',
    'Arthritis', 'Cancer', 'Kidney Disease', 'Liver Disease', 'None'
]

const documentTypes = [
    'Blood Test Report', 'CT Scan', 'MRI', 'X-Ray', 'ECG/EKG',
    'Prescription', 'Discharge Summary', 'Surgery Report', 'Other'
]

export default function BookAppointmentPage() {
    const params = useParams()
    const router = useRouter()
    const doctorId = params.id as string

    const [step, setStep] = useState(1)
    const [doctor, setDoctor] = useState<DoctorData | null>(null)
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
    const [selectedMode, setSelectedMode] = useState<'online' | 'offline'>('online')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [alreadyBooked, setAlreadyBooked] = useState(false)

    // Form states
    const [basicInfo, setBasicInfo] = useState<BasicInfo>({
        fullName: '',
        age: '',
        gender: '',
        bloodGroup: '',
        allergies: [],
        currentMedications: []
    })

    const [chiefComplaint, setChiefComplaint] = useState<ChiefComplaint>({
        description: '',
        duration: '',
        durationUnit: 'days',
        severity: 5,
        previousTreatment: ''
    })

    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
        conditions: [],
        surgeries: [],
        familyHistory: '',
        smoking: 'never',
        alcohol: 'never',
        exercise: 'moderate'
    })

    const [documents, setDocuments] = useState<UploadedDocument[]>([])
    const [consents, setConsents] = useState({
        accuracy: false,
        aiAnalysis: false,
        cancellation: false
    })

    // Temp input states
    const [newAllergy, setNewAllergy] = useState('')
    const [newMedication, setNewMedication] = useState('')

    useEffect(() => {
        // Load user data
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)
                setBasicInfo(prev => ({ ...prev, fullName: user.name || '' }))
            } catch (e) { }
        }

        // Fetch doctor and slots from API
        const fetchDoctorAndSlots = async () => {
            try {
                setLoading(true)
                setError(null)

                // Get today and tomorrow dates for slot fetching
                const today = new Date()
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                const todayStr = today.toISOString().split('T')[0]
                const tomorrowStr = tomorrow.toISOString().split('T')[0]

                // Get patient ID to check for existing appointment
                const userData = localStorage.getItem('user')
                const user = userData ? JSON.parse(userData) : {}
                const patientId = user.email || user.id

                // Check if patient already has an active appointment with this doctor
                if (patientId) {
                    try {
                        const checkResult = await api.hasActiveAppointmentWithDoctor(patientId, doctorId)
                        if (checkResult.has_active) {
                            setAlreadyBooked(true)
                            setLoading(false)
                            return
                        }
                    } catch (e) {
                        console.log('Could not check existing appointments')
                    }
                }

                // Try to fetch doctor details - fallback to mock if API fails
                let doctorData: DoctorData = {
                    id: doctorId,
                    name: 'Doctor',
                    specialization: 'Specialist',
                    acceptsOnline: true,
                    acceptsOffline: true,
                    consultationFee: 500,
                    availableSlots: []
                }

                // Fetch available slots for today and tomorrow
                try {
                    const [todaySlots, tomorrowSlots] = await Promise.all([
                        api.getAvailableSlots(doctorId, todayStr),
                        api.getAvailableSlots(doctorId, tomorrowStr)
                    ])

                    const formatSlotDisplay = (slot: any, dateLabel: string) => ({
                        ...slot,
                        display: `${dateLabel}, ${slot.display}`
                    })

                    const allSlots = [
                        ...todaySlots.slots.map(s => formatSlotDisplay(s, 'Today')),
                        ...tomorrowSlots.slots.map(s => formatSlotDisplay(s, 'Tomorrow'))
                    ]

                    setAvailableSlots(allSlots)
                } catch (slotError) {
                    console.error('Failed to fetch slots from API, using fallback:', slotError)
                    // Fallback slots for demo
                    const fallbackSlots = [
                        { time: '10:00', datetime: `${todayStr}T10:00:00`, display: 'Today, 10:00 AM' },
                        { time: '11:30', datetime: `${todayStr}T11:30:00`, display: 'Today, 11:30 AM' },
                        { time: '14:00', datetime: `${tomorrowStr}T14:00:00`, display: 'Tomorrow, 2:00 PM' },
                        { time: '15:30', datetime: `${tomorrowStr}T15:30:00`, display: 'Tomorrow, 3:30 PM' }
                    ]
                    setAvailableSlots(fallbackSlots)
                }

                setDoctor(doctorData)
            } catch (err) {
                console.error('Error loading booking page:', err)
                setError('Failed to load doctor information')
            } finally {
                setLoading(false)
            }
        }

        fetchDoctorAndSlots()
    }, [doctorId])

    const handleNext = () => {
        if (step < 5) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)
            setError(null)

            // Get patient ID from localStorage
            const userData = localStorage.getItem('user')
            const user = userData ? JSON.parse(userData) : {}
            const patientId = user.email || user.id || `patient_${Date.now()}`

            if (!selectedSlot) {
                setError('Please select a time slot')
                return
            }

            // Create appointment via API
            const result = await api.createAppointment({
                patient_id: patientId,
                doctor_id: doctorId,
                scheduled_time: selectedSlot.datetime,
                mode: selectedMode,
                patient_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })

            if (result.success) {
                console.log('Appointment created:', result)
                router.push('/patient/appointments')
            } else {
                setError('Failed to create appointment')
            }
        } catch (err: any) {
            console.error('Booking error:', err)
            setError(err.message || 'Failed to book appointment')
        } finally {
            setSubmitting(false)
        }
    }

    const addAllergy = () => {
        if (newAllergy.trim()) {
            setBasicInfo(prev => ({ ...prev, allergies: [...prev.allergies, newAllergy.trim()] }))
            setNewAllergy('')
        }
    }

    const addMedication = () => {
        if (newMedication.trim()) {
            setBasicInfo(prev => ({ ...prev, currentMedications: [...prev.currentMedications, newMedication.trim()] }))
            setNewMedication('')
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const today = new Date().toISOString().split('T')[0]  // Current date as default
            Array.from(files).forEach(file => {
                if (file.type === 'application/pdf') {
                    setDocuments(prev => [...prev, {
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        name: file.name,
                        type: '',
                        uploadDate: today,  // Backend will extract actual date from PDF if available
                        description: ''
                    }])
                }
            })
        }
    }

    const removeDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id))
    }

    const updateDocument = (id: string, updates: Partial<UploadedDocument>) => {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
    }

    const stepTitles = ['Select Slot', 'Basic Info', 'Symptoms', 'Documents', 'Confirm']

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/patient/doctors" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Search
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Book Appointment</h1>
                <p className="text-slate-500 mt-1">with {doctor?.name || 'Doctor'}</p>
            </div>

            {/* Already Booked Blocker */}
            {alreadyBooked && (
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Already Booked</h2>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        You already have an active appointment with this doctor.
                        Please wait for it to complete or cancel it before booking a new one.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/patient/appointments"
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            View My Appointments
                        </Link>
                        <Link
                            href="/patient/doctors"
                            className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Find Other Doctors
                        </Link>
                    </div>
                </div>
            )}

            {!alreadyBooked && (
                <>
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {stepTitles.map((title, index) => (
                            <div key={title} className="flex items-center">
                                <div className={`flex items-center gap-2 ${index + 1 <= step ? 'text-primary-600' : 'text-slate-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index + 1 < step ? 'bg-primary-600 text-white' :
                                        index + 1 === step ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' :
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                        {index + 1 < step ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <span className="hidden md:block font-medium">{title}</span>
                                </div>
                                {index < 4 && (
                                    <div className={`w-8 md:w-16 h-1 mx-2 rounded ${index + 1 < step ? 'bg-primary-600' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Select Slot */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 mb-6">Select Appointment Date</h2>

                                    {/* Consultation Mode */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-3">Consultation Type</label>
                                        <div className="flex gap-4">
                                            {doctor?.acceptsOnline && (
                                                <button
                                                    onClick={() => setSelectedMode('online')}
                                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMode === 'online'
                                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <Video className="w-5 h-5" />
                                                    <span className="font-semibold">Online Consultation</span>
                                                </button>
                                            )}
                                            {doctor?.acceptsOffline && (
                                                <button
                                                    onClick={() => setSelectedMode('offline')}
                                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMode === 'offline'
                                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <MapPin className="w-5 h-5" />
                                                    <span className="font-semibold">In-Person Visit</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 7-Day Date Picker */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-3">Select Date (Next 7 Days)</label>
                                        <div className="grid grid-cols-7 gap-2">
                                            {Array.from({ length: 7 }, (_, i) => {
                                                const date = new Date()
                                                date.setDate(date.getDate() + i)
                                                const dateStr = date.toISOString().split('T')[0]
                                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                                                const dayNum = date.getDate()
                                                const monthName = date.toLocaleDateString('en-US', { month: 'short' })
                                                const isToday = i === 0
                                                const isTomorrow = i === 1
                                                const isSelected = selectedSlot?.datetime === dateStr

                                                // Calculate queue position for this date
                                                const queueForDate = availableSlots.filter(s => s.datetime === dateStr)
                                                const queuePosition = queueForDate.length > 0 ? parseInt(queueForDate[0].time) : 1

                                                return (
                                                    <button
                                                        key={dateStr}
                                                        onClick={() => setSelectedSlot({
                                                            time: String(queuePosition),
                                                            datetime: dateStr,
                                                            display: `${dayName}, ${monthName} ${dayNum}`
                                                        })}
                                                        className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected
                                                            ? 'border-primary-600 bg-primary-50 shadow-sm'
                                                            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="text-xs font-medium text-slate-500">
                                                            {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayName}
                                                        </div>
                                                        <div className="text-lg font-bold text-slate-900">{dayNum}</div>
                                                        <div className="text-xs text-slate-500">{monthName}</div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Queue Info Card */}
                                    {selectedSlot && (
                                        <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-xl p-4 border border-primary-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-primary-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-600">Queue-Based Appointment</p>
                                                    <p className="text-lg font-bold text-slate-900">{selectedSlot.display}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">Your Token</p>
                                                    <p className="text-2xl font-bold text-primary-600">#{selectedSlot.time}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-primary-100 text-xs text-slate-600">
                                                * Actual consultation time depends on queue progress. You will be notified when your turn approaches.
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 2: Basic Info */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                value={basicInfo.fullName}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, fullName: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Age *</label>
                                            <input
                                                type="number"
                                                value={basicInfo.age}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, age: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                                placeholder="Your age"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Gender *</label>
                                            <select
                                                value={basicInfo.gender}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
                                            <select
                                                value={basicInfo.bloodGroup}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, bloodGroup: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            >
                                                <option value="">Select or Don't Know</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="unknown">Don't Know</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Allergies */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Known Allergies</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newAllergy}
                                                onChange={(e) => setNewAllergy(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                                                placeholder="Add allergy (press Enter)"
                                            />
                                            <button onClick={addAllergy} className="px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {basicInfo.allergies.map((allergy, i) => (
                                                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm flex items-center gap-1">
                                                    {allergy}
                                                    <button onClick={() => setBasicInfo({ ...basicInfo, allergies: basicInfo.allergies.filter((_, idx) => idx !== i) })}>
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {basicInfo.allergies.length === 0 && <span className="text-sm text-slate-400">No allergies added</span>}
                                        </div>
                                    </div>

                                    {/* Current Medications */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Current Medications</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newMedication}
                                                onChange={(e) => setNewMedication(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                                                placeholder="Add medication (press Enter)"
                                            />
                                            <button onClick={addMedication} className="px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {basicInfo.currentMedications.map((med, i) => (
                                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                                                    {med}
                                                    <button onClick={() => setBasicInfo({ ...basicInfo, currentMedications: basicInfo.currentMedications.filter((_, idx) => idx !== i) })}>
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {basicInfo.currentMedications.length === 0 && <span className="text-sm text-slate-400">No medications added</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Chief Complaint */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 mb-6">What brings you in today?</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Describe your symptoms *</label>
                                            <textarea
                                                value={chiefComplaint.description}
                                                onChange={(e) => setChiefComplaint({ ...chiefComplaint, description: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-32 resize-none"
                                                placeholder="Please describe your main symptoms or concerns in detail..."
                                                maxLength={500}
                                            />
                                            <p className="text-xs text-slate-400 text-right mt-1">{chiefComplaint.description.length}/500</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">How long have you had these symptoms? *</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={chiefComplaint.duration}
                                                        onChange={(e) => setChiefComplaint({ ...chiefComplaint, duration: e.target.value })}
                                                        className="w-24 px-4 py-3 border border-slate-200 rounded-xl"
                                                        placeholder="0"
                                                    />
                                                    <select
                                                        value={chiefComplaint.durationUnit}
                                                        onChange={(e) => setChiefComplaint({ ...chiefComplaint, durationUnit: e.target.value })}
                                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl"
                                                    >
                                                        <option value="days">Days</option>
                                                        <option value="weeks">Weeks</option>
                                                        <option value="months">Months</option>
                                                        <option value="years">Years</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Pain/Discomfort Severity (1-10)</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        value={chiefComplaint.severity}
                                                        onChange={(e) => setChiefComplaint({ ...chiefComplaint, severity: parseInt(e.target.value) })}
                                                        className="flex-1"
                                                    />
                                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${chiefComplaint.severity <= 3 ? 'bg-green-100 text-green-700' :
                                                        chiefComplaint.severity <= 6 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {chiefComplaint.severity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Previous treatment for this issue?</label>
                                            <textarea
                                                value={chiefComplaint.previousTreatment}
                                                onChange={(e) => setChiefComplaint({ ...chiefComplaint, previousTreatment: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-24 resize-none"
                                                placeholder="Have you taken any medication or visited another doctor for this? (Optional)"
                                            />
                                        </div>

                                        {/* Medical History */}
                                        <div className="pt-6 border-t border-slate-100">
                                            <h3 className="font-bold text-slate-800 mb-4">Medical History</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Do you have any of these conditions?</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {conditionOptions.map((condition) => (
                                                        <button
                                                            key={condition}
                                                            onClick={() => {
                                                                if (medicalHistory.conditions.includes(condition)) {
                                                                    setMedicalHistory({ ...medicalHistory, conditions: medicalHistory.conditions.filter(c => c !== condition) })
                                                                } else {
                                                                    setMedicalHistory({ ...medicalHistory, conditions: [...medicalHistory.conditions, condition] })
                                                                }
                                                            }}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${medicalHistory.conditions.includes(condition)
                                                                ? 'bg-primary-600 text-white'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            {condition}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Document Upload */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Medical Documents</h2>
                                    <p className="text-slate-500 mb-6">Upload any relevant reports, scans, or prescriptions (PDF only, max 50MB total)</p>

                                    {/* Upload Area */}
                                    <label className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <p className="font-semibold text-slate-700">Click to upload or drag and drop</p>
                                        <p className="text-sm text-slate-500 mt-1">PDF files only, up to 10 files</p>
                                    </label>

                                    {/* Uploaded Documents */}
                                    {documents.length > 0 && (
                                        <div className="mt-6 space-y-4">
                                            <h3 className="font-semibold text-slate-800">Uploaded Documents ({documents.length})</h3>
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="w-8 h-8 text-red-500" />
                                                            <div>
                                                                <p className="font-medium text-slate-800">{doc.name}</p>
                                                                <p className="text-xs text-slate-500">{(doc.file.size / 1024).toFixed(1)} KB</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => removeDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>


                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Document Type</label>
                                                            <select
                                                                value={doc.type}
                                                                onChange={(e) => updateDocument(doc.id, { type: e.target.value })}
                                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                                                            >
                                                                <option value="">Select type</option>
                                                                {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Upload Date</label>
                                                            <div className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
                                                                {doc.uploadDate} <span className="text-xs">(auto-detected from PDF)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skip option */}
                                    <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="noDocuments"
                                            checked={documents.length === 0}
                                            onChange={() => setDocuments([])}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <label htmlFor="noDocuments" className="text-sm text-slate-600">
                                            I don't have any medical documents to upload
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Confirm */}
                            {step === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 mb-6">Review & Confirm</h2>

                                    {/* Appointment Summary */}
                                    <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-2xl p-6 mb-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                                                <Stethoscope className="w-8 h-8 text-primary-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{doctor?.name || 'Doctor'}</h3>
                                                <p className="text-slate-600">{doctor?.specialization || 'Specialist'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>{selectedSlot?.display || 'Not selected'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedMode === 'online' ? <Video className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                                                <span>{selectedMode === 'online' ? 'Online Consultation' : 'In-Person Visit'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Summary */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                            <span className="text-slate-600">Patient Name</span>
                                            <span className="font-semibold">{basicInfo.fullName}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                            <span className="text-slate-600">Chief Complaint</span>
                                            <span className="font-semibold text-right max-w-xs truncate">{chiefComplaint.description.slice(0, 50)}...</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                            <span className="text-slate-600">Documents Uploaded</span>
                                            <span className="font-semibold">{documents.length} files</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                            <span className="text-slate-600">Consultation Fee</span>
                                            <span className="font-bold text-lg text-primary-600">₹{doctor?.consultationFee || 500}</span>
                                        </div>
                                    </div>

                                    {/* Consents */}
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={consents.accuracy}
                                                onChange={(e) => setConsents({ ...consents, accuracy: e.target.checked })}
                                                className="w-4 h-4 mt-0.5 text-primary-600 rounded"
                                            />
                                            <span className="text-sm text-slate-600">I confirm that all the information provided is accurate to the best of my knowledge.</span>
                                        </label>
                                        <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={consents.aiAnalysis}
                                                onChange={(e) => setConsents({ ...consents, aiAnalysis: e.target.checked })}
                                                className="w-4 h-4 mt-0.5 text-primary-600 rounded"
                                            />
                                            <span className="text-sm text-slate-600">I consent to AI-powered analysis of my medical data to assist the doctor.</span>
                                        </label>
                                        <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={consents.cancellation}
                                                onChange={(e) => setConsents({ ...consents, cancellation: e.target.checked })}
                                                className="w-4 h-4 mt-0.5 text-primary-600 rounded"
                                            />
                                            <span className="text-sm text-slate-600">I understand the cancellation policy and agree to attend on time.</span>
                                        </label>
                                    </div>

                                    {/* Warning for no-show */}
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <strong>Important:</strong> Missing appointments without notice may affect your ability to book future appointments.
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="p-6 border-t border-slate-100">
                            {/* Error Display */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-red-700">
                                        <strong>Error:</strong> {error}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button
                                    onClick={handleBack}
                                    disabled={step === 1 || submitting}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1 || submitting
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>

                                {step < 5 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={step === 1 && !selectedSlot}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!consents.accuracy || !consents.aiAnalysis || !consents.cancellation || submitting}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Booking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Confirm Booking
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
