'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
    hue: number
    twinkleSpeed: number
    twinklePhase: number
    isStar: boolean
}

interface FloatingShape {
    x: number
    y: number
    size: number
    rotation: number
    rotationSpeed: number
    speedX: number
    speedY: number
    type: 'circle' | 'ring' | 'cross' | 'dot'
    opacity: number
}

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        let particles: Particle[] = []
        let shapes: FloatingShape[] = []
        let time = 0

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
            initShapes()
        }

        const initParticles = () => {
            particles = []
            const particleCount = Math.floor((canvas.width * canvas.height) / 20000)
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2.5 + 1,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.2 + 0.05,
                    hue: Math.random() > 0.5 ? 174 : 160,
                    twinkleSpeed: Math.random() * 0.05 + 0.02,
                    twinklePhase: Math.random() * Math.PI * 2,
                    isStar: Math.random() > 0.6 // 40% are stars
                })
            }
        }

        const initShapes = () => {
            shapes = []
            const shapeCount = 8
            const types: ('circle' | 'ring' | 'cross' | 'dot')[] = ['circle', 'ring', 'cross', 'dot']
            for (let i = 0; i < shapeCount; i++) {
                shapes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 60 + 30,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.005,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2,
                    type: types[Math.floor(Math.random() * types.length)],
                    opacity: Math.random() * 0.06 + 0.02
                })
            }
        }

        const drawStar = (x: number, y: number, size: number, opacity: number, hue: number) => {
            ctx.save()
            ctx.translate(x, y)

            // Draw 4-point star
            ctx.beginPath()
            ctx.moveTo(0, -size)
            ctx.lineTo(size * 0.3, -size * 0.3)
            ctx.lineTo(size, 0)
            ctx.lineTo(size * 0.3, size * 0.3)
            ctx.lineTo(0, size)
            ctx.lineTo(-size * 0.3, size * 0.3)
            ctx.lineTo(-size, 0)
            ctx.lineTo(-size * 0.3, -size * 0.3)
            ctx.closePath()

            ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${opacity})`
            ctx.fill()

            // Add glow effect
            ctx.shadowColor = `hsla(${hue}, 80%, 60%, ${opacity * 0.5})`
            ctx.shadowBlur = size * 2
            ctx.fill()

            ctx.restore()
        }

        const drawParticle = (p: Particle) => {
            // Calculate twinkle effect
            const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase)
            const currentOpacity = p.opacity * (0.5 + twinkle * 0.5)

            if (p.isStar) {
                drawStar(p.x, p.y, p.size, currentOpacity, p.hue)
            } else {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${currentOpacity})`
                ctx.fill()

                // Add subtle glow to regular particles too
                if (currentOpacity > 0.15) {
                    ctx.shadowColor = `hsla(${p.hue}, 70%, 60%, ${currentOpacity * 0.3})`
                    ctx.shadowBlur = p.size * 3
                    ctx.fill()
                    ctx.shadowBlur = 0
                }
            }
        }

        const drawShape = (s: FloatingShape) => {
            ctx.save()
            ctx.translate(s.x, s.y)
            ctx.rotate(s.rotation)
            ctx.strokeStyle = `hsla(174, 60%, 45%, ${s.opacity})`
            ctx.lineWidth = 1.5

            switch (s.type) {
                case 'circle':
                    ctx.beginPath()
                    ctx.arc(0, 0, s.size, 0, Math.PI * 2)
                    ctx.stroke()
                    break
                case 'ring':
                    ctx.beginPath()
                    ctx.arc(0, 0, s.size, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(0, 0, s.size * 0.6, 0, Math.PI * 2)
                    ctx.stroke()
                    break
                case 'cross':
                    ctx.beginPath()
                    ctx.moveTo(-s.size * 0.5, 0)
                    ctx.lineTo(s.size * 0.5, 0)
                    ctx.moveTo(0, -s.size * 0.5)
                    ctx.lineTo(0, s.size * 0.5)
                    ctx.stroke()
                    break
                case 'dot':
                    ctx.beginPath()
                    ctx.arc(0, 0, s.size * 0.3, 0, Math.PI * 2)
                    ctx.fillStyle = `hsla(174, 60%, 45%, ${s.opacity})`
                    ctx.fill()
                    break
            }
            ctx.restore()
        }

        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `hsla(174, 60%, 50%, ${0.03 * (1 - distance / 120)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }
        }

        const updateParticle = (p: Particle) => {
            p.x += p.speedX
            p.y += p.speedY

            if (p.x < 0) p.x = canvas.width
            if (p.x > canvas.width) p.x = 0
            if (p.y < 0) p.y = canvas.height
            if (p.y > canvas.height) p.y = 0
        }

        const updateShape = (s: FloatingShape) => {
            s.x += s.speedX
            s.y += s.speedY
            s.rotation += s.rotationSpeed

            if (s.x < -s.size) s.x = canvas.width + s.size
            if (s.x > canvas.width + s.size) s.x = -s.size
            if (s.y < -s.size) s.y = canvas.height + s.size
            if (s.y > canvas.height + s.size) s.y = -s.size
        }

        const animate = () => {
            time++
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw floating shapes
            shapes.forEach(shape => {
                updateShape(shape)
                drawShape(shape)
            })

            // Draw connections first (behind particles)
            drawConnections()

            // Draw and update particles
            particles.forEach(particle => {
                updateParticle(particle)
                drawParticle(particle)
            })

            animationId = requestAnimationFrame(animate)
        }

        window.addEventListener('resize', resize)
        resize()
        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.8 }}
        />
    )
}

