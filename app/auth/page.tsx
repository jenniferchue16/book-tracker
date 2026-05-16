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
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
    if (next.every(d => d !== '')) {
      submit(next.join(''))
    }
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
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
    if (next.every(d => d !== '')) {
      submit(next.join(''))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your 6-digit passcode</p>
          </div>

          {/* OTP inputs */}
          <div
            className={`flex gap-2 transition-transform ${error ? 'animate-[shake_0.4s_ease]' : ''}`}
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
                  w-11 h-14 text-center text-xl font-semibold rounded-xl border-2 outline-none
                  transition-all duration-150 bg-gray-50
                  ${error
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : d
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-900 focus:border-amber-400 focus:bg-amber-50'
                  }
                `}
              />
            ))}
          </div>

          {loading && (
            <p className="text-sm text-gray-400">Checking…</p>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
