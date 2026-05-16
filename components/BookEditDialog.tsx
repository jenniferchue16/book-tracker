'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, Loader2, Search, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import RatingStars from './RatingStars'
import type { Book, BookStatus } from '@/lib/types'

const STATUS_LABELS: Record<BookStatus, string> = {
  'want-to-read': 'Want to Read',
  borrowed: 'Borrowed',
  reading: 'Currently Reading',
  finished: 'Finished',
}

const TROPES = [
  'Meet-cute',
  'Meet-cringe',
  'Love at first sight',
  'Instalove',
  'Slow burn',
  'Enemies to lovers',
  'Friends to lovers',
  'Lovers to enemies and back again',
  'Second chance love',
  'Childhood sweethearts',
  'Love triangle',
  'Reverse harem',
  'Fake relationship',
  'Arranged marriage',
  'Marriage of convenience',
  'Forced proximity',
  'One bed',
  'Roommates',
  'Forbidden love',
  'Off-limits crush',
  "Best friend's sibling",
  'Boss/employee',
  'Workplace romance',
  'Bodyguard romance',
  'Age gap',
  'Imbalanced dynamics',
  'Dark romance',
  'Opposites attract',
  'Grumpy/sunshine',
  'He falls first',
  'She falls first',
  'Unrequited love',
  'Hidden identity',
  'Hurt/comfort',
  'Small town romance',
  'Holiday romance',
  'Road trip romance',
  'Sports romance',
  'Celebrity romance',
  'Found family',
]

interface Props {
  book: Book | null
  onClose: () => void
  onSaved: (book: Book) => void
  onDeleted: (id: string) => void
}

export default function BookEditDialog({ book, onClose, onSaved, onDeleted }: Props) {
  const [status, setStatus] = useState<BookStatus>(book?.status ?? 'want-to-read')
  const [rating, setRating] = useState(book?.rating ?? 0)
  const [notes, setNotes] = useState(book?.notes ?? '')
  const [description, setDescription] = useState(book?.description ?? '')
  const [pages, setPages] = useState(book?.pages?.toString() ?? '')
  const [trope, setTrope] = useState(book?.tropes?.[0] ?? '')
  const [tropeSearch, setTropeSearch] = useState('')
  const [tropeOpen, setTropeOpen] = useState(false)
  const [dateStarted, setDateStarted] = useState(book?.dateStarted ? book.dateStarted.slice(0, 10) : '')
  const [dateCompleted, setDateCompleted] = useState(book?.dateCompleted ? book.dateCompleted.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!book) return null

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/books/${book!._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rating,
          notes,
          description,
          pages: pages ? parseInt(pages) : null,
          tropes: trope ? [trope] : [],
          dateStarted: dateStarted || null,
          dateCompleted: dateCompleted || null,
        }),
      })
      if (!res.ok) throw new Error()
      const { book: updated } = await res.json()
      toast.success('Changes saved')
      onSaved(updated as Book)
      onClose()
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBook() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/books/${book!._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(`"${book!.title}" removed`)
      onDeleted(book!._id)
      onClose()
    } catch {
      toast.error('Failed to delete book')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={!!book} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Book</DialogTitle>
        </DialogHeader>

        {/* ── Book header (sticky) ── */}
        <div className="flex gap-4 items-start p-6 pb-4 border-b border-border shrink-0">
          <div className="w-16 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-muted shadow">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-500 dark:from-blue-700 dark:to-blue-900" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground leading-snug">{book.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
            {book.publishedYear && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{book.publishedYear}</p>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as BookStatus)}>
              <SelectTrigger>
                <SelectValue>{STATUS_LABELS[status]}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} sideOffset={6}>
                <SelectItem value="want-to-read">Want to Read</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="reading">Currently Reading</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Rating</Label>
            <RatingStars value={rating} onChange={setRating} />
          </div>

          <div className="space-y-1.5">
            <Label>Pages</Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 352"
              value={pages}
              onChange={e => setPages(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Trope</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                value={tropeOpen ? tropeSearch : trope}
                onChange={e => setTropeSearch(e.target.value)}
                onFocus={() => { setTropeSearch(''); setTropeOpen(true) }}
                onBlur={() => setTimeout(() => setTropeOpen(false), 150)}
                placeholder={trope || 'Search tropes…'}
                className="w-full h-9 pl-9 pr-8 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {trope && !tropeOpen && (
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); setTrope('') }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {tropeOpen && (() => {
              const filtered = TROPES.filter(t =>
                !tropeSearch || t.toLowerCase().includes(tropeSearch.toLowerCase())
              )
              return (
                <div className="border border-border rounded-md bg-background shadow-sm overflow-hidden">
                  <div className="max-h-44 overflow-y-auto">
                    {filtered.length > 0 ? filtered.map(t => (
                      <button
                        key={t}
                        type="button"
                        onMouseDown={e => {
                          e.preventDefault()
                          setTrope(t)
                          setTropeOpen(false)
                          setTropeSearch('')
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-colors ${
                          t === trope
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-foreground hover:bg-accent'
                        }`}
                      >
                        {t}
                        {t === trope && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    )) : (
                      <p className="px-3 py-2.5 text-sm text-muted-foreground">No tropes match</p>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Add a description…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="resize-none text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Your thoughts on this book…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date started</Label>
              <Input
                type="date"
                value={dateStarted}
                onChange={e => setDateStarted(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date completed</Label>
              <Input
                type="date"
                value={dateCompleted}
                onChange={e => setDateCompleted(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Footer (sticky) ── */}
        <div className="flex items-center justify-between p-4 border-t border-border shrink-0 flex-wrap gap-2">
          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-destructive">Are you sure?</span>
              <Button variant="destructive" size="sm" onClick={deleteBook} disabled={deleting}>
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, delete'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
          <Button onClick={save} disabled={saving} className="bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 text-white ml-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
