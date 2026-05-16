'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Search, Plus, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { OpenLibraryDoc, Book } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onAdded: (book: Book) => void
}

export default function BookSearch({ open, onClose, onAdded }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OpenLibraryDoc[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]) }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median`
        )
        const data = await res.json()
        setResults(data.docs || [])
      } catch {
        toast.error('Search failed — check your connection')
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [query])

  async function addBook(doc: OpenLibraryDoc) {
    setAdding(doc.key)
    try {
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : ''

      // Fetch description from Open Library Works API (best-effort)
      let description = ''
      try {
        const workRes = await fetch(`https://openlibrary.org${doc.key}.json`)
        const workData = await workRes.json()
        if (workData.description) {
          description = typeof workData.description === 'string'
            ? workData.description
            : (workData.description.value ?? '')
        }
      } catch { /* description is optional */ }

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: doc.title,
          author: doc.author_name?.[0] ?? 'Unknown Author',
          coverUrl,
          openLibraryKey: doc.key,
          publishedYear: doc.first_publish_year,
          pages: doc.number_of_pages_median,
          description,
        }),
      })
      if (res.status === 409) { toast.info('Already in your library'); return }
      if (!res.ok) throw new Error()
      const { book } = await res.json()
      toast.success(`"${doc.title}" added to your library`)
      onAdded(book)
      onClose()
    } catch {
      toast.error('Failed to add book')
    } finally {
      setAdding(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold text-foreground">Add a Book</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search by title or author…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
          {searching && (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Searching…</span>
            </div>
          )}

          {!searching && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <BookOpen className="w-8 h-8" />
              <p className="text-sm">No results found</p>
            </div>
          )}

          {!searching && results.map(doc => (
            <div
              key={doc.key}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-10 h-14 relative rounded-md overflow-hidden flex-shrink-0 bg-muted">
                {doc.cover_i ? (
                  <Image
                    src={`https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`}
                    alt={doc.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-muted to-muted-foreground/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {doc.author_name?.[0] ?? 'Unknown Author'}
                  {doc.first_publish_year ? ` · ${doc.first_publish_year}` : ''}
                  {doc.number_of_pages_median ? ` · ${doc.number_of_pages_median} pp` : ''}
                </p>
              </div>

              {/* Add button */}
              <button
                onClick={() => addBook(doc)}
                disabled={!!adding}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-medium
                  text-blue-700 dark:text-blue-300
                  bg-blue-100 dark:bg-blue-900/40
                  hover:bg-blue-200 dark:hover:bg-blue-900/70
                  px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {adding === doc.key
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Plus className="w-3 h-3" />
                }
                Add
              </button>
            </div>
          ))}

          {!query && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Search className="w-8 h-8" />
              <p className="text-sm">Type to search Open Library</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
