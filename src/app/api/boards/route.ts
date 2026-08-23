import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lists: true } } },
  })
  return NextResponse.json(boards)
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string; titleEn?: string; description?: string; descriptionEn?: string }
  const title = (body.title || '').trim()
  if (!title) return NextResponse.json({ error: 'title' }, { status: 400 })
  const board = await prisma.board.create({
    data: {
      title,
      titleEn: (body.titleEn || title).trim(),
      description: (body.description || '').trim(),
      descriptionEn: (body.descriptionEn || body.description || '').trim(),
      lists: {
        create: [
          { title: 'Entrada', titleEn: 'Inbox', sortOrder: 0 },
          { title: 'Em curso', titleEn: 'Doing', sortOrder: 1 },
          { title: 'Feito', titleEn: 'Done', sortOrder: 2 },
        ],
      },
    },
  })
  return NextResponse.json(board)
}
