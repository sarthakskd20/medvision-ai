'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Edit2,
    Save,
    X,
    Heart,
    Droplet,
    Shield,
    Bell,
    Lock
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

export default function PatientProfilePage() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+91 98765 43210',
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodGroup: 'O+',
        address: 'Mumbai, Maharashtra, India',
        emergencyContact: '+91 98765 43211',
        allergies: ['Penicillin', 'Dust'],
        medications: ['Vitamin D'],
        conditions: ['None']
    })

    const [editedProfile, setEditedProfile] = useState(profile)

    useEffect(() => {
        // Load from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)
                setProfile(prev => ({
                    ...prev,
                    name: user.name || prev.name,
                    email: user.email || prev.email
                }))
                setEditedProfile(prev => ({
                    ...prev,
                    name: user.name || prev.name,
                    email: user.email || prev.email
                }))
            } catch (e) { }
        }
    }, [])

    const handleSave = () => {
        setProfile(editedProfile)
        setIsEditing(false)
        // TODO: Save to API
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    const calculateAge = (dob: string) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your personal information</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Profile Card */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Cover & Avatar */}
                <div className="h-32 bg-gradient-to-r from-primary-500 to-teal-500 relative">
                    <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                            <User className="w-12 h-12 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-6 px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                            <p className="text-slate-500">{profile.email}</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {profile.bloodGroup}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                {calculateAge(profile.dateOfBirth)} years
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile.name}
                                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        ) : (
                            <p className="text-slate-900 font-medium">{profile.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                        <p className="text-slate-900 font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {profile.email}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editedProfile.phone}
                                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        ) : (
                            <p className="text-slate-900 font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                {profile.phone}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editedProfile.dateOfBirth}
                                onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        ) : (
                            <p className="text-slate-900 font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                        {isEditing ? (
                            <select
                                value={editedProfile.gender}
                                onChange={(e) => setEditedProfile({ ...editedProfile, gender: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <p className="text-slate-900 font-medium">{profile.gender}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Blood Group</label>
                        {isEditing ? (
                            <select
                                value={editedProfile.bloodGroup}
                                onChange={(e) => setEditedProfile({ ...editedProfile, bloodGroup: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-slate-900 font-medium flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-red-500" />
                                {profile.bloodGroup}
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Medical Information */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Medical Information
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Known Allergies</label>
                        <div className="flex flex-wrap gap-2">
                            {profile.allergies.map((allergy, i) => (
                                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                                    {allergy}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Current Medications</label>
                        <div className="flex flex-wrap gap-2">
                            {profile.medications.map((med, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {med}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Medical Conditions</label>
                        <div className="flex flex-wrap gap-2">
                            {profile.conditions.map((cond, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                    {cond}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Emergency Contact
                </h3>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Emergency Phone</label>
                    {isEditing ? (
                        <input
                            type="tel"
                            value={editedProfile.emergencyContact}
                            onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContact: e.target.value })}
                            className="w-full md:w-1/2 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                    ) : (
                        <p className="text-slate-900 font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {profile.emergencyContact}
                        </p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
