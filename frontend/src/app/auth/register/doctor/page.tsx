'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Activity,
    Mail,
    Lock,
    User,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Globe,
    FileText,
    Building,
    Phone,
    CheckCircle,
    Upload,
    X,
    AlertCircle,
    Info
} from 'lucide-react'
import DocumentUploadSection from '@/components/DocumentUploadSection'

interface FormData {
    email: string
    password: string
    confirmPassword: string
    name: string
    country: string
    registrationNumber: string
    specialization: string
    hospital: string
    phone: string
    magicCode: string
}

interface UploadedFile {
    file: File
    preview: string
}

interface DocumentRequirement {
    type: string
    name: string
    description: string
}

interface CountryRequirements {
    country: string
    required_documents: DocumentRequirement[]
    optional_documents: DocumentRequirement[]
    registration_format: string
    regulatory_body: string
    notes: string
}

interface StructuredDocuments {
    [key: string]: {
        file: File
        preview: string
    } | undefined
}

export default function DoctorRegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [countries, setCountries] = useState<string[]>([])
    const [specializations, setSpecializations] = useState<string[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [registeredDoctor, setRegisteredDoctor] = useState<any>(null)
    const [documentRequirements, setDocumentRequirements] = useState<CountryRequirements | null>(null)
    const [structuredDocuments, setStructuredDocuments] = useState<StructuredDocuments>({})

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        country: '',
        registrationNumber: '',
        specialization: '',
        hospital: '',
        phone: '',
        magicCode: ''
    })

    useEffect(() => {
        // Fetch countries and specializations
        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
                const [countriesRes, specsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/auth/countries`),
                    fetch(`${apiUrl}/api/auth/specializations`)
                ])
                const countriesData = await countriesRes.json()
                const specsData = await specsRes.json()
                setCountries(countriesData.countries || [])
                setSpecializations(specsData.specializations || [])
            } catch (err) {
                console.error('Failed to fetch form data:', err)
                // Fallback data
                setCountries(['India', 'United States', 'United Kingdom', 'Canada', 'Australia'])
                setSpecializations(['Oncology', 'Cardiology', 'Neurology', 'General Medicine'])
            }
        }
        fetchData()
    }, [])

    // Fetch document requirements when country changes
    useEffect(() => {
        if (!formData.country) {
            setDocumentRequirements(null)
            return
        }

        const fetchRequirements = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
                const res = await fetch(`${apiUrl}/api/auth/document-requirements/${encodeURIComponent(formData.country)}`)
                const data = await res.json()
                console.log('Document requirements received:', data)

                // Ensure arrays exist
                if (!data.required_documents) data.required_documents = []
                if (!data.optional_documents) data.optional_documents = []

                setDocumentRequirements(data)
                // Clear previously uploaded documents when country changes
                setStructuredDocuments({})
            } catch (err) {
                console.error('Failed to fetch document requirements:', err)
                // Fallback requirements for common countries
                const fallbackRequirements: CountryRequirements = {
                    country: formData.country,
                    required_documents: [
                        { type: 'medical_degree', name: 'Medical Degree Certificate', description: 'Your medical degree from recognized university' },
                        { type: 'medical_license', name: 'Medical License/Registration', description: 'Valid medical practice license' }
                    ],
                    optional_documents: [
                        { type: 'hospital_id', name: 'Hospital/Clinic ID', description: 'Current employment verification' }
                    ],
                    registration_format: '',
                    regulatory_body: '',
                    notes: ''
                }
                setDocumentRequirements(fallbackRequirements)
                setStructuredDocuments({})
            }
        }
        fetchRequirements()
    }, [formData.country])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // Handle structured document upload by type
    const handleStructuredDocUpload = (docType: string, file: File) => {
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
        setStructuredDocuments(prev => ({
            ...prev,
            [docType]: { file, preview }
        }))
        setError('')
    }

    // Remove a structured document
    const handleStructuredDocRemove = (docType: string) => {
        setStructuredDocuments(prev => {
            const newDocs = { ...prev }
            if (newDocs[docType]?.preview) {
                URL.revokeObjectURL(newDocs[docType]!.preview)
            }
            delete newDocs[docType]
            return newDocs
        })
    }

    // Check if all required documents are uploaded
    const areRequiredDocsUploaded = (): boolean => {
        if (!documentRequirements) return false
        if (!documentRequirements.required_documents || documentRequirements.required_documents.length === 0) return true
        const requiredTypes = documentRequirements.required_documents.map(d => d.type)
        return requiredTypes.every(type => structuredDocuments[type])
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newFiles: UploadedFile[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError(`File ${file.name} exceeds 5MB limit`)
                continue
            }
            // Check file type
            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                setError(`Invalid file type for ${file.name}. Use JPG, PNG, or PDF`)
                continue
            }
            newFiles.push({
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
            })
        }
        setUploadedFiles(prev => [...prev, ...newFiles])
        setError('')
    }

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const validateStep = (currentStep: number): boolean => {
        setError('')

        if (currentStep === 1) {
            if (!formData.email || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all fields')
                return false
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters')
                return false
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match')
                return false
            }
        }

        if (currentStep === 2) {
            if (!formData.name || !formData.country || !formData.registrationNumber || !formData.specialization) {
                setError('Please fill in all required fields')
                return false
            }
        }

        return true
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        setStep(prev => prev - 1)
    }

    const handleRegister = async () => {
        setError('')
        setIsLoading(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

            // Step 1: Register the doctor
            const registerRes = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    name: formData.name,
                    country: formData.country,
                    registration_number: formData.registrationNumber,
                    specialization: formData.specialization,
                    hospital: formData.hospital || null,
                    phone: formData.phone || null,
                    magic_code: formData.magicCode || null
                })
            })

            const registerData = await registerRes.json()

            if (!registerRes.ok) {
                throw new Error(registerData.detail || 'Registration failed')
            }

            setRegisteredDoctor(registerData)

            // Step 2: If there are documents and no magic code, verify them
            const hasDocuments = Object.keys(structuredDocuments).length > 0
            if (hasDocuments && !formData.magicCode) {
                const formDataUpload = new FormData()
                formDataUpload.append('doctor_id', registerData.id)
                formDataUpload.append('name', formData.name)
                formDataUpload.append('country', formData.country)
                formDataUpload.append('registration_number', formData.registrationNumber)
                formDataUpload.append('specialization', formData.specialization)

                // Add documents with their types
                const documentTypes: string[] = []
                Object.entries(structuredDocuments).forEach(([docType, doc]) => {
                    if (doc) {
                        formDataUpload.append('documents', doc.file)
                        documentTypes.push(docType)
                    }
                })
                formDataUpload.append('document_types', JSON.stringify(documentTypes))

                const verifyRes = await fetch(`${apiUrl}/api/auth/verify-documents`, {
                    method: 'POST',
                    body: formDataUpload
                })

                const verifyData = await verifyRes.json()

                // Update verification status
                if (verifyData.status === 'approved') {
                    setRegisteredDoctor((prev: any) => ({ ...prev, verification_status: 'approved' }))
                }
            }

            // Move to success step
            setStep(4)

        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoToDashboard = async () => {
        // Auto-login and redirect
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
            const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: 'doctor'
                })
            })

            const loginData = await loginRes.json()

            if (loginRes.ok) {
                localStorage.setItem('auth_token', loginData.access_token)
                localStorage.setItem('user', JSON.stringify(loginData.user))

                if (loginData.user.verification_status === 'approved') {
                    router.push('/dashboard')
                } else {
                    router.push('/auth/pending')
                }
            } else {
                router.push('/auth/login')
            }
        } catch {
            router.push('/auth/login')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary-100 to-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Activity className="h-10 w-10 text-primary-500" />
                        <span className="text-2xl font-bold text-gray-900">MedVision AI</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Registration</h1>
                    <p className="text-gray-500 mt-2">Complete your profile to get verified</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${s === step ? 'bg-primary-500 text-white' :
                                s < step ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
                            </div>
                            {s < 4 && (
                                <div className={`w-20 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Labels */}
                <div className="flex justify-center gap-4 mb-8 text-sm">
                    <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Account</span>
                    <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Professional</span>
                    <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Documents</span>
                    <span className={step >= 4 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Complete</span>
                </div>

                <div className="card p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Account Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Account Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="doctor@hospital.com"
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password * (min 8 characters)
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a strong password"
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm your password"
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <button onClick={handleNext} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                                Continue <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Professional Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Professional Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name * (as on medical license)
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Dr. John Smith"
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country *
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="input-field pl-10"
                                        required
                                    >
                                        <option value="">Select country</option>
                                        {countries.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Medical Registration Number *
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g., MD-12345"
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialization *
                                </label>
                                <select
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select specialization</option>
                                    {specializations.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hospital/Clinic (optional)
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="hospital"
                                        value={formData.hospital}
                                        onChange={handleInputChange}
                                        placeholder="Hospital name"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone (optional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1 234 567 8900"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft className="h-5 w-5" /> Back
                                </button>
                                <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    Continue <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Document Upload */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-2">Document Verification</h2>

                            <p className="text-sm text-gray-600 mb-4">
                                Upload your medical credentials for AI-powered verification. Our system uses
                                Gemini Vision to analyze documents, check authenticity, and cross-verify with your details.
                            </p>

                            {/* Country-specific requirements info */}
                            {documentRequirements && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-blue-800">
                                                Requirements for {formData.country}
                                            </h3>
                                            {documentRequirements.regulatory_body && (
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Regulatory Body: {documentRequirements.regulatory_body}
                                                </p>
                                            )}
                                            {documentRequirements.registration_format && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Registration format: {documentRequirements.registration_format}
                                                </p>
                                            )}
                                            {documentRequirements.notes && (
                                                <p className="text-xs text-blue-600 mt-1 italic">
                                                    {documentRequirements.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quality Warning */}
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
                                <div className="flex items-center gap-2 text-amber-800 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium">Image Quality Requirements</span>
                                </div>
                                <p className="text-xs text-amber-700 mt-1 ml-6">
                                    Documents must be clear and readable. Blurred or low-quality images will be rejected.
                                </p>
                            </div>

                            {/* Required Documents */}
                            {documentRequirements?.required_documents && documentRequirements.required_documents.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">Required Documents</h3>
                                    {documentRequirements.required_documents.map((doc) => (
                                        <DocumentUploadSection
                                            key={doc.type}
                                            documentType={doc.type}
                                            label={doc.name}
                                            description={doc.description}
                                            required={true}
                                            uploadedFile={structuredDocuments[doc.type]?.file}
                                            preview={structuredDocuments[doc.type]?.preview}
                                            onUpload={(file) => handleStructuredDocUpload(doc.type, file)}
                                            onRemove={() => handleStructuredDocRemove(doc.type)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Optional Documents */}
                            {documentRequirements?.optional_documents && documentRequirements.optional_documents.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    <h3 className="font-medium text-gray-700">Optional Documents</h3>
                                    {documentRequirements.optional_documents.map((doc) => (
                                        <DocumentUploadSection
                                            key={doc.type}
                                            documentType={doc.type}
                                            label={doc.name}
                                            description={doc.description}
                                            required={false}
                                            uploadedFile={structuredDocuments[doc.type]?.file}
                                            preview={structuredDocuments[doc.type]?.preview}
                                            onUpload={(file) => handleStructuredDocUpload(doc.type, file)}
                                            onRemove={() => handleStructuredDocRemove(doc.type)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* No country selected message */}
                            {!documentRequirements && (
                                <div className="text-center py-8 text-gray-500">
                                    <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>Please select your country in the previous step to see document requirements.</p>
                                </div>
                            )}

                            {/* Magic Code for Testers */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-700 mb-2">For Testers / Hackathon Judges</h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Enter the magic code to skip document verification:
                                    </p>
                                    <input
                                        type="text"
                                        name="magicCode"
                                        value={formData.magicCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter magic code"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft className="h-5 w-5" /> Back
                                </button>
                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading || (!areRequiredDocsUploaded() && !formData.magicCode)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>Complete Registration</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>

                            {registeredDoctor?.verification_status === 'approved' ? (
                                <>
                                    <p className="text-gray-600 mb-6">
                                        Your account has been verified. You can now access the dashboard.
                                    </p>
                                    <button onClick={handleGoToDashboard} className="btn-primary">
                                        Go to Dashboard
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-6">
                                        Your documents are being reviewed. We'll notify you once verified.
                                    </p>
                                    <button onClick={handleGoToDashboard} className="btn-primary">
                                        Continue to Dashboard
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
