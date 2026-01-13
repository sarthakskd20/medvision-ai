'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Search, User, ChevronRight, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function PatientsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: patients, isLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: api.getPatients,
    })

    const filteredPatients = patients?.filter((patient: any) =>
        patient.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="btn btn-ghost p-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="font-semibold text-slate-900">All Patients</h1>
                            <p className="text-sm text-slate-500">{patients?.length || 0} total patients</p>
                        </div>
                    </div>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">
                        <UserPlus className="h-4 w-4" />
                        Add Patient
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-6">
                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patients by name..."
                        className="input-field pl-10"
                    />
                </div>

                {/* Patients List */}
                <div className="card">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="p-12 text-center">
                            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="font-medium text-slate-900 mb-1">No patients found</h3>
                            <p className="text-sm text-slate-500 mb-4">Add your first patient to begin AI analysis</p>
                            <Link href="/dashboard/patients/new" className="btn btn-primary">
                                Add Patient
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {filteredPatients.map((patient: any) => (
                                <li key={patient.id}>
                                    <Link
                                        href={`/dashboard/patient/${patient.id}`}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                                <User className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{patient.profile?.name}</p>
                                                <p className="text-sm text-slate-500">{patient.profile?.diagnosis}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {patient.profile?.diagnosed_date}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
