import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Book from '@/lib/models/Book'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, rating, notes, dateStarted, dateCompleted } = body

  await connectDB()

  const book = await Book.findByIdAndUpdate(
    id,
    {
      ...(status && { status }),
      ...(rating !== undefined && { rating }),
      ...(notes !== undefined && { notes }),
      ...(dateStarted !== undefined && { dateStarted: dateStarted ? new Date(dateStarted) : null }),
      ...(dateCompleted !== undefined && { dateCompleted: dateCompleted ? new Date(dateCompleted) : null }),
    },
    { new: true }
  ).lean()

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  return NextResponse.json({ book })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await connectDB()

  const book = await Book.findByIdAndDelete(id)
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
