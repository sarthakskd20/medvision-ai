'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import {
    Activity,
    ArrowRight,
    Shield,
    Brain,
    LineChart,
    Clock,
    Users,
    Stethoscope,
    CheckCircle2,
    ChevronRight
} from 'lucide-react'

// Carousel slides data
const carouselSlides = [
    {
        image: '/images/hero-doctor.png',
        alt: 'Doctor using AI diagnostics',
        stat: '94.2%',
        label: 'Diagnostic Accuracy',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
    },
    {
        image: '/images/doctors-collab.png',
        alt: 'Medical team collaboration',
        stat: '50K+',
        label: 'Doctors Connected',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
    },
    {
        image: '/images/hero-doctor.png',
        alt: 'AI-powered analysis',
        stat: '<30s',
        label: 'Analysis Time',
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600'
    }
]

function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
        }, 4000) // Auto-swipe every 4 seconds

        return () => clearInterval(timer)
    }, [])

    const slide = carouselSlides[currentSlide]

    return (
        <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-teal-500/20 rounded-3xl blur-3xl" />

            {/* Image container with transition */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10">
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {carouselSlides.map((s, index) => (
                        <div key={index} className="min-w-full">
                            <Image
                                src={s.image}
                                alt={s.alt}
                                width={600}
                                height={600}
                                className="w-full h-auto"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating stats card with animation */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-slate-100 transition-all duration-500">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${slide.bgColor} flex items-center justify-center transition-colors duration-500`}>
                        <LineChart className={`h-6 w-6 ${slide.iconColor} transition-colors duration-500`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 transition-all duration-300">{slide.stat}</p>
                        <p className="text-sm text-slate-500 transition-all duration-300">{slide.label}</p>
                    </div>
                </div>
            </div>

            {/* Carousel indicators */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                {carouselSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-primary-500 w-6'
                                : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-slate-900">MedVision AI</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                            <a href="#for-doctors" className="text-slate-600 hover:text-slate-900 transition-colors">For Doctors</a>
                            <a href="#for-patients" className="text-slate-600 hover:text-slate-900 transition-colors">For Patients</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/auth/login" className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link href="/auth/register/doctor" className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                                Clinical Intelligence,
                                <span className="bg-gradient-to-r from-primary-500 to-teal-500 bg-clip-text text-transparent"> Redefined</span>
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-lg">
                                Transform patient care with AI that understands the complete medical journey. Analyze 10 years of history in seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/auth/register/doctor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-primary-500/30 transition-all group">
                                    Start Free Trial
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all">
                                    Watch Demo
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-500" />
                                    <span className="text-sm text-slate-600">HIPAA Compliant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span className="text-sm text-slate-600">Verified Doctors Only</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Carousel */}
                        <HeroCarousel />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '2M+', label: 'Token Context Window', icon: Brain },
                            { value: '50+', label: 'Countries Supported', icon: Users },
                            { value: '<30s', label: 'Analysis Time', icon: Clock },
                            { value: '10yrs', label: 'Patient History Depth', icon: LineChart },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm mb-4">
                                    <stat.icon className="h-7 w-7 text-primary-500" />
                                </div>
                                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                                <p className="text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            Three Pillars of Clinical Intelligence
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            AI-powered insights that augment your clinical expertise
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Clock,
                                title: 'Total Recall',
                                description: 'Load a patient\'s complete medical history into a single AI context. Every scan, every lab, every note.',
                                color: 'from-blue-500 to-blue-600'
                            },
                            {
                                icon: LineChart,
                                title: 'Change Detection',
                                description: 'Automatically compare current status against any historical state. Detect subtle progressions that matter.',
                                color: 'from-primary-500 to-teal-500'
                            },
                            {
                                icon: Brain,
                                title: 'Predictive Trajectory',
                                description: 'Forecast disease progression based on similar patient outcomes. Data-driven treatment planning.',
                                color: 'from-purple-500 to-purple-600'
                            },
                        ].map((feature) => (
                            <div key={feature.title} className="group p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Doctors Section */}
            <section id="for-doctors" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
                                <Stethoscope className="h-4 w-4" />
                                For Medical Professionals
                            </div>

                            <h2 className="text-4xl font-bold mb-6 text-white">
                                Join the Network of Verified Physicians
                            </h2>

                            <ul className="space-y-4 mb-8">
                                {[
                                    'AI-verified credentials and documents',
                                    'Connect with specialists worldwide',
                                    'Share case studies and research',
                                    'Access comprehensive patient analytics',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-slate-300">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/auth/register/doctor" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-full hover:shadow-xl transition-all group">
                                Apply as Doctor
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden">
                                <Image
                                    src="/images/doctors-collab.png"
                                    alt="Doctors collaborating with AI"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Patients Section */}
            <section id="for-patients" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
                            <Users className="h-4 w-4" />
                            For Patients
                        </div>

                        <h2 className="text-4xl font-bold text-slate-900 mb-6">
                            Understand Your Health Journey
                        </h2>

                        <p className="text-xl text-slate-600 mb-8">
                            Access AI-interpreted reports, track your progress, and communicate securely with your healthcare team.
                        </p>

                        <div className="grid sm:grid-cols-3 gap-6 mb-10">
                            {[
                                { icon: LineChart, label: 'Track Progress' },
                                { icon: Shield, label: 'Secure Records' },
                                { icon: Brain, label: 'AI Insights' },
                            ].map((item) => (
                                <div key={item.label} className="p-6 rounded-2xl bg-slate-50">
                                    <item.icon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                                    <p className="font-medium text-slate-900">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <Link href="/auth/register/patient" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-blue-500/30 transition-all group">
                            Create Patient Account
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary-500 to-teal-500">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Patient Care?
                    </h2>
                    <p className="text-xl text-white/80 mb-10">
                        Join thousands of healthcare professionals using AI-powered diagnostics
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register/doctor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:shadow-xl transition-all">
                            Get Started Free
                        </Link>
                        <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-900 text-slate-400">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">MedVision AI</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>

                    {/* Medical Disclaimer */}
                    <div className="border-t border-slate-800 pt-8">
                        <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                            <p className="text-sm text-slate-400 leading-relaxed text-center">
                                <strong className="text-slate-300">Medical Disclaimer:</strong> MedVision AI is designed as a clinical decision support tool to assist healthcare professionals. It does not replace professional medical judgment. All AI-generated insights should be reviewed by qualified physicians. Patients should always follow their doctor's advice and not rely solely on AI interpretations for medical decisions.
                            </p>
                        </div>

                        <p className="text-center text-sm">
                            © 2026 MedVision AI. All rights reserved. Powered by Google Gemini.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
