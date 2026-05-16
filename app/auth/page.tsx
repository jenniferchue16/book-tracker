'use client'

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  async function submit(code: string) {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      })
      if (res.ok) {
        router.push('/library')
      } else {
        setError(true)
        setDigits(['', '', '', '', '', ''])
        setTimeout(() => setError(false), 500)
        inputs.current[0]?.focus()
        toast.error('Wrong passcode — try again')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) inputs.current[index + 1]?.focus()
    if (next.every(d => d !== '')) submit(next.join(''))
  }

  function handleKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
    if (next.every(d => d !== '')) submit(next.join(''))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-xs">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center gap-7">

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-amber-500" />
          </div>

          {/* Heading */}
          <div className="text-center -mt-2">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">My Library</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your 6-digit passcode</p>
          </div>

          {/* OTP inputs */}
          <div
            className="flex gap-2"
            style={{ animation: error ? 'shake 0.45s ease' : 'none' }}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                autoFocus={i === 0}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`
                  w-10 h-12 text-center text-lg font-semibold rounded-xl border-2 outline-none
                  bg-muted transition-all duration-150 text-foreground
                  disabled:opacity-50
                  ${error
                    ? 'border-red-500 text-red-500'
                    : d
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-border focus:border-amber-500'
                  }
                `}
              />
            ))}
          </div>

          {loading && (
            <p className="text-xs text-muted-foreground -mt-3">Checking…</p>
          )}
        </div>
      </div>
    </div>
  )
}
