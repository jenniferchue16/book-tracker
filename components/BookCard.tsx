import Image from 'next/image'
import type { Book, BookStatus } from '@/lib/types'
import RatingStars from './RatingStars'

const STATUS_LABELS: Record<BookStatus, string> = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished',
  borrowed: 'Borrowed',
}

const STATUS_COLORS: Record<BookStatus, string> = {
  'want-to-read': 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
  reading: 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300',
  finished: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  borrowed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
}

const GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-rose-500 to-pink-700',
  'from-blue-500 to-blue-700',
  'from-teal-500 to-emerald-700',
  'from-sky-500 to-blue-700',
  'from-fuchsia-500 to-rose-700',
]

function CoverPlaceholder({ title }: { title: string }) {
  const gradient = GRADIENTS[title.charCodeAt(0) % GRADIENTS.length]
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-end p-3`}>
      <p className="text-white text-[11px] font-semibold leading-tight line-clamp-4 drop-shadow-sm">
        {title}
      </p>
    </div>
  )
}

export default function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full flex flex-col gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-border/40 group-hover:-translate-y-1 group-hover:shadow-lg dark:group-hover:shadow-blue-900/20 transition-all duration-200 bg-muted">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <CoverPlaceholder title={book.title} />
        )}
        <span
          className={`absolute top-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none backdrop-blur-sm ${STATUS_COLORS[book.status]}`}
        >
          {STATUS_LABELS[book.status]}
        </span>
      </div>

      {/* Meta */}
      <div className="px-0.5 space-y-0.5">
        <p className="text-[13px] font-medium text-foreground leading-snug line-clamp-2">
          {book.title}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{book.author}</p>
        <div className="pt-0.5">
          <RatingStars value={book.rating} readonly size="sm" />
        </div>
      </div>
    </button>
  )
}
