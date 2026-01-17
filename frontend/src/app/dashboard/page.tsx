'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, Activity, ArrowUpRight, Plus, Search, FileText } from 'lucide-react'
import AnimatedCounter from '@/components/AnimatedCounter'
import Link from 'next/link'

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export default function DashboardOverview() {
    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2"
                    >
                        Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">Dr. Sarah</span>
                    </motion.h1>
                    <p className="text-xl text-slate-500 font-medium">Here's your clinical overview for today.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-700 shadow-sm"
                        />
                    </div>
                    <Link href="/dashboard/patients/add" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        <span>New Patient</span>
                    </Link>
                </motion.div>
            </header>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                {[
                    { label: 'Total Patients', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Appointments', value: '42', change: 'Today', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { label: 'Analyses Run', value: '891', change: '+24%', icon: Activity, color: 'text-teal-500', bg: 'bg-teal-50' },
                    { label: 'Reports Gen.', value: '356', change: '+8%', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                {stat.change} <ArrowUpRight className="w-3 h-3" />
                            </span>
                        </div>
                        <h3 className="text-4xl font-extrabold text-slate-900 mb-2">{stat.value}</h3>
                        <p className="text-slate-500 font-semibold">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Patients */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Recent Patients</h2>
                    <Link href="/dashboard/patients" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-2 group">
                        View All <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="divide-y divide-slate-50">
                    {[
                        { name: 'James Wilson', id: '#PT-2024-001', status: 'Analysis Ready', date: '2 mins ago', img: '/images/hero-doctor.png' },
                        { name: 'Sarah Thompson', id: '#PT-2024-002', status: 'Pending Review', date: '15 mins ago', img: '/images/hero-doctor.png' },
                        { name: 'Robert Chen', id: '#PT-2024-003', status: 'Completed', date: '1 hour ago', img: '/images/hero-doctor.png' },
                    ].map((patient, i) => (
                        <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {patient.name[0]}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{patient.name}</h4>
                                    <p className="text-sm text-slate-500 font-medium">{patient.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${patient.status === 'Analysis Ready' ? 'bg-green-100 text-green-700' :
                                        patient.status === 'Pending Review' ? 'bg-orange-100 text-orange-700' :
                                            'bg-slate-100 text-slate-700'
                                    }`}>
                                    {patient.status}
                                </span>
                                <span className="text-slate-400 font-medium">{patient.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
