'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Search,
    Filter,
    Star,
    Video,
    MapPin,
    Clock,
    ChevronRight,
    Stethoscope,
    X,
    Calendar,
    CheckCircle
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

// Mock data - will be replaced with API calls
const specializations = [
    'All Specializations',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Psychiatrist',
    'Gynecologist',
    'Oncologist',
    'Radiologist'
]

const mockDoctors = [
    {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialization: 'Cardiologist',
        hospital: 'Apollo Hospital, Mumbai',
        rating: 4.8,
        reviewCount: 156,
        experience: 12,
        acceptsOnline: true,
        acceptsOffline: true,
        consultationFee: 800,
        nextAvailable: 'Today, 4:00 PM',
        image: null
    },
    {
        id: '2',
        name: 'Dr. Rajesh Kumar',
        specialization: 'General Physician',
        hospital: 'City Hospital, Delhi',
        rating: 4.6,
        reviewCount: 234,
        experience: 8,
        acceptsOnline: true,
        acceptsOffline: true,
        consultationFee: 500,
        nextAvailable: 'Today, 5:30 PM',
        image: null
    },
    {
        id: '3',
        name: 'Dr. Anita Desai',
        specialization: 'Dermatologist',
        hospital: 'Skin & Care Clinic, Bangalore',
        rating: 4.9,
        reviewCount: 89,
        experience: 15,
        acceptsOnline: true,
        acceptsOffline: false,
        consultationFee: 1000,
        nextAvailable: 'Tomorrow, 10:00 AM',
        image: null
    },
    {
        id: '4',
        name: 'Dr. Vikram Singh',
        specialization: 'Orthopedic',
        hospital: 'Bone & Joint Center, Chennai',
        rating: 4.7,
        reviewCount: 178,
        experience: 20,
        acceptsOnline: false,
        acceptsOffline: true,
        consultationFee: 1200,
        nextAvailable: 'Today, 6:00 PM',
        image: null
    }
]

export default function FindDoctorsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations')
    const [modeFilter, setModeFilter] = useState<'all' | 'online' | 'offline'>('all')
    const [doctors, setDoctors] = useState(mockDoctors)
    const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        let result = doctors

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(d =>
                d.name.toLowerCase().includes(query) ||
                d.specialization.toLowerCase().includes(query) ||
                d.hospital.toLowerCase().includes(query)
            )
        }

        // Filter by specialization
        if (selectedSpecialization !== 'All Specializations') {
            result = result.filter(d => d.specialization === selectedSpecialization)
        }

        // Filter by mode
        if (modeFilter === 'online') {
            result = result.filter(d => d.acceptsOnline)
        } else if (modeFilter === 'offline') {
            result = result.filter(d => d.acceptsOffline)
        }

        setFilteredDoctors(result)
    }, [searchQuery, selectedSpecialization, modeFilter, doctors])

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold text-slate-900">Find a Doctor</h1>
                <p className="text-slate-500 mt-1">Search and book appointments with verified doctors</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by doctor name, specialization, or hospital..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-700"
                        />
                    </div>

                    {/* Specialization Dropdown */}
                    <select
                        value={selectedSpecialization}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-700 font-medium"
                    >
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${showFilters
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-100"
                    >
                        <div className="flex flex-wrap gap-3">
                            <span className="text-sm font-medium text-slate-600 self-center">Consultation Mode:</span>
                            {[
                                { value: 'all', label: 'All', icon: null },
                                { value: 'online', label: 'Online', icon: Video },
                                { value: 'offline', label: 'In-Person', icon: MapPin }
                            ].map(mode => (
                                <button
                                    key={mode.value}
                                    onClick={() => setModeFilter(mode.value as typeof modeFilter)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${modeFilter === mode.value
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {mode.icon && <mode.icon className="w-4 h-4" />}
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Results Count */}
            <motion.div variants={item} className="flex items-center justify-between">
                <p className="text-slate-600">
                    <span className="font-bold text-slate-900">{filteredDoctors.length}</span> doctors found
                </p>
                <select className="text-sm bg-transparent text-slate-600 font-medium">
                    <option>Sort by: Relevance</option>
                    <option>Rating: High to Low</option>
                    <option>Experience: High to Low</option>
                    <option>Fee: Low to High</option>
                </select>
            </motion.div>

            {/* Doctor Cards Grid */}
            <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                    <motion.div
                        key={doctor.id}
                        variants={item}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all group"
                    >
                        <div className="flex gap-4">
                            {/* Doctor Avatar */}
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                <Stethoscope className="w-10 h-10 text-primary-600" />
                            </div>

                            {/* Doctor Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                                            {doctor.name}
                                        </h3>
                                        <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-slate-800">{doctor.rating}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {doctor.hospital}
                                </p>

                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span className="text-slate-600">
                                        <strong>{doctor.experience}</strong> yrs exp
                                    </span>
                                    <span className="text-slate-600">
                                        <strong>{doctor.reviewCount}</strong> reviews
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Availability & Modes */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {doctor.acceptsOnline && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                        <Video className="w-3 h-3" /> Online
                                    </span>
                                )}
                                {doctor.acceptsOffline && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                        <MapPin className="w-3 h-3" /> In-Person
                                    </span>
                                )}
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Next Available</p>
                                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-green-500" />
                                        {doctor.nextAvailable}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Consultation Fee</p>
                                    <p className="font-bold text-xl text-slate-900">₹{doctor.consultationFee}</p>
                                </div>
                            </div>
                        </div>

                        {/* Book Button */}
                        <Link
                            href={`/patient/book/${doctor.id}`}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all active:scale-95"
                        >
                            <Calendar className="w-5 h-5" />
                            Book Appointment
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* No Results */}
            {filteredDoctors.length === 0 && (
                <motion.div
                    variants={item}
                    className="text-center py-12"
                >
                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No doctors found</h3>
                    <p className="text-slate-500">Try adjusting your search or filters</p>
                    <button
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedSpecialization('All Specializations')
                            setModeFilter('all')
                        }}
                        className="mt-4 px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                </motion.div>
            )}
        </motion.div>
    )
}
