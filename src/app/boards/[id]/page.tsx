import { BoardDesk } from '@/components/board/BoardDesk'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BoardDesk boardId={id} />
}
