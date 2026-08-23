export function placeCard(ids: string[], cardId: string, index: number) {
  const next = ids.filter((id) => id !== cardId)
  const clamped = Math.max(0, Math.min(index, next.length))
  next.splice(clamped, 0, cardId)
  return next
}
