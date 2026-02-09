// Password Validation Utility for MedVision AI
// Implements strict password requirements for security

export interface PasswordValidation {
    isValid: boolean
    strength: 'weak' | 'medium' | 'strong'
    errors: string[]
    requirements: {
        minLength: boolean
        hasUppercase: boolean
        hasLowercase: boolean
        hasNumber: boolean
        hasSpecialChar: boolean
        noCommonPatterns: boolean
    }
}

// Common weak passwords and patterns to reject
const COMMON_WEAK_PASSWORDS = [
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
    'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
    'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
    'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1'
]

/**
 * Validates password against strict security requirements
 * @param password - The password to validate
 * @param email - Optional email to check for personal info
 * @returns PasswordValidation object with validation results
 */
export function validatePassword(password: string, email?: string): PasswordValidation {
    const errors: string[] = []

    // Check minimum length (12 characters)
    const minLength = password.length >= 12
    if (!minLength) {
        errors.push('Password must be at least 12 characters long')
    }

    // Check for uppercase letter
    const hasUppercase = /[A-Z]/.test(password)
    if (!hasUppercase) {
        errors.push('Password must contain at least one uppercase letter')
    }

    // Check for lowercase letter
    const hasLowercase = /[a-z]/.test(password)
    if (!hasLowercase) {
        errors.push('Password must contain at least one lowercase letter')
    }

    // Check for number
    const hasNumber = /\d/.test(password)
    if (!hasNumber) {
        errors.push('Password must contain at least one number')
    }

    // Check for special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)')
    }

    // Check for common weak passwords
    const lowerPassword = password.toLowerCase()
    const noCommonPatterns = !COMMON_WEAK_PASSWORDS.some(weak =>
        lowerPassword.includes(weak)
    )

    // Check for sequential patterns
    const hasSequentialNumbers = /012|123|234|345|456|567|678|789/.test(password)
    const hasSequentialLetters = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)

    const noSequential = !hasSequentialNumbers && !hasSequentialLetters

    // Check if password contains part of email username
    let noPersonalInfo = true
    if (email) {
        const emailUsername = email.split('@')[0].toLowerCase()
        if (emailUsername.length > 3 && lowerPassword.includes(emailUsername)) {
            noPersonalInfo = false
            errors.push('Password should not contain your email address')
        }
    }

    const finalNoCommonPatterns = noCommonPatterns && noSequential && noPersonalInfo

    if (!finalNoCommonPatterns && noCommonPatterns && noSequential) {
        errors.push('Password should not contain personal information')
    } else if (!noCommonPatterns) {
        errors.push('Password is too common or contains weak patterns')
    } else if (!noSequential) {
        errors.push('Password should not contain sequential characters')
    }

    // Calculate password strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'

    const allRequirementsMet = minLength && hasUppercase && hasLowercase &&
        hasNumber && hasSpecialChar && finalNoCommonPatterns

    if (allRequirementsMet) {
        if (password.length >= 16) {
            // Count character variety
            const varietyScore =
                (hasUppercase ? 1 : 0) +
                (hasLowercase ? 1 : 0) +
                (hasNumber ? 1 : 0) +
                (hasSpecialChar ? 1 : 0)

            strength = varietyScore === 4 ? 'strong' : 'medium'
        } else if (password.length >= 14) {
            strength = 'medium'
        } else {
            strength = 'weak'
        }
    }

    return {
        isValid: allRequirementsMet,
        strength,
        errors,
        requirements: {
            minLength,
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSpecialChar,
            noCommonPatterns: finalNoCommonPatterns
        }
    }
}

/**
 * Get password strength color for UI display
 */
export function getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'text-red-600 dark:text-red-400'
        case 'medium':
            return 'text-orange-600 dark:text-orange-400'
        case 'strong':
            return 'text-green-600 dark:text-green-400'
    }
}

/**
 * Get password strength background color for progress bar
 */
export function getStrengthBgColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'bg-red-500'
        case 'medium':
            return 'bg-orange-500'
        case 'strong':
            return 'bg-green-500'
    }
}

/**
 * Get password strength width percentage
 */
export function getStrengthWidth(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return '33%'
        case 'medium':
            return '66%'
        case 'strong':
            return '100%'
    }
}
