import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export const boardInclude = {
  lists: {
    orderBy: { sortOrder: 'asc' },
    include: {
      cards: {
        orderBy: { sortOrder: 'asc' },
        include: {
          assignees: { include: { member: true } },
          comments: { include: { member: true }, orderBy: { createdAt: 'asc' } },
          attachments: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  },
  activities: { orderBy: { createdAt: 'desc' }, take: 40 },
} satisfies Prisma.BoardInclude

export type BoardPayload = Prisma.BoardGetPayload<{ include: typeof boardInclude }>

export async function logActivity(
  boardId: string,
  kind: string,
  message: string,
  messageEn: string,
  cardId?: string,
) {
  await prisma.activity.create({
    data: { boardId, kind, message, messageEn, cardId },
  })
}

export async function reorderCards(listId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.card.update({ where: { id }, data: { listId, sortOrder: index } }),
    ),
  )
}
