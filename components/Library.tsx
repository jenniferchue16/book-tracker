'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Plus, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import BookCard from './BookCard'
import BookSearch from './BookSearch'
import BookEditDialog from './BookEditDialog'
import type { Book, BookStatus } from '@/lib/types'

type Filter = 'all' | BookStatus

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'want-to-read', label: 'Want to Read' },
  { key: 'reading', label: 'Reading' },
  { key: 'finished', label: 'Finished' },
]

export default function Library() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  useEffect(() => {
    fetch('/api/books')
      .then(r => r.json())
      .then(d => setBooks(d.books ?? []))
      .catch(() => toast.error('Failed to load library'))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth')
  }

  const counts: Record<Filter, number> = {
    all: books.length,
    'want-to-read': books.filter(b => b.status === 'want-to-read').length,
    reading: books.filter(b => b.status === 'reading').length,
    finished: books.filter(b => b.status === 'finished').length,
  }

  const visible = filter === 'all' ? books : books.filter(b => b.status === filter)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="font-semibold text-foreground text-base tracking-tight">My Library</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setSearchOpen(true)}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-white rounded-full px-3 h-8 text-xs gap-1.5 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Book</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground w-8 h-8"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats */}
        <p className="text-xs text-muted-foreground mb-5">
          {counts.all} {counts.all === 1 ? 'book' : 'books'}
          {counts.reading > 0 && ` · ${counts.reading} reading`}
          {counts.finished > 0 && ` · ${counts.finished} finished`}
        </p>

        {/* Filter tabs — scrollable on mobile */}
        <div className="relative mb-7">
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 -mb-1">
            <div className="flex gap-1 bg-muted border border-border rounded-full p-1 w-max min-w-0">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`
                    whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all
                    ${filter === f.key
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {f.label}
                  {counts[f.key] > 0 && (
                    <span className={`ml-1 text-[10px] ${filter === f.key ? 'text-amber-100' : 'text-muted-foreground'}`}>
                      {counts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your library…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-amber-500/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {filter === 'all' ? 'Your library is empty' : 'No books here yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'all' ? 'Search for a book to get started' : 'Try a different filter'}
              </p>
            </div>
            {filter === 'all' && (
              <Button
                onClick={() => setSearchOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add your first book
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {visible.map(book => (
              <BookCard key={book._id} book={book} onClick={() => setEditingBook(book)} />
            ))}
          </div>
        )}
      </main>

      <BookSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAdded={book => setBooks(prev => [book, ...prev])}
      />

      <BookEditDialog
        key={editingBook?._id ?? 'none'}
        book={editingBook}
        onClose={() => setEditingBook(null)}
        onSaved={updated =>
          setBooks(prev => prev.map(b => (b._id === updated._id ? updated : b)))
        }
        onDeleted={id => setBooks(prev => prev.filter(b => b._id !== id))}
      />
    </div>
  )
}
