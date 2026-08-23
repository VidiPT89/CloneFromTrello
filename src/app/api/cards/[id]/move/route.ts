import { logActivity, reorderCards } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { publishBoard } from '@/lib/realtime'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = (await request.json()) as {
    listId?: string
    orderedIds?: string[]
    sourceListId?: string
    sourceOrderedIds?: string[]
  }
  if (!body.listId || !body.orderedIds) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const card = await prisma.card.findUnique({ where: { id }, include: { list: true } })
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })
  const target = await prisma.list.findUnique({ where: { id: body.listId } })
  if (!target) return NextResponse.json({ error: 'list' }, { status: 404 })

  if (body.sourceListId && body.sourceOrderedIds && body.sourceListId !== body.listId) {
    await reorderCards(body.sourceListId, body.sourceOrderedIds)
  }
  await reorderCards(body.listId, body.orderedIds)
  if (card.listId !== body.listId) {
    await logActivity(
      target.boardId,
      'move',
      `Cartão movido: ${card.title} → ${target.title}`,
      `Card moved: ${card.titleEn} → ${target.titleEn}`,
      id,
    )
  }
  await publishBoard(target.boardId, { type: 'refresh' })
  return NextResponse.json({ ok: true })
}
