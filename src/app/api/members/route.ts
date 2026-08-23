import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const members = await prisma.member.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(members)
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string }
  const name = (body.name || '').trim()
  if (!name) return NextResponse.json({ error: 'name' }, { status: 400 })
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  const member = await prisma.member.create({
    data: { name, initials: initials || 'XX', hue: '#ff7a00' },
  })
  return NextResponse.json(member)
}
