import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Book from '@/lib/models/Book'

export async function GET() {
  await connectDB()
  const books = await Book.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json({ books })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, author, coverUrl, openLibraryKey, publishedYear } = body

  if (!title || !author) {
    return NextResponse.json({ error: 'title and author are required' }, { status: 400 })
  }

  await connectDB()

  if (openLibraryKey) {
    const existing = await Book.findOne({ openLibraryKey }).lean()
    if (existing) {
      return NextResponse.json({ error: 'Book already in library' }, { status: 409 })
    }
  }

  const book = await Book.create({
    title,
    author,
    coverUrl: coverUrl || '',
    openLibraryKey: openLibraryKey || '',
    publishedYear,
    status: 'want-to-read',
    rating: 0,
    notes: '',
  })

  return NextResponse.json({ book }, { status: 201 })
}
