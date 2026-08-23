export type Member = { id: string; name: string; initials: string; hue: string }

export type CommentRow = { id: string; body: string; createdAt: string; member: Member }

export type AttachmentRow = { id: string; filename: string; url: string }

export type CardRow = {
  id: string
  listId: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  sortOrder: number
  assignees: { member: Member }[]
  comments: CommentRow[]
  attachments: AttachmentRow[]
}

export type ListRow = {
  id: string
  title: string
  titleEn: string
  sortOrder: number
  cards: CardRow[]
}

export type ActivityRow = {
  id: string
  kind: string
  message: string
  messageEn: string
  createdAt: string
}

export type BoardRow = {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  lists: ListRow[]
  activities: ActivityRow[]
}
