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

export default function RatingStars({ value, onChange, readonly = false, size = 'md' }: Props) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={cn(
            dim,
            'transition-colors',
            active >= n ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-300',
            !readonly && 'cursor-pointer hover:text-amber-400'
          )}
          onMouseEnter={() => !readonly && setHovered(n)}
          onClick={() => !readonly && onChange?.(n === value ? 0 : n)}
        />
      ))}
    </div>
  )
}
