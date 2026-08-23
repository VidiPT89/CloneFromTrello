import { logActivity } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { publishBoard } from '@/lib/realtime'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = (await request.json()) as {
    title?: string
    titleEn?: string
    description?: string
    descriptionEn?: string
    assigneeIds?: string[]
  }
  const card = await prisma.card.findUnique({ where: { id }, include: { list: true } })
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })

  const updated = await prisma.card.update({
    where: { id },
    data: {
      title: body.title?.trim() ?? card.title,
      titleEn: body.titleEn?.trim() ?? card.titleEn,
      description: body.description ?? card.description,
      descriptionEn: body.descriptionEn ?? card.descriptionEn,
    },
  })

  if (body.assigneeIds) {
    await prisma.cardAssignee.deleteMany({ where: { cardId: id } })
    if (body.assigneeIds.length) {
      await prisma.cardAssignee.createMany({
        data: body.assigneeIds.map((memberId) => ({ cardId: id, memberId })),
      })
    }
    await logActivity(
      card.list.boardId,
      'assign',
      `Responsáveis actualizados em ${card.title}`,
      `Assignees updated on ${card.titleEn}`,
      id,
    )
  }

  await publishBoard(card.list.boardId, { type: 'refresh' })
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const card = await prisma.card.findUnique({ where: { id }, include: { list: true } })
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })
  await prisma.card.delete({ where: { id } })
  await logActivity(card.list.boardId, 'delete', `Cartão apagado: ${card.title}`, `Card deleted: ${card.titleEn}`)
  await publishBoard(card.list.boardId, { type: 'refresh' })
  return NextResponse.json({ ok: true })
}
