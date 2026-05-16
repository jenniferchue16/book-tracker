'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Plus, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-amber-50/40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">My Library</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSearchOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 h-9 text-sm gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-gray-600"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {counts.all} {counts.all === 1 ? 'book' : 'books'}
            {counts.reading > 0 && ` · ${counts.reading} reading`}
            {counts.finished > 0 && ` · ${counts.finished} finished`}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-gray-200 rounded-full p-1 w-fit">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${filter === f.key
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                }
              `}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-amber-100' : 'text-gray-400'}`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading your library…
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-lg">
                {filter === 'all' ? 'Your library is empty' : `No books here yet`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'all'
                  ? 'Add your first book to get started'
                  : 'Try a different filter'}
              </p>
            </div>
            {filter === 'all' && (
              <Button
                onClick={() => setSearchOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add a Book
              </Button>
            )}
          </div>
        )}

        {/* Book grid */}
        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {visible.map(book => (
              <BookCard key={book._id} book={book} onClick={() => setEditingBook(book)} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <BookSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAdded={book => setBooks(prev => [book, ...prev])}
      />

      <BookEditDialog
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
