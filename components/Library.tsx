'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Plus, LogOut, Loader2,
  Search, X, ArrowUpDown, Clock, Star, User, ArrowDownAZ,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeToggle } from './ThemeToggle'
import BookCard from './BookCard'
import BookSearch from './BookSearch'
import BookEditDialog from './BookEditDialog'
import type { Book, BookStatus } from '@/lib/types'

type Filter = 'all' | BookStatus
type SortKey = 'newest' | 'oldest' | 'title' | 'author' | 'rating'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'want-to-read', label: 'Want to Read' },
  { key: 'reading', label: 'Reading' },
  { key: 'finished', label: 'Finished' },
]

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ElementType }[] = [
  { key: 'newest', label: 'Date added',   icon: Clock },
  { key: 'oldest', label: 'Oldest first', icon: Clock },
  { key: 'title',  label: 'Title A–Z',    icon: ArrowDownAZ },
  { key: 'author', label: 'Author A–Z',   icon: User },
  { key: 'rating', label: 'Top rated',    icon: Star },
]

function sortBooks(books: Book[], sort: SortKey): Book[] {
  return [...books].sort((a, b) => {
    switch (sort) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'title':  return a.title.localeCompare(b.title)
      case 'author': return a.author.localeCompare(b.author)
      case 'rating': return b.rating - a.rating
    }
  })
}

export default function Library() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
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

  const visible = useMemo(() => {
    let result = filter === 'all' ? books : books.filter(b => b.status === filter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(
        b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }
    return sortBooks(result, sort)
  }, [books, filter, query, sort])

  const isFiltered = query.trim() !== ''
  const activeSort = SORT_OPTIONS.find(o => o.key === sort)!

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="font-semibold text-foreground text-base tracking-tight">My Library</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => setSearchOpen(true)}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 text-white rounded-full px-3 h-8 text-xs gap-1.5 shadow-none"
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Stats */}
        <p className="text-xs text-muted-foreground">
          {counts.all} {counts.all === 1 ? 'book' : 'books'}
          {counts.reading > 0 && ` · ${counts.reading} reading`}
          {counts.finished > 0 && ` · ${counts.finished} finished`}
        </p>

        {/* ── SEARCH ─────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search your library by title or author…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 pr-9 h-10 text-sm rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── FILTER + SORT ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-1 bg-muted border border-border rounded-full p-1 w-max">
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

          {/* Sort dropdown */}
          <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
            <SelectTrigger className="shrink-0 h-8 rounded-full border-border bg-muted text-xs font-medium px-3 gap-1.5 w-40 shadow-none focus:ring-0 focus:ring-offset-0">
              <ArrowUpDown className="w-3 h-3 text-muted-foreground shrink-0" />
              <SelectValue>{activeSort.label}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false} sideOffset={6}>
              {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {isFiltered
                  ? `No results for "${query}"`
                  : filter !== 'all'
                  ? 'No books here yet'
                  : 'Your library is empty'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isFiltered
                  ? 'Try a different search term'
                  : filter !== 'all'
                  ? 'Try a different filter'
                  : 'Search for a book to get started'}
              </p>
            </div>
            {isFiltered && (
              <Button variant="outline" size="sm" onClick={() => setQuery('')} className="rounded-full">
                Clear search
              </Button>
            )}
            {!isFiltered && filter === 'all' && (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
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
