'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
    Activity,
    ArrowLeft,
    Clock,
    TrendingUp,
    FileText,
    MessageCircle,
    TestTube,
    Pill,
    Scan,
    ChevronDown,
    ChevronUp,
    Loader2
} from 'lucide-react'
import { api } from '@/lib/api'
import ReactMarkdown from 'react-markdown'

interface PageProps {
    params: { id: string }
}

export default function PatientDetailPage({ params }: PageProps) {
    const [activeTab, setActiveTab] = useState('timeline')
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

    const { data: patient, isLoading: patientLoading } = useQuery({
        queryKey: ['patient', params.id],
        queryFn: () => api.getPatient(params.id),
    })

    const { data: timeline, isLoading: timelineLoading } = useQuery({
        queryKey: ['timeline', params.id],
        queryFn: () => api.getPatientTimeline(params.id),
        enabled: !!patient,
    })

    const summaryMutation = useMutation({
        mutationFn: () => api.generateSummary(params.id),
    })

    if (patientLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        )
    }

    const typeIcons: Record<string, any> = {
        scan: Scan,
        lab: TestTube,
        treatment: Pill,
        note: FileText,
    }

    const typeColors: Record<string, string> = {
        scan: 'bg-blue-50 text-blue-600 border-blue-200',
        lab: 'bg-green-50 text-green-600 border-green-200',
        treatment: 'bg-purple-50 text-purple-600 border-purple-200',
        note: 'bg-gray-50 text-gray-600 border-gray-200',
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container-medical py-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {patient?.profile?.name}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {patient?.profile?.age}yo {patient?.profile?.gender} | {patient?.profile?.diagnosis}
                            </p>
                            <div className="flex gap-2 mt-3">
                                {patient?.profile?.genetic_markers?.map((marker: string) => (
                                    <span
                                        key={marker}
                                        className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 font-medium"
                                    >
                                        {marker}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => summaryMutation.mutate()}
                            className="btn-primary flex items-center gap-2"
                            disabled={summaryMutation.isPending}
                        >
                            {summaryMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <MessageCircle className="h-4 w-4" />
                            )}
                            Generate AI Summary
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container-medical">
                    <div className="flex gap-1 border-t border-gray-100 pt-4 -mb-px">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Clock className="inline h-4 w-4 mr-2" />
                            Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('predict')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'predict'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <TrendingUp className="inline h-4 w-4 mr-2" />
                            Predict Trajectory
                        </button>
                        <button
                            onClick={() => setActiveTab('labs')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'labs'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <TestTube className="inline h-4 w-4 mr-2" />
                            Lab Trends
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container-medical py-8">
                <div className="grid grid-cols-3 gap-8">
                    {/* Left Column - Timeline */}
                    <div className="col-span-2">
                        {/* AI Summary Card */}
                        {summaryMutation.data && (
                            <div className="card p-6 mb-6 border-l-4 border-l-primary-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary-500" />
                                        AI Clinical Summary
                                    </h2>
                                    <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 font-mono">
                                        {summaryMutation.data.context_tokens?.toLocaleString()} tokens
                                    </span>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <ReactMarkdown>{summaryMutation.data.summary}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        {activeTab === 'timeline' && (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="timeline-line" />

                                <div className="space-y-4">
                                    {timelineLoading ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Loading timeline...
                                        </div>
                                    ) : (
                                        timeline?.timeline?.map((event: any, index: number) => {
                                            const Icon = typeIcons[event.type] || FileText
                                            const colorClass = typeColors[event.type] || typeColors.note
                                            const isExpanded = expandedEvent === `${event.type}-${index}`

                                            return (
                                                <div key={`${event.type}-${index}`} className="relative pl-12">
                                                    {/* Timeline dot */}
                                                    <div className="absolute left-4 w-4 h-4 rounded-full bg-white border-2 border-primary-400 z-10" />

                                                    <div
                                                        className={`card p-4 cursor-pointer transition-all border ${colorClass}`}
                                                        onClick={() => setExpandedEvent(isExpanded ? null : `${event.type}-${index}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Icon className="h-5 w-5" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{event.title}</p>
                                                                    <p className="text-sm text-gray-500">{event.summary}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm text-gray-400">
                                                                    {new Date(event.date).toLocaleDateString()}
                                                                </span>
                                                                {isExpanded ? (
                                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                                <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 p-3 rounded">
                                                                    {JSON.stringify(event.data, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'predict' && (
                            <div className="card p-8 text-center">
                                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Predictive Trajectory
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Generate outcome predictions based on this patient's complete history
                                </p>
                                <button className="btn-primary">
                                    Generate Prediction
                                </button>
                            </div>
                        )}

                        {activeTab === 'labs' && (
                            <div className="card p-8 text-center">
                                <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Lab Trend Analysis
                                </h3>
                                <p className="text-gray-500">
                                    Visualize laboratory values over time
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6">
                        {/* Token Counter */}
                        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <h3 className="text-sm font-medium text-primary-100 mb-2">
                                Context Loaded
                            </h3>
                            <p className="text-4xl font-bold token-counter">
                                {timeline?.token_estimate?.toLocaleString() || '0'}
                            </p>
                            <p className="text-sm text-primary-100 mt-1">tokens</p>
                            <div className="mt-4 h-2 bg-primary-400 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((timeline?.token_estimate || 0) / 20000, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-primary-100 mt-2">
                                {((timeline?.token_estimate || 0) / 2000000 * 100).toFixed(3)}% of 2M capacity
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Patient Summary</h3>
                            <dl className="space-y-4">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Total Events</dt>
                                    <dd className="font-medium text-gray-900">{timeline?.total_events || 0}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Stage</dt>
                                    <dd className="font-medium text-gray-900">{patient?.profile?.stage?.split(',')[0]}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Diagnosed</dt>
                                    <dd className="font-medium text-gray-900">{patient?.profile?.diagnosed_date}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
