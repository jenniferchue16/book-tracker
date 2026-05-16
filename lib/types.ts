import type { Document } from 'mongoose'

export type BookStatus = 'want-to-read' | 'borrowed' | 'reading' | 'finished'

export interface IBook extends Document {
  title: string
  author: string
  coverUrl: string
  openLibraryKey: string
  status: BookStatus
  rating: number
  notes: string
  publishedYear?: number
  pages?: number
  tropes?: string[]
  description?: string
  dateStarted?: Date
  dateCompleted?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Book {
  _id: string
  title: string
  author: string
  coverUrl: string
  openLibraryKey: string
  status: BookStatus
  rating: number
  notes: string
  publishedYear?: number
  pages?: number
  tropes?: string[]
  description?: string
  dateStarted?: string
  dateCompleted?: string
  createdAt: string
  updatedAt: string
}

export interface OpenLibraryDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  number_of_pages_median?: number
}
