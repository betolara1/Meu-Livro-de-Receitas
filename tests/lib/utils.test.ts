import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
        expect(cn('text-red-500', true && 'bg-blue-500', false && 'hidden')).toBe('text-red-500 bg-blue-500')
    })

    it('should merge tailwind classes correctly', () => {
        expect(cn('px-2 py-2', 'p-4')).toBe('p-4')
    })
})
