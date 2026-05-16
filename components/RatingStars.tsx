'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

function getQuarterValue(e: React.MouseEvent, starN: number): number {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const fraction = (e.clientX - rect.left) / rect.width
  // Snap to nearest 0.25, minimum 0.25
  const snapped = Math.ceil(fraction / 0.25) * 0.25
  return (starN - 1) + Math.min(Math.max(snapped, 0.25), 1)
}

export default function RatingStars({ value, onChange, readonly = false, size = 'md' }: Props) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map(n => {
        const fill = Math.min(Math.max(active - (n - 1), 0), 1)
        return (
          <span
            key={n}
            className={cn('relative inline-flex shrink-0', dim, !readonly && 'cursor-pointer')}
            onMouseMove={readonly ? undefined : e => setHovered(getQuarterValue(e, n))}
            onClick={readonly ? undefined : e => {
              const val = getQuarterValue(e, n)
              onChange?.(val === value ? 0 : val)
            }}
          >
            {/* Empty star */}
            <Star className={cn(dim, 'fill-transparent text-gray-300 dark:text-gray-600')} />
            {/* Filled portion — clipped from right */}
            {fill > 0 && (
              <Star
                className={cn(dim, 'fill-amber-400 text-amber-400 absolute inset-0')}
                style={{ clipPath: `inset(0 ${Math.round((1 - fill) * 100)}% 0 0)` }}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}
