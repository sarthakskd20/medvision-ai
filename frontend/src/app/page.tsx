'use client'

import { useState, useEffect, useRef } from 'react'
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
    ChevronRight,
    Play,
    ScanEye
} from 'lucide-react'
import AnimatedCounter from '@/components/AnimatedCounter'
import DemoVideoModal from '@/components/DemoVideoModal'
import EntranceLoader from '@/components/EntranceLoader'
import ScrollSequence from '@/components/ScrollSequence'
import { motion, AnimatePresence } from 'framer-motion'

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
        image: '/images/hero-slide-1.png',
        alt: 'Medical team collaboration',
        stat: '50K+',
        label: 'Doctors Connected',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
    },
    {
        image: '/images/hero-slide-2.png',
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
        }, 5000)

        return () => clearInterval(timer)
    }, [])

    const slide = carouselSlides[currentSlide]

    return (
        <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-teal-500/10 blur-3xl z-0" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 z-10"
                >
                    <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="object-cover rounded-3xl"
                        priority
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent rounded-3xl" />
                </motion.div>
            </AnimatePresence>

            {/* Floating Info Card */}
            <motion.div
                key={`card-${currentSlide}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute bottom-8 left-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${slide.bgColor} flex items-center justify-center`}>
                        <LineChart className={`h-6 w-6 ${slide.iconColor}`} />
                    </div>
                    <div>
                        <motion.p
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-2xl font-bold text-slate-900"
                        >
                            {slide.stat}
                        </motion.p>
                        <p className="text-sm text-slate-500 font-medium">{slide.label}</p>
                    </div>
                </div>
            </motion.div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                {carouselSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

// Stats data with numeric values for animation
const statsData = [
    { value: '2M+', numericValue: 2, suffix: 'M+', label: 'Token Context Window', icon: Brain },
    { value: '50+', numericValue: 50, suffix: '+', label: 'Countries Supported', icon: Users },
    { value: '<30s', numericValue: 30, prefix: '<', suffix: 's', label: 'Analysis Time', icon: Clock },
    { value: '10yrs', numericValue: 10, suffix: 'yrs', label: 'Patient History Depth', icon: LineChart },
]

// Features data for Three Pillars
const featuresData = [
    {
        icon: Clock,
        title: 'Total Recall',
        description: 'Load a patient\'s complete medical history into a single AI context. Every scan, every lab, every note.',
        color: 'from-blue-500 to-blue-600',
        glowColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
        icon: LineChart,
        title: 'Change Detection',
        description: 'Automatically compare current status against any historical state. Detect subtle progressions that matter.',
        color: 'from-primary-500 to-teal-500',
        glowColor: 'rgba(0, 153, 153, 0.3)'
    },
    {
        icon: Brain,
        title: 'Predictive Trajectory',
        description: 'Forecast disease progression based on similar patient outcomes. Data-driven treatment planning.',
        color: 'from-purple-500 to-purple-600',
        glowColor: 'rgba(147, 51, 234, 0.3)'
    },
]

export default function HomePage() {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
    const [showLoader, setShowLoader] = useState(true)
    const [parallaxOffset, setParallaxOffset] = useState(0)
    const statsRef = useRef<HTMLDivElement>(null)
    const featuresRef = useRef<HTMLDivElement>(null)
    const [statsInView, setStatsInView] = useState(false)
    const [featuresInView, setFeaturesInView] = useState(false)
    const [doctorsInView, setDoctorsInView] = useState(false)
    const [patientsInView, setPatientsInView] = useState(false)

    // Refs for scroll animations
    const doctorsRef = useRef<HTMLElement>(null)
    const patientsRef = useRef<HTMLElement>(null)

    // Handle loader completion
    const handleLoaderComplete = () => {
        setShowLoader(false)
    }

    useEffect(() => {
        const handleScroll = () => {
            setParallaxOffset(window.scrollY * 0.3)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === statsRef.current && entry.isIntersecting) {
                        setStatsInView(true)
                    }
                    if (entry.target === featuresRef.current && entry.isIntersecting) {
                        setFeaturesInView(true)
                    }
                    if (entry.target === doctorsRef.current && entry.isIntersecting) {
                        setDoctorsInView(true)
                    }
                    if (entry.target === patientsRef.current && entry.isIntersecting) {
                        setPatientsInView(true)
                    }
                })
            },
            { threshold: 0.2 }
        )

        if (statsRef.current) observer.observe(statsRef.current)
        if (featuresRef.current) observer.observe(featuresRef.current)
        if (doctorsRef.current) observer.observe(doctorsRef.current)
        if (patientsRef.current) observer.observe(patientsRef.current)

        return () => observer.disconnect()
    }, [])

    return (
        <main className="min-h-screen bg-slate-50 relative">
            {/* Entrance Animation */}
            {showLoader && <EntranceLoader onComplete={handleLoaderComplete} />}

            {/* Demo Modal */}
            <DemoVideoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${!showLoader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm" />
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/images/medvision-logo.png"
                            alt="MedVision AI"
                            width={42}
                            height={42}
                            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="text-xl font-bold text-slate-900">MedVision AI</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#for-doctors" className="nav-link">For Doctors</a>
                        <a href="#for-patients" className="nav-link">For Patients</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/auth/login" className="px-4 py-2 text-slate-700 hover:text-slate-900 font-semibold transition-colors">
                            Sign In
                        </Link>
                        <Link href="/auth/register/doctor" className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fadeInLeft">
                            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                                Clinical Intelligence,
                                <span className="bg-gradient-to-r from-primary-500 to-teal-500 bg-clip-text text-transparent"> Redefined</span>
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-lg font-medium">
                                Transform patient care with AI that understands the complete medical journey. Analyze 10 years of history in seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/auth/register/doctor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-full hover:shadow-xl hover:shadow-primary-500/30 transition-all group hover:-translate-y-1">
                                    Start Free Trial
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button
                                    onClick={() => setIsDemoModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                                >
                                    <Play className="h-5 w-5 text-primary-500" />
                                    Watch Demo
                                </button>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-semibold text-slate-700">HIPAA Compliant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-semibold text-slate-700">Verified Doctors Only</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Carousel */}
                        <HeroCarousel />
                    </div>
                </div>
            </section >

            {/* Stats Section with Animated Counters */}
            < section ref={statsRef} className="py-20 bg-slate-50" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {statsData.map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`text-center transition-all duration-700 ${statsInView
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-slate-200/50 mb-4">
                                    <stat.icon className="h-8 w-8 text-primary-500" />
                                </div>
                                <p className="stat-number mb-2">
                                    <AnimatedCounter value={stat.value} />
                                </p>
                                <p className="text-slate-600 font-semibold">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Features Section - Three Pillars */}
            <section id="features" ref={featuresRef} className="py-28 relative overflow-hidden">
                {/* Background Morphing Blobs */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[100px] mix-blend-multiply"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -60, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] mix-blend-multiply"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className={`text-center mb-20 transition-all duration-700 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                            Three Pillars of <span className="gradient-heading">Clinical Intelligence</span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                            AI-powered insights that augment your clinical expertise
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {featuresData.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`feature-card group transition-all duration-700 ${featuresInView
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-12'
                                    }`}
                                style={{
                                    transitionDelay: `${index * 200}ms`,
                                }}
                            >
                                {/* Glow effect on hover */}
                                <div
                                    className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                                    style={{
                                        boxShadow: `0 0 60px ${feature.glowColor}`,
                                    }}
                                />

                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 gradient-heading">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scroll Sequence - Patient Journey */}
            <ScrollSequence />

            {/* For Doctors Section */}
            <section
                id="for-doctors"
                ref={doctorsRef}
                className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative"
            >
                {/* Parallax Background */}
                <div
                    className="absolute inset-0 z-0 opacity-20"
                    style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/30 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className={`${doctorsInView ? 'animate-slideInLeft' : 'opacity-0'}`}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium mb-6">
                                <Stethoscope className="h-4 w-4" />
                                For Healthcare Providers
                            </div>
                            <h2 className="text-4xl font-bold mb-6 text-white">
                                Join the Network of Verified Physicians
                            </h2>

                            <ul className="space-y-5 mb-10">
                                {[
                                    'AI-verified credentials and documents',
                                    'Connect with specialists worldwide',
                                    'Share case studies and research',
                                    'Access comprehensive patient analytics',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-4">
                                        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-slate-200 text-lg font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/auth/register/doctor" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:shadow-xl transition-all group hover:-translate-y-1">
                                Apply as Doctor
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div
                            className="relative"
                            style={{ transform: `translateY(${-parallaxOffset * 0.1}px)` }}
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
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
            <section
                id="for-patients"
                ref={patientsRef}
                className="py-24 overflow-hidden relative"
            >
                <div
                    className="absolute inset-0 z-0 opacity-10"
                    style={{ transform: `translateY(${parallaxOffset * 0.1}px)` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className={`${patientsInView ? 'animate-slideInRight' : 'opacity-0'} max-w-3xl mx-auto text-center`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
                            <Users className="h-4 w-4" />
                            For Patients
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">
                            Exclaim: Understand Your <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Health Journey</span>
                        </h2>

                        <p className="text-xl text-slate-600 mb-10 font-medium">
                            Access AI-interpreted reports, track your progress, and communicate securely with your healthcare team.
                        </p>

                        <div className="grid sm:grid-cols-3 gap-6 mb-12">
                            {[
                                { icon: LineChart, label: 'Track Progress', color: 'bg-blue-500' },
                                { icon: Shield, label: 'Secure Records', color: 'bg-green-500' },
                                { icon: Brain, label: 'AI Insights', color: 'bg-purple-500' },
                            ].map((item) => (
                                <div key={item.label} className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                    <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <item.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <p className="font-bold text-slate-900 text-lg">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <Link href="/auth/register/patient" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full hover:shadow-xl hover:shadow-blue-500/30 transition-all group hover:-translate-y-1">
                            Create Patient Account
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-28 bg-gradient-to-r from-primary-500 to-teal-500">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
                        Ready to Transform Patient Care?
                    </h2>
                    <p className="text-xl text-white/80 mb-12 font-medium">
                        Join thousands of healthcare professionals using AI-powered diagnostics
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register/doctor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-full hover:shadow-xl transition-all hover:-translate-y-1">
                            Get Started Free
                        </Link>
                        <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-900 text-slate-400">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl p-1.5">
                                <Image
                                    src="/images/medvision-logo.png"
                                    alt="MedVision AI"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold text-white">MedVision AI</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm font-medium">
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
                            2026 MedVision AI. All rights reserved. Powered by Google Gemini.
                        </p>
                    </div>
                </div>
            </footer>
        </main >
    )
}
