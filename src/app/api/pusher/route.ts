import { NextResponse } from 'next/server'
import { pusherPublicConfig } from '@/lib/realtime'

export async function GET() {
  return NextResponse.json(pusherPublicConfig())
}
