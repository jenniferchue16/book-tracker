import Image from 'next/image'
import type { Book, BookStatus } from '@/lib/types'
import RatingStars from './RatingStars'

const STATUS_LABELS: Record<BookStatus, string> = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished',
}

const STATUS_COLORS: Record<BookStatus, string> = {
  'want-to-read': 'bg-sky-100 text-sky-700',
  reading: 'bg-amber-100 text-amber-700',
  finished: 'bg-emerald-100 text-emerald-700',
}

function CoverPlaceholder({ title }: { title: string }) {
  const colors = [
    'from-violet-400 to-purple-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-teal-400 to-emerald-600',
    'from-sky-400 to-blue-600',
    'from-fuchsia-400 to-rose-600',
  ]
  const color = colors[title.charCodeAt(0) % colors.length]
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${color} flex items-end p-3`}
    >
      <p className="text-white text-xs font-semibold leading-tight line-clamp-4 drop-shadow">
        {title}
      </p>
    </div>
  )
}

interface Props {
  book: Book
  onClick: () => void
}

export default function BookCard({ book, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full flex flex-col gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-200 bg-gray-100">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <CoverPlaceholder title={book.title} />
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}
        >
          {STATUS_LABELS[book.status]}
        </span>
      </div>

      {/* Meta */}
      <div className="px-0.5">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {book.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
        <div className="mt-1">
          <RatingStars value={book.rating} readonly size="sm" />
        </div>
      </div>
    </button>
  )
}
