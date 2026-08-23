import { logActivity } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { publishBoard } from '@/lib/realtime'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const card = await prisma.card.findUnique({ where: { id }, include: { list: true } })
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'file' }, { status: 400 })
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${Date.now()}-${safe}`
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
  const url = `/uploads/${filename}`
  const attachment = await prisma.attachment.create({
    data: { cardId: id, filename: file.name, url },
  })
  await logActivity(
    card.list.boardId,
    'attach',
    `Anexo em ${card.title}: ${file.name}`,
    `Attachment on ${card.titleEn}: ${file.name}`,
    id,
  )
  await publishBoard(card.list.boardId, { type: 'refresh' })
  return NextResponse.json(attachment)
}
