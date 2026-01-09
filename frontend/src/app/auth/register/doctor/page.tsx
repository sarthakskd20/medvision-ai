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

// Verification result from Gemini
interface DocumentVerificationResult {
    filename: string
    document_type: string
    authenticity_score: number
    is_ai_generated: boolean
    ai_indicators: string[]
    is_blurry: boolean
    blur_severity: string
    field_matches: {
        name: { form: string; extracted: string; match: boolean }
        registration: { form: string; extracted: string; match: boolean }
        specialization: { form: string; extracted: string; match: boolean }
    }
    rejection_reasons: string[]
}

interface VerificationResult {
    status: 'approved' | 'rejected' | 'manual_review'
    overall_score: number
    documents: DocumentVerificationResult[]
    issues: string[]
    recommendation: string
    // Store raw API response for debugging
    rawData?: any
}

export default function DoctorRegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState('')
    const [countries, setCountries] = useState<string[]>([])
    const [specializations, setSpecializations] = useState<string[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [registeredDoctor, setRegisteredDoctor] = useState<any>(null)
    const [documentRequirements, setDocumentRequirements] = useState<CountryRequirements | null>(null)
    const [structuredDocuments, setStructuredDocuments] = useState<StructuredDocuments>({})
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

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

    // Step 1: Verify documents with Gemini (don't register yet)
    const handleVerifyDocuments = async () => {
        setError('')
        setIsVerifying(true)
        setVerificationResult(null)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

            // If magic code is provided, skip verification
            if (formData.magicCode) {
                // Direct registration with magic code
                await completeRegistration(true)
                return
            }

            // Verify documents first
            const formDataUpload = new FormData()
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
            console.log('Verification result:', verifyData)

            // Build verification result for UI
            const result: VerificationResult = {
                status: verifyData.status || 'rejected',
                overall_score: verifyData.confidence_score || 0,
                documents: (verifyData.document_analysis || []).map((doc: any, index: number) => ({
                    filename: documentTypes[index] || `Document ${index + 1}`,
                    document_type: doc.type || 'unknown',
                    authenticity_score: doc.authenticity_score || 0,
                    is_ai_generated: doc.is_ai_generated || false,
                    ai_indicators: doc.ai_indicators || [],
                    is_blurry: doc.is_blurry || false,
                    blur_severity: doc.blur_severity || 'none',
                    field_matches: {
                        name: {
                            form: formData.name,
                            extracted: doc.extracted_name || 'Not found',
                            match: doc.name_match !== false
                        },
                        registration: {
                            form: formData.registrationNumber,
                            extracted: doc.extracted_registration || 'Not found',
                            match: doc.registration_match !== false
                        },
                        specialization: {
                            form: formData.specialization,
                            extracted: doc.extracted_specialization || 'Not found',
                            match: doc.specialization_match !== false
                        }
                    },
                    rejection_reasons: doc.rejection_reasons || []
                })),
                issues: verifyData.issues || [],
                recommendation: verifyData.recommendation || '',
                rawData: verifyData  // Store full API response for debugging
            }

            setVerificationResult(result)

            // Move to verification results step
            setStep(4)

            // If approved, auto-complete registration
            if (result.status === 'approved') {
                await completeRegistration(false)
            }

        } catch (err: any) {
            console.error('Verification error:', err)
            setError(err.message || 'Verification failed')
        } finally {
            setIsVerifying(false)
        }
    }

    // Complete registration after verification
    const completeRegistration = async (skipVerification: boolean) => {
        setIsLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

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

            // Move to success step
            if (skipVerification) {
                setStep(5)
            }

        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    // Retry verification with new documents
    const handleRetryVerification = () => {
        setVerificationResult(null)
        setStep(3)
    }

    // Proceed to success after viewing results
    const handleProceedToSuccess = async () => {
        if (!registeredDoctor) {
            await completeRegistration(false)
        }
        setStep(5)
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
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${s === step ? 'bg-primary-500 text-white' :
                                s < step ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
                            </div>
                            {s < 5 && (
                                <div className={`w-16 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Labels */}
                <div className="flex justify-center gap-3 mb-8 text-xs">
                    <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Account</span>
                    <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Professional</span>
                    <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Documents</span>
                    <span className={step >= 4 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Verification</span>
                    <span className={step >= 5 ? 'text-primary-600 font-medium' : 'text-gray-400'}>Complete</span>
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
                                    Documents must be clear and readable. Blurred, AI-generated, or low-quality images will be rejected.
                                </p>
                            </div>

                            {/* Always show document upload sections */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900">Required Documents</h3>

                                {/* Medical Degree */}
                                <DocumentUploadSection
                                    documentType="medical_degree"
                                    label={documentRequirements?.required_documents?.[0]?.name || "Medical Degree Certificate"}
                                    description={documentRequirements?.required_documents?.[0]?.description || "MBBS, MD, or equivalent degree from recognized university"}
                                    required={true}
                                    uploadedFile={structuredDocuments['medical_degree']?.file}
                                    preview={structuredDocuments['medical_degree']?.preview}
                                    onUpload={(file) => handleStructuredDocUpload('medical_degree', file)}
                                    onRemove={() => handleStructuredDocRemove('medical_degree')}
                                />

                                {/* Medical License */}
                                <DocumentUploadSection
                                    documentType="medical_license"
                                    label={documentRequirements?.required_documents?.[1]?.name || "Medical License / Registration"}
                                    description={documentRequirements?.required_documents?.[1]?.description || "Valid medical council registration certificate"}
                                    required={true}
                                    uploadedFile={structuredDocuments['medical_license']?.file}
                                    preview={structuredDocuments['medical_license']?.preview}
                                    onUpload={(file) => handleStructuredDocUpload('medical_license', file)}
                                    onRemove={() => handleStructuredDocRemove('medical_license')}
                                />
                            </div>

                            {/* Optional Documents */}
                            <div className="space-y-4 mt-6">
                                <h3 className="font-medium text-gray-700">Optional Documents</h3>

                                {/* Hospital ID */}
                                <DocumentUploadSection
                                    documentType="hospital_id"
                                    label="Hospital / Clinic ID"
                                    description="Current employment verification (optional)"
                                    required={false}
                                    uploadedFile={structuredDocuments['hospital_id']?.file}
                                    preview={structuredDocuments['hospital_id']?.preview}
                                    onUpload={(file) => handleStructuredDocUpload('hospital_id', file)}
                                    onRemove={() => handleStructuredDocRemove('hospital_id')}
                                />
                            </div>

                            {/* Debug info - remove after testing */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
                                    Debug: API returned {documentRequirements ? `${documentRequirements.required_documents?.length || 0} required docs` : 'null'}
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
                                    onClick={handleVerifyDocuments}
                                    disabled={isVerifying || isLoading || (!areRequiredDocsUploaded() && !formData.magicCode)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Verifying with Gemini...
                                        </>
                                    ) : (
                                        <>Verify Documents</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Verification Results */}
                    {step === 4 && (
                        <div className="space-y-6">
                            {/* Header based on result */}
                            {verificationResult?.status === 'approved' ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-green-700">Documents Verified!</h2>
                                    <p className="text-gray-600 mt-1">Overall Score: {verificationResult.overall_score}%</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-red-700">Verification Failed</h2>
                                    <p className="text-gray-600 mt-1">
                                        Score: {verificationResult?.overall_score || 0}% (Minimum required: 70%)
                                    </p>
                                </div>
                            )}

                            {/* Per-Document Analysis */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800">Document Analysis</h3>

                                {/* Show fallback if no documents analyzed */}
                                {(!verificationResult?.documents || verificationResult.documents.length === 0) && (
                                    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                                        <p className="text-amber-800 font-medium mb-2">No document details available</p>
                                        <p className="text-sm text-amber-700">
                                            The verification system could not analyze your documents in detail.
                                            This may be due to:
                                        </p>
                                        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                                            <li>Documents were not properly uploaded</li>
                                            <li>File format not supported</li>
                                            <li>API processing error</li>
                                        </ul>
                                        {verificationResult?.recommendation && (
                                            <p className="mt-3 p-2 bg-amber-100 rounded text-sm text-amber-800">
                                                <span className="font-medium">Recommendation: </span>
                                                {verificationResult.recommendation}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {verificationResult?.documents.map((doc, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-lg p-4 ${doc.authenticity_score >= 70 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-gray-600" />
                                                <span className="font-medium capitalize">
                                                    {doc.filename.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${doc.authenticity_score >= 70
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {doc.authenticity_score}%
                                            </span>
                                        </div>

                                        {/* AI Detection Warning */}
                                        {doc.is_ai_generated && (
                                            <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-sm">
                                                <span className="font-medium text-red-800">AI-Generated Document Detected</span>
                                                {doc.ai_indicators.length > 0 && (
                                                    <ul className="mt-1 text-red-700 text-xs">
                                                        {doc.ai_indicators.slice(0, 3).map((ind, i) => (
                                                            <li key={i}>• {ind}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}

                                        {/* Blur Warning */}
                                        {doc.is_blurry && (
                                            <div className="mb-3 p-2 bg-amber-100 border border-amber-300 rounded text-sm">
                                                <span className="font-medium text-amber-800">
                                                    Document is blurry ({doc.blur_severity})
                                                </span>
                                            </div>
                                        )}

                                        {/* Field Matches */}
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                {doc.field_matches.name.match ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className="text-gray-600">Name:</span>
                                                <span className={doc.field_matches.name.match ? 'text-green-700' : 'text-red-700'}>
                                                    {doc.field_matches.name.extracted}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {doc.field_matches.registration.match ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className="text-gray-600">Registration:</span>
                                                <span className={doc.field_matches.registration.match ? 'text-green-700' : 'text-red-700'}>
                                                    {doc.field_matches.registration.extracted}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Rejection Reasons */}
                                        {doc.rejection_reasons.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-red-200">
                                                <span className="text-xs font-medium text-red-700">Issues:</span>
                                                <ul className="mt-1 text-xs text-red-600">
                                                    {doc.rejection_reasons.map((reason, i) => (
                                                        <li key={i}>• {reason}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Issues Summary */}
                            {verificationResult?.issues && verificationResult.issues.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h4 className="font-medium text-amber-800 mb-2">What to Fix:</h4>
                                    <ul className="text-sm text-amber-700 space-y-1">
                                        {verificationResult.issues.map((issue, i) => (
                                            <li key={i}>• {issue}</li>
                                        ))}
                                    </ul>
                                    {verificationResult.recommendation && (
                                        <p className="mt-2 text-xs text-amber-600 italic">
                                            {verificationResult.recommendation}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Raw API Response for debugging */}
                            {verificationResult?.rawData && (
                                <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                                        View Gemini Analysis Details
                                    </summary>
                                    <div className="mt-3 space-y-2 text-xs">
                                        <div className="p-2 bg-white rounded border">
                                            <p className="font-medium text-gray-800 mb-1">Status: {verificationResult.rawData.status}</p>
                                            <p className="text-gray-600">Confidence: {verificationResult.rawData.confidence_score}%</p>
                                        </div>
                                        {verificationResult.rawData.field_verification && (
                                            <div className="p-2 bg-white rounded border">
                                                <p className="font-medium text-gray-800 mb-2">Field Verification:</p>
                                                {verificationResult.rawData.field_verification.map((field: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0">
                                                        <span className={field.match ? 'text-green-600' : 'text-red-600'}>
                                                            {field.match ? '✓' : '✗'}
                                                        </span>
                                                        <span className="font-medium">{field.field}:</span>
                                                        <span className="text-gray-500">Form: "{field.form_value}"</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="text-gray-700">Extracted: "{field.extracted_value}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {verificationResult.rawData.document_analysis && verificationResult.rawData.document_analysis.length > 0 && (
                                            <div className="p-2 bg-white rounded border">
                                                <p className="font-medium text-gray-800 mb-2">Document Details:</p>
                                                {verificationResult.rawData.document_analysis.map((doc: any, i: number) => (
                                                    <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                                                        <p className="font-medium capitalize">{doc.document_type}</p>
                                                        <p className="text-gray-600">Authenticity: {doc.authenticity_score}%</p>
                                                        {doc.is_ai_generated && (
                                                            <p className="text-red-600 font-medium">AI Generated: Yes</p>
                                                        )}
                                                        {doc.ai_indicators && doc.ai_indicators.length > 0 && (
                                                            <p className="text-red-500">AI Indicators: {doc.ai_indicators.join(', ')}</p>
                                                        )}
                                                        {doc.rejection_reasons && doc.rejection_reasons.length > 0 && (
                                                            <p className="text-red-500">Rejected: {doc.rejection_reasons.join(', ')}</p>
                                                        )}
                                                        <p className="text-gray-500">Name: {doc.extracted_name}</p>
                                                        <p className="text-gray-500">Reg#: {doc.extracted_registration}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                {verificationResult?.status === 'approved' ? (
                                    <button
                                        onClick={handleProceedToSuccess}
                                        disabled={isLoading}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>Complete Registration</>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleRetryVerification}
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <ArrowLeft className="h-5 w-5" /> Upload Different Documents
                                        </button>
                                        <button
                                            onClick={handleVerifyDocuments}
                                            disabled={isVerifying}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            {isVerifying ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>Try Again</>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Success */}
                    {step === 5 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
                            <p className="text-gray-600 mb-6">
                                Welcome to MedVision AI, {formData.name}!<br />
                                Your documents have been verified successfully.
                            </p>

                            {verificationResult && (
                                <div className="mb-6 p-4 bg-green-50 rounded-lg text-left max-w-sm mx-auto">
                                    <h4 className="font-medium text-green-800 mb-2">Verification Summary</h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>Overall Score: {verificationResult.overall_score}%</p>
                                        {verificationResult.documents.map((doc, i) => (
                                            <p key={i} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                {doc.filename.replace(/_/g, ' ')}: {doc.authenticity_score}%
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={handleGoToDashboard} className="btn-primary">
                                Go to Dashboard
                            </button>
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
