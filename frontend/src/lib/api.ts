/**
 * MedVision AI - API Client
 * Handles all communication with the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

/**
 * Base fetch function with error handling
 */
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `API Error: ${response.status}`)
    }

    return response.json()
}

/**
 * API Functions
 */
export const api = {
    // Health check
    health: () => fetchAPI<{ status: string }>('/health'),

    // Auth - Get current logged-in doctor
    getCurrentDoctor: () => fetchAPI<any>('/api/auth/me'),

    // Patients
    getPatients: () => fetchAPI<any[]>('/api/patients'),

    getPatient: (id: string) => fetchAPI<any>(`/api/patients/${id}`),

    getPatientTimeline: (id: string) =>
        fetchAPI<{ patient: any; timeline: any[]; total_events: number; token_estimate: number }>(
            `/api/patients/${id}/timeline`
        ),

    getPatientFullContext: (id: string) =>
        fetchAPI<{ context: string; token_count: number }>(
            `/api/patients/${id}/full-context`
        ),

    // Analysis
    generateSummary: (patientId: string) =>
        fetchAPI<{ summary: string; context_tokens: number }>('/api/analysis/summary', {
            method: 'POST',
            body: JSON.stringify({ patient_id: patientId }),
        }),

    predictTrajectory: (patientId: string, treatmentOptions: string[] = []) =>
        fetchAPI<{ reasoning: string; predictions: string }>('/api/analysis/predict-trajectory', {
            method: 'POST',
            body: JSON.stringify({
                patient_id: patientId,
                treatment_options: treatmentOptions,
            }),
        }),

    // Reports
    uploadAndInterpretReport: async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_URL}/api/reports/upload-and-interpret`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.detail || 'Upload failed')
        }

        return response.json()
    },

    interpretReportText: (text: string) =>
        fetchAPI<{ interpretation: string }>('/api/reports/interpret-text', {
            method: 'POST',
            body: JSON.stringify({ text }),
        }),

    // Chat
    sendChatMessage: (message: string, patientId?: string) =>
        fetchAPI<{ response: string; sources: string[] }>('/api/chat/message', {
            method: 'POST',
            body: JSON.stringify({
                message,
                patient_id: patientId,
            }),
        }),

    askAboutResult: (
        question: string,
        resultName: string,
        resultValue: string,
        normalRange: string
    ) =>
        fetchAPI<{ answer: string; is_concerning: boolean }>('/api/chat/ask-about-result', {
            method: 'POST',
            body: JSON.stringify({
                question,
                result_name: resultName,
                result_value: resultValue,
                normal_range: normalRange,
            }),
        }),
}

export default api
