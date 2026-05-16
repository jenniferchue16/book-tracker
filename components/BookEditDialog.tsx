'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, Loader2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import RatingStars from './RatingStars'
import type { Book, BookStatus } from '@/lib/types'

const STATUS_LABELS: Record<BookStatus, string> = {
  'want-to-read': 'Want to Read',
  reading: 'Currently Reading',
  finished: 'Finished',
}

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
        body: JSON.stringify({ status, rating, notes }),
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Book</DialogTitle>
        </DialogHeader>

        {/* Book header */}
        <div className="flex gap-4 items-start">
          <div className="w-16 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-muted shadow">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-amber-300 to-amber-500 dark:from-amber-700 dark:to-amber-900" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground leading-snug line-clamp-3">{book.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
            {book.publishedYear && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{book.publishedYear}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as BookStatus)}>
              <SelectTrigger>
                <SelectValue>{STATUS_LABELS[status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="want-to-read">Want to Read</SelectItem>
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
            <Label>Notes</Label>
            <Textarea
              placeholder="Your thoughts on this book…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
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
          <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 text-white ml-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
