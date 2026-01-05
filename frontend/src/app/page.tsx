import Link from 'next/link'
import { Activity, Clock, FileText, ArrowRight, Stethoscope, Users } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="container-medical py-6">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-8 w-8 text-primary-500" />
                        <span className="text-xl font-semibold text-gray-900">MedVision AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Doctor Portal
                        </Link>
                        <Link href="/patient-portal" className="btn-primary flex items-center gap-2">
                            Patient Portal
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="container-medical py-28 md:py-32">
                <div className="max-w-3xl">
                    <p className="text-primary-500 font-medium mb-6">Powered by Gemini 3</p>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-8">
                        The Clinical Time Machine
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                        Transform 10 years of patient history into actionable insights in seconds.
                        The first medical AI that leverages 2 million tokens of context to see
                        the complete health journey.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                            <Stethoscope className="h-5 w-5" />
                            I'm a Doctor
                        </Link>
                        <Link href="/patient-portal" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                            <Users className="h-5 w-5" />
                            I'm a Patient
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container-medical py-28">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
                    Three Pillars of Clinical Intelligence
                </h2>
                <div className="grid md:grid-cols-3 gap-10">
                    {/* Feature 1 */}
                    <div className="card p-10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                            <Clock className="h-7 w-7 text-primary-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            Total Recall
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Load a patient's complete medical history into a single AI context.
                            Every scan, every lab, every clinical note - instantly accessible.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="card p-10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                            <Activity className="h-7 w-7 text-primary-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            Change Detection
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Automatically compare current status against any historical state.
                            Detect subtle progressions that manual review misses.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="card p-10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                            <FileText className="h-7 w-7 text-primary-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            Predictive Trajectory
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Forecast likely disease progression based on similar patient outcomes.
                            Data-driven treatment selection with transparent reasoning.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-primary-500 py-24 mb-12">
                <div className="container-medical">
                    <div className="grid md:grid-cols-3 gap-12 text-center text-white">
                        <div>
                            <p className="text-6xl font-bold mb-3">2M</p>
                            <p className="text-primary-100 text-xl">Tokens of Context</p>
                        </div>
                        <div>
                            <p className="text-6xl font-bold mb-3">8 sec</p>
                            <p className="text-primary-100 text-xl">vs 45 min Chart Review</p>
                        </div>
                        <div>
                            <p className="text-6xl font-bold mb-3">10+ yrs</p>
                            <p className="text-primary-100 text-xl">of Patient History</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="container-medical py-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                    How It Works
                </h2>
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                            1
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Load Patient Data
                            </h3>
                            <p className="text-gray-600">
                                Upload or connect to patient records. Our system ingests scans, labs,
                                clinical notes, and treatment history.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                            2
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Gemini 3 Analysis
                            </h3>
                            <p className="text-gray-600">
                                The entire history loads into Gemini 3's 2 million token context.
                                Pattern recognition across years of data happens in seconds.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                            3
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Actionable Insights
                            </h3>
                            <p className="text-gray-600">
                                Receive clinical summaries, trend analysis, and trajectory predictions.
                                All with transparent AI reasoning and cited evidence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8">
                <div className="container-medical text-center text-gray-500 text-sm">
                    <p>MedVision AI - Clinical Time Machine</p>
                    <p className="mt-1">Built for the Gemini 3 Global Hackathon</p>
                </div>
            </footer>
        </div>
    )
}
