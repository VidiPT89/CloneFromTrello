import { boardInclude } from '@/lib/board'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const board = await prisma.board.findUnique({ where: { id }, include: boardInclude })
  if (!board) return NextResponse.json({ error: 'missing' }, { status: 404 })
  return NextResponse.json(board)
}
