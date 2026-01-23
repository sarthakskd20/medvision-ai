'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    User, Clock, MapPin, Video, Phone,
    FileText, Activity, MessageSquare, Send,
    Brain, Pill, Calendar, CheckCircle,
    AlertTriangle, Download, Upload, Plus,
    Trash2, ChevronDown, ExternalLink, X
} from 'lucide-react'

interface PatientProfile {
    basic_info: {
        full_name: string
        age: number
        gender: string
        blood_group?: string
        allergies: string[]
        current_medications: string[]
    }
    chief_complaint: {
        description: string
        duration: string
        severity: number
    }
    medical_history: Array<{
        condition: string
        diagnosed_year?: number
        is_ongoing: boolean
    }>
    uploaded_documents: Array<{
        id: string
        name: string
        url: string
        document_type: string
    }>
}

interface Message {
    id: string
    content: string
    sender_type: 'doctor' | 'patient' | 'system'
    content_type: 'text' | 'image' | 'pdf'
    attachment_url?: string
    created_at: string
}

interface Medication {
    name: string
    dosage: string
    form: string
    frequency: string
    timing: string[]
    relation_to_food: string
    duration_value: number
    duration_unit: string
    instructions: string
}

interface AdvisedTest {
    test_name: string
    test_type: string
    urgency: string
    notes: string
}

type ConsultationStatus = 'waiting' | 'patient_arrived' | 'in_progress' | 'paused' | 'completed'

const STATUS_OPTIONS: { value: ConsultationStatus; label: string; color: string }[] = [
    { value: 'waiting', label: 'Waiting for Patient', color: 'bg-amber-500' },
    { value: 'patient_arrived', label: 'Patient Arrived', color: 'bg-blue-500' },
    { value: 'in_progress', label: 'Consultation In Progress', color: 'bg-green-500' },
    { value: 'paused', label: 'On Break', color: 'bg-orange-500' },
    { value: 'completed', label: 'Completed', color: 'bg-slate-500' }
]

export default function ConsultationPage() {
    const params = useParams()
    const router = useRouter()
    const appointmentId = params.id as string

    // State
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<ConsultationStatus>('waiting')
    const [consultation, setConsultation] = useState<any>(null)
    const [appointment, setAppointment] = useState<any>(null)
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null)

    // Messaging
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Doctor Notes
    const [observations, setObservations] = useState('')
    const [vitalSigns, setVitalSigns] = useState({
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        pulse_rate: '',
        temperature: '',
        spo2: '',
        weight: ''
    })
    const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('')

    // AI Analysis
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)
    const [runningAnalysis, setRunningAnalysis] = useState(false)
    const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: string, content: string }>>([])
    const [aiChatInput, setAiChatInput] = useState('')

    // Prescription
    const [medications, setMedications] = useState<Medication[]>([])
    const [advisedTests, setAdvisedTests] = useState<AdvisedTest[]>([])
    const [followUpDate, setFollowUpDate] = useState('')
    const [specialInstructions, setSpecialInstructions] = useState('')

    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'notes' | 'ai' | 'prescription'>('profile')
    const [showFinishModal, setShowFinishModal] = useState(false)

    useEffect(() => {
        fetchConsultationData()
    }, [appointmentId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchConsultationData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            // Start or get consultation
            const startRes = await fetch(`/api/consultation/start/${appointmentId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (startRes.ok) {
                const consultationData = await startRes.json()
                setConsultation(consultationData)
                setStatus(consultationData.status || 'waiting')

                // Get full consultation details
                const detailsRes = await fetch(`/api/consultation/${consultationData.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (detailsRes.ok) {
                    const details = await detailsRes.json()
                    setAppointment(details.appointment)
                    setPatientProfile(details.patient_profile)
                    if (details.doctor_notes) {
                        setObservations(details.doctor_notes.observations || '')
                        setProvisionalDiagnosis(details.doctor_notes.provisional_diagnosis || '')
                    }
                }

                // Get messages
                const msgRes = await fetch(`/api/consultation/${consultationData.id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (msgRes.ok) {
                    const msgData = await msgRes.json()
                    setMessages(msgData.messages || [])
                }
            }
        } catch (error) {
            console.error('Error fetching consultation:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus: ConsultationStatus) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/consultation/${consultation?.id}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setStatus(newStatus)
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !consultation) return

        try {
            setSendingMessage(true)
            const token = localStorage.getItem('token')

            const res = await fetch(`/api/consultation/${consultation.id}/messages?sender_type=doctor`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: newMessage,
                    content_type: 'text'
                })
            })

            if (res.ok) {
                const msg = await res.json()
                setMessages(prev => [...prev, msg])
                setNewMessage('')
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSendingMessage(false)
        }
    }

    const saveNotes = async () => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/consultation/${consultation?.id}/notes`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    observations,
                    vital_signs: {
                        blood_pressure_systolic: parseInt(vitalSigns.blood_pressure_systolic) || null,
                        blood_pressure_diastolic: parseInt(vitalSigns.blood_pressure_diastolic) || null,
                        pulse_rate: parseInt(vitalSigns.pulse_rate) || null,
                        temperature: parseFloat(vitalSigns.temperature) || null,
                        spo2: parseInt(vitalSigns.spo2) || null,
                        weight: parseFloat(vitalSigns.weight) || null
                    },
                    provisional_diagnosis: provisionalDiagnosis
                })
            })
        } catch (error) {
            console.error('Error saving notes:', error)
        }
    }

    const runAIAnalysis = async () => {
        try {
            setRunningAnalysis(true)
            // Simulated AI analysis for demo
            await new Promise(resolve => setTimeout(resolve, 2000))
            setAiAnalysisResult({
                executive_summary: 'Patient presents with symptoms consistent with mild respiratory infection. No concerning patterns detected in available medical history.',
                timeline_events: [],
                medication_suggestions: [
                    { drug: 'Amoxicillin 500mg', reason: 'Bacterial infection coverage', dosage_suggestion: 'TDS for 5 days' }
                ],
                test_suggestions: [
                    { test: 'Complete Blood Count', reason: 'Rule out secondary infection', urgency: 'routine' }
                ],
                confidence: 0.85
            })
        } catch (error) {
            console.error('Error running analysis:', error)
        } finally {
            setRunningAnalysis(false)
        }
    }

    const addMedication = () => {
        setMedications(prev => [...prev, {
            name: '',
            dosage: '',
            form: 'tablet',
            frequency: 'Once daily',
            timing: ['morning'],
            relation_to_food: 'after_food',
            duration_value: 5,
            duration_unit: 'days',
            instructions: ''
        }])
    }

    const removeMedication = (index: number) => {
        setMedications(prev => prev.filter((_, i) => i !== index))
    }

    const updateMedication = (index: number, field: keyof Medication, value: any) => {
        setMedications(prev => prev.map((med, i) =>
            i === index ? { ...med, [field]: value } : med
        ))
    }

    const finishConsultation = async () => {
        try {
            const token = localStorage.getItem('token')

            // Save prescription if any medications
            if (medications.length > 0) {
                await fetch(`/api/consultation/${consultation?.id}/prescription`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        medications,
                        advised_tests: advisedTests,
                        follow_up_date: followUpDate || null,
                        special_instructions: specialInstructions
                    })
                })
            }

            // Finish consultation
            await fetch(`/api/consultation/${consultation?.id}/finish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    final_diagnosis: provisionalDiagnosis,
                    treatment_summary: observations,
                    follow_up_required: !!followUpDate,
                    follow_up_date: followUpDate || null
                })
            })

            router.push('/dashboard/appointments')
        } catch (error) {
            console.error('Error finishing consultation:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading consultation...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Patient Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                            {patientProfile?.basic_info?.full_name?.charAt(0) || 'P'}
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {patientProfile?.basic_info?.full_name || 'Patient'}
                            </h1>
                            <div className="flex items-center gap-4 mt-1 text-slate-500 dark:text-slate-400">
                                <span>{patientProfile?.basic_info?.age || '?'} years</span>
                                <span>{patientProfile?.basic_info?.gender || 'Unknown'}</span>
                                <span>Token #{appointment?.queue_number || '?'}</span>
                                <span className="flex items-center gap-1">
                                    {appointment?.mode === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                    {appointment?.mode === 'online' ? 'Video Call' : 'In-Person'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Status Dropdown */}
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => updateStatus(e.target.value as ConsultationStatus)}
                                className="appearance-none bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 px-4 py-2 pr-10 rounded-lg font-semibold text-slate-900 dark:text-white"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>

                        {/* Google Meet Button */}
                        {appointment?.mode === 'online' && appointment?.meet_link && (
                            <a
                                href={appointment.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Video className="w-5 h-5" />
                                Join Google Meet
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}

                        {/* Finish Button */}
                        <button
                            onClick={() => setShowFinishModal(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Finish Consultation
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                {[
                    { id: 'profile', label: 'Patient Profile', icon: User },
                    { id: 'messages', label: 'Messages', icon: MessageSquare },
                    { id: 'notes', label: 'Notes & Vitals', icon: FileText },
                    { id: 'ai', label: 'AI Analysis', icon: Brain },
                    { id: 'prescription', label: 'Prescription', icon: Pill }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === tab.id
                                ? 'bg-teal-600 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-[#1a2230] border-2 border-slate-200 dark:border-slate-700 p-6 min-h-[500px]">
                {/* Patient Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Basic Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Blood Group</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{patientProfile?.basic_info?.blood_group || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Allergies</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {patientProfile?.basic_info?.allergies?.join(', ') || 'None reported'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Current Medications</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {patientProfile?.basic_info?.current_medications?.join(', ') || 'None'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-4">Chief Complaint</h3>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <p className="text-slate-900 dark:text-white font-medium">
                                    {patientProfile?.chief_complaint?.description || 'Not specified'}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span>Duration: {patientProfile?.chief_complaint?.duration || 'Unknown'}</span>
                                    <span>Severity: {patientProfile?.chief_complaint?.severity || '?'}/10</span>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Uploaded Documents</h3>
                            {patientProfile?.uploaded_documents?.length ? (
                                <div className="space-y-2">
                                    {patientProfile.uploaded_documents.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-teal-600" />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{doc.name}</p>
                                                    <p className="text-sm text-slate-500">{doc.document_type}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                download
                                                className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">No documents uploaded</p>
                            )}

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-4">Medical History</h3>
                            {patientProfile?.medical_history?.length ? (
                                <div className="space-y-2">
                                    {patientProfile.medical_history.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <span className="font-medium text-slate-900 dark:text-white">{item.condition}</span>
                                            <span className="text-sm text-slate-500">
                                                {item.diagnosed_year || 'Unknown'} {item.is_ongoing ? '(Ongoing)' : '(Resolved)'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">No medical history recorded</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="h-[450px] flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {messages.length === 0 ? (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                                    No messages yet. Start the conversation.
                                </p>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_type === 'doctor' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_type === 'doctor'
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.sender_type === 'doctor' ? 'text-teal-200' : 'text-slate-400'
                                                }`}>
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-teal-500 outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={sendingMessage || !newMessage.trim()}
                                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Vital Signs</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">BP Systolic (mmHg)</label>
                                    <input
                                        type="number"
                                        value={vitalSigns.blood_pressure_systolic}
                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, blood_pressure_systolic: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">BP Diastolic (mmHg)</label>
                                    <input
                                        type="number"
                                        value={vitalSigns.blood_pressure_diastolic}
                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Pulse (bpm)</label>
                                    <input
                                        type="number"
                                        value={vitalSigns.pulse_rate}
                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, pulse_rate: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">SpO2 (%)</label>
                                    <input
                                        type="number"
                                        value={vitalSigns.spo2}
                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, spo2: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Temperature (C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={vitalSigns.temperature}
                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={vitalSigns.weight}
                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Clinical Observations</h3>
                            <textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Enter your observations..."
                                rows={6}
                                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg resize-none"
                            />

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-4">Provisional Diagnosis</h3>
                            <input
                                type="text"
                                value={provisionalDiagnosis}
                                onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                                placeholder="Enter diagnosis..."
                                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                            />

                            <button
                                onClick={saveNotes}
                                className="mt-4 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                Save Notes
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Analysis Tab */}
                {activeTab === 'ai' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">MedVision AI Analysis</h3>
                                <p className="text-slate-500 dark:text-slate-400">Analyze patient documents, history, and notes</p>
                            </div>
                            <button
                                onClick={runAIAnalysis}
                                disabled={runningAnalysis}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                            >
                                <Brain className={`w-5 h-5 ${runningAnalysis ? 'animate-pulse' : ''}`} />
                                {runningAnalysis ? 'Analyzing...' : 'Run AI Analysis'}
                            </button>
                        </div>

                        {aiAnalysisResult ? (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Executive Summary</h4>
                                    <p className="text-slate-700 dark:text-slate-300">{aiAnalysisResult.executive_summary}</p>
                                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                                        Confidence: {(aiAnalysisResult.confidence * 100).toFixed(0)}%
                                    </p>
                                </div>

                                {/* Suggestions */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Medication Suggestions</h4>
                                        {aiAnalysisResult.medication_suggestions?.map((med: any, i: number) => (
                                            <div key={i} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-2">
                                                <p className="font-medium text-green-900 dark:text-green-200">{med.drug}</p>
                                                <p className="text-sm text-green-700 dark:text-green-400">{med.reason}</p>
                                                <p className="text-sm text-green-600 dark:text-green-500">Suggested: {med.dosage_suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Suggested Tests</h4>
                                        {aiAnalysisResult.test_suggestions?.map((test: any, i: number) => (
                                            <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-2">
                                                <p className="font-medium text-blue-900 dark:text-blue-200">{test.test}</p>
                                                <p className="text-sm text-blue-700 dark:text-blue-400">{test.reason}</p>
                                                <span className={`text-xs px-2 py-1 rounded ${test.urgency === 'urgent' ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-700'
                                                    }`}>
                                                    {test.urgency}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Click "Run AI Analysis" to analyze patient data</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Prescription Tab */}
                {activeTab === 'prescription' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prescription</h3>
                            <button
                                onClick={addMedication}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Medication
                            </button>
                        </div>

                        {/* Medications List */}
                        {medications.map((med, index) => (
                            <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">Medication #{index + 1}</h4>
                                    <button onClick={() => removeMedication(index)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Medicine Name"
                                        value={med.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dosage (e.g., 500mg)"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    />
                                    <select
                                        value={med.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                    >
                                        <option>Once daily</option>
                                        <option>Twice daily</option>
                                        <option>Three times daily</option>
                                        <option>Every 8 hours</option>
                                        <option>As needed</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Duration"
                                            value={med.duration_value}
                                            onChange={(e) => updateMedication(index, 'duration_value', parseInt(e.target.value))}
                                            className="w-20 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                        />
                                        <select
                                            value={med.duration_unit}
                                            onChange={(e) => updateMedication(index, 'duration_unit', e.target.value)}
                                            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                        >
                                            <option value="days">Days</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="months">Months</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {medications.length === 0 && (
                            <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                                No medications added yet
                            </p>
                        )}

                        {/* Follow-up */}
                        <div className="mt-6 grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Follow-up Date</label>
                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Special Instructions</label>
                                <input
                                    type="text"
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="Any special instructions..."
                                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Finish Consultation Modal */}
            {showFinishModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Finish Consultation?</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            This will complete the current consultation and move to the next patient in queue.
                            Make sure you have saved all notes and prescription.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFinishModal(false)}
                                className="flex-1 px-4 py-2 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={finishConsultation}
                                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                            >
                                Finish & Next Patient
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
