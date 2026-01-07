import Link from 'next/link'
import { Activity, Clock, FileText, ArrowRight, Stethoscope, Users, UserPlus, LogIn, AlertTriangle, Shield } from 'lucide-react'

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
                        <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                            <LogIn className="h-4 w-4" />
                            Login
                        </Link>
                        <Link href="/auth/register/doctor" className="btn-primary flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Register
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="container-medical py-20 md:py-24">
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
                </div>
            </section>

            {/* Register & Login Section */}
            <section className="container-medical py-12">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Register Section */}
                    <div className="card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <UserPlus className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Register</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Register as Doctor */}
                            <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <Stethoscope className="h-5 w-5 text-primary-500" />
                                    <h3 className="font-semibold text-gray-900">Register as Doctor</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Submit your credentials and medical documents for AI-powered verification.
                                </p>
                                <Link
                                    href="/auth/register/doctor"
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    Apply as Doctor
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                {/* Warning for Doctors */}
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-red-700">
                                            <p className="font-semibold mb-1">Warning</p>
                                            <p>
                                                Submitting fake credentials or impersonating a medical professional
                                                will result in <strong>permanent ban</strong> and may lead to
                                                <strong> legal action</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Register as Patient */}
                            <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <Users className="h-5 w-5 text-primary-500" />
                                    <h3 className="font-semibold text-gray-900">Create Patient Account</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Access your health reports and get AI-powered interpretations.
                                </p>
                                <Link
                                    href="/auth/register/patient"
                                    className="btn-secondary w-full flex items-center justify-center gap-2"
                                >
                                    Create Account
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Login Section */}
                    <div className="card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <LogIn className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Login as Doctor */}
                            <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <Stethoscope className="h-5 w-5 text-primary-500" />
                                    <h3 className="font-semibold text-gray-900">Login as Doctor</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Access your dashboard and manage patient records.
                                </p>
                                <Link
                                    href="/auth/login?role=doctor"
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    Doctor Login
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                {/* Verified Badge */}
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <p className="text-xs text-green-700">
                                            Only verified doctors can access the dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Login as Patient */}
                            <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <Users className="h-5 w-5 text-primary-500" />
                                    <h3 className="font-semibold text-gray-900">Login as Patient</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    View your health reports and AI interpretations.
                                </p>
                                <Link
                                    href="/auth/login?role=patient"
                                    className="btn-secondary w-full flex items-center justify-center gap-2"
                                >
                                    Patient Login
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container-medical py-20">
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
            <section className="bg-primary-500 py-24">
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
