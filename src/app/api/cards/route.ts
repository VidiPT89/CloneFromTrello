import { logActivity } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { publishBoard } from '@/lib/realtime'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = (await request.json()) as { listId?: string; title?: string; titleEn?: string }
  if (!body.listId || !body.title?.trim()) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const list = await prisma.list.findUnique({ where: { id: body.listId } })
  if (!list) return NextResponse.json({ error: 'list' }, { status: 404 })
  const last = await prisma.card.findFirst({ where: { listId: body.listId }, orderBy: { sortOrder: 'desc' } })
  const card = await prisma.card.create({
    data: {
      listId: body.listId,
      title: body.title.trim(),
      titleEn: (body.titleEn || body.title).trim(),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  })
  await logActivity(list.boardId, 'create', `Cartão criado: ${card.title}`, `Card created: ${card.titleEn}`, card.id)
  await publishBoard(list.boardId, { type: 'refresh' })
  return NextResponse.json(card)
}
