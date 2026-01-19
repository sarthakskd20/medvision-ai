'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Activity, Clock, ArrowUpRight } from 'lucide-react'

export default function AnalyticsPage() {
    const [inView, setInView] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setInView(true)
            },
            { threshold: 0.1 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    const stats = [
        { label: 'Total Analyses', value: '147', change: '+12%', icon: Activity },
        { label: 'Patients Treated', value: '89', change: '+8%', icon: Users },
        { label: 'Avg. Analysis Time', value: '2.4 min', change: '-15%', icon: Clock },
        { label: 'Accuracy Rate', value: '94.2%', change: '+3%', icon: TrendingUp },
    ]

    // Simple bar chart data for visualization
    const chartData = [
        { month: 'Aug', value: 45 },
        { month: 'Sep', value: 62 },
        { month: 'Oct', value: 78 },
        { month: 'Nov', value: 89 },
        { month: 'Dec', value: 95 },
        { month: 'Jan', value: 112 },
    ]
    const maxValue = Math.max(...chartData.map(d => d.value))

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="min-h-[40vh] flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="w-16 h-0.5 bg-[#0d9488] mb-8" />

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Analytics
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl">
                        Track your clinical performance, patient outcomes, and AI analysis efficiency.
                    </p>
                </motion.div>
            </section>

            {/* Stats Grid */}
            <section ref={sectionRef}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Metrics</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">This month's statistics</p>
                    </div>
                    <div className="w-16 h-0.5 bg-[#0d9488]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="bg-white dark:bg-[#1a2230] border border-slate-200 dark:border-slate-700 p-6 hover:border-[#0d9488] transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-600 group-hover:border-[#0d9488] transition-colors">
                                    <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#0d9488] transition-colors" />
                                </div>
                                <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-[#0d9488]' : 'text-orange-500'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Chart Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis Trend</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Last 6 months</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a2230] border border-slate-200 dark:border-slate-700 p-8">
                    {/* Simple Bar Chart */}
                    <div className="flex items-end justify-between gap-4 h-64">
                        {chartData.map((item, i) => (
                            <motion.div
                                key={item.month}
                                className="flex-1 flex flex-col items-center gap-3"
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={inView ? { opacity: 1, scaleY: 1 } : {}}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                                style={{ transformOrigin: 'bottom' }}
                            >
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {item.value}
                                </span>
                                <div
                                    className="w-full bg-[#0d9488] transition-all hover:bg-teal-700 dark:hover:bg-[#12a801]"
                                    style={{ height: `${(item.value / maxValue) * 180}px` }}
                                />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    {item.month}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total analyses this period</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">481</p>
                        </div>
                        <div className="flex items-center gap-2 text-[#0d9488] font-semibold">
                            <TrendingUp className="w-5 h-5" />
                            <span>+24% from previous period</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#1a2230] border border-slate-200 dark:border-slate-700 p-8 hover:border-[#0d9488] transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Patient Reports</h3>
                            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#0d9488] transition-colors" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            View detailed analysis reports for individual patients.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">89</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">patients</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a2230] border border-slate-200 dark:border-slate-700 p-8 hover:border-[#0d9488] transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Data</h3>
                            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#0d9488] transition-colors" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Download analytics data in CSV or PDF format.
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="text-sm font-bold text-[#0d9488] hover:underline">CSV</button>
                            <button className="text-sm font-bold text-[#0d9488] hover:underline">PDF</button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-16" />
        </div>
    )
}
