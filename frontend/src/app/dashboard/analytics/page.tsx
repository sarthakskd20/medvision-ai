'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, TrendingUp, Users, Activity, Clock } from 'lucide-react'

export default function AnalyticsPage() {
    // Sample analytics data
    const stats = [
        { label: 'Total Analyses', value: '147', change: '+12%', icon: Activity },
        { label: 'Patients Treated', value: '89', change: '+8%', icon: Users },
        { label: 'Avg. Analysis Time', value: '2.4 min', change: '-15%', icon: Clock },
        { label: 'Accuracy Rate', value: '94.2%', change: '+3%', icon: TrendingUp },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-ghost p-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-slate-900">Analytics</h1>
                        <p className="text-sm text-slate-500">Your AI analysis performance</p>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                                    <stat.icon className="h-5 w-5 text-primary-600" />
                                </div>
                                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Chart placeholder */}
                <div className="card p-6">
                    <h2 className="font-semibold text-slate-900 mb-4">Analysis Trend (Last 30 Days)</h2>
                    <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">Chart visualization coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
