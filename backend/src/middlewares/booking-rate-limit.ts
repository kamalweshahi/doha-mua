import type { NextFunction, Request, Response } from 'express'
const attempts = new Map<string, number[]>()
export default function bookingRateLimit(request: Request, response: Response, next: NextFunction) { const key = request.ip || 'unknown'; const now = Date.now(); const recent = (attempts.get(key) || []).filter(time => now - time < 60_000); if (recent.length >= 12) return response.status(429).json({ message: 'Too many booking attempts. Please wait a minute. / محاولات كثيرة، يرجى الانتظار دقيقة.' }); recent.push(now); attempts.set(key, recent); next() }
