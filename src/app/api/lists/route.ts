import { logActivity } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { publishBoard } from '@/lib/realtime'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = (await request.json()) as { boardId?: string; title?: string; titleEn?: string }
  if (!body.boardId || !body.title?.trim()) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const last = await prisma.list.findFirst({
    where: { boardId: body.boardId },
    orderBy: { sortOrder: 'desc' },
  })
  const list = await prisma.list.create({
    data: {
      boardId: body.boardId,
      title: body.title.trim(),
      titleEn: (body.titleEn || body.title).trim(),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  })
  await logActivity(body.boardId, 'list', `Lista criada: ${list.title}`, `List created: ${list.titleEn}`)
  await publishBoard(body.boardId, { type: 'refresh' })
  return NextResponse.json(list)
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { boardId?: string; orderedIds?: string[] }
  if (!body.boardId || !body.orderedIds) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await prisma.$transaction(
    body.orderedIds.map((id, index) => prisma.list.update({ where: { id }, data: { sortOrder: index } })),
  )
  await publishBoard(body.boardId, { type: 'refresh' })
  return NextResponse.json({ ok: true })
}
