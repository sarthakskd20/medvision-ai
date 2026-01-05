import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'MedVision AI - Clinical Time Machine',
    description: 'Transform patient health history into actionable insights with Gemini 3',
    keywords: ['medical AI', 'healthcare', 'patient records', 'Gemini 3', 'clinical analysis'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-gray-50 antialiased">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
