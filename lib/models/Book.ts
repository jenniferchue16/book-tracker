import mongoose, { Schema } from 'mongoose'
import type { IBook } from '@/lib/types'

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverUrl: { type: String, default: '' },
    openLibraryKey: { type: String, default: '' },
    status: {
      type: String,
      enum: ['want-to-read', 'reading', 'finished'],
      default: 'want-to-read',
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    notes: { type: String, default: '' },
    publishedYear: { type: Number },
    dateStarted: { type: Date },
    dateCompleted: { type: Date },
  },
  { timestamps: true }
)

// Delete the cached model so schema changes are always picked up (Next.js module caching retains the old schema otherwise)
delete mongoose.models['Book']
export default mongoose.model<IBook>('Book', BookSchema)
