import { logActivity } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { publishBoard } from '@/lib/realtime'
import { NextResponse } from 'next/server'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = (await request.json()) as { memberId?: string; body?: string }
  if (!body.memberId || !body.body?.trim()) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const card = await prisma.card.findUnique({ where: { id }, include: { list: true } })
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })
  const comment = await prisma.comment.create({
    data: { cardId: id, memberId: body.memberId, body: body.body.trim() },
    include: { member: true },
  })
  await logActivity(
    card.list.boardId,
    'comment',
    `Comentário em ${card.title}`,
    `Comment on ${card.titleEn}`,
    id,
  )
  await publishBoard(card.list.boardId, { type: 'refresh' })
  return NextResponse.json(comment)
}
