import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const boardId = new URL(request.url).searchParams.get('boardId')
  if (!boardId) return NextResponse.json([])
  const rows = await prisma.activity.findMany({
    where: { boardId },
    orderBy: { createdAt: 'desc' },
    take: 40,
  })
  return NextResponse.json(rows)
}
