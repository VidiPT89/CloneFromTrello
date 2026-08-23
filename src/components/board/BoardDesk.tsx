'use client'

import { CardModal } from '@/components/board/CardModal'
import { useLocale } from '@/i18n/LocaleProvider'
import { readJson } from '@/lib/http'
import { useBoardLive } from '@/lib/live'
import type { BoardRow, CardRow, Member } from '@/lib/types'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useState } from 'react'

function SortableCard({ card, locale, onOpen }: { card: CardRow; locale: string; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-full rounded-2xl border border-[#f4e6c8]/12 bg-black/70 p-3 text-left ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      type="button"
    >
      <p className="font-semibold">{locale === 'en' ? card.titleEn : card.title}</p>
      <div className="mt-2 flex gap-1">
        {card.assignees.map((row) => (
          <span
            key={row.member.id}
            className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-black"
            style={{ background: row.member.hue }}
          >
            {row.member.initials}
          </span>
        ))}
      </div>
    </button>
  )
}

function Lane({
  id,
  title,
  cards,
  locale,
  empty,
  addLabel,
  onAdd,
  onOpen,
}: {
  id: string
  title: string
  cards: CardRow[]
  locale: string
  empty: string
  addLabel: string
  onAdd: (title: string) => void
  onOpen: (card: CardRow) => void
}) {
  const { setNodeRef } = useDroppable({ id })
  const [draft, setDraft] = useState('')
  const { attributes, listeners, setNodeRef: setSortRef, transform, transition } = useSortable({ id: `list-${id}` })

  return (
    <article
      ref={setSortRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="lane rounded-[28px] border border-[#f4e6c8]/12 bg-black/40 p-4"
    >
      <h2 className="display cursor-grab text-2xl uppercase text-[#ffaa00]" {...attributes} {...listeners}>
        {title}
      </h2>
      <div ref={setNodeRef} className="mt-3 min-h-24 space-y-2">
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} locale={locale} onOpen={() => onOpen(card)} />
          ))}
        </SortableContext>
        {cards.length === 0 ? <p className="text-sm text-[#f4e6c8]/45">{empty}</p> : null}
      </div>
      <form
        className="mt-3"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          if (!draft.trim()) return
          onAdd(draft.trim())
          setDraft('')
        }}
      >
        <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={addLabel} />
      </form>
    </article>
  )
}

export function BoardDesk({ boardId }: { boardId: string }) {
  const { t, locale } = useLocale()
  const [board, setBoard] = useState<BoardRow | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [memberId, setMemberId] = useState('')
  const [open, setOpen] = useState<CardRow | null>(null)
  const [listTitle, setListTitle] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const load = useCallback(async () => {
    const next = await readJson<BoardRow | null>(await fetch(`/api/boards/${boardId}`), null)
    setBoard(next)
    setOpen((current) => {
      if (!current || !next) return current
      return next.lists.flatMap((list) => list.cards).find((card) => card.id === current.id) || current
    })
  }, [boardId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void (async () => {
      const rows = await readJson<Member[]>(await fetch('/api/members'), [])
      setMembers(rows)
      const stored = localStorage.getItem('quadro-member')
      setMemberId(stored && rows.some((row) => row.id === stored) ? stored : rows[0]?.id || '')
    })()
  }, [])

  useBoardLive(boardId, () => {
    void load()
  })

  async function addList(event: FormEvent) {
    event.preventDefault()
    await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, title: listTitle, titleEn: listTitle }),
    })
    setListTitle('')
    await load()
  }

  async function addCard(listId: string, title: string) {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, title, titleEn: title }),
    })
    await load()
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!board) return
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId.startsWith('list-') && overId.startsWith('list-')) {
      const ids = board.lists.map((list) => `list-${list.id}`)
      const oldIndex = ids.indexOf(activeId)
      const newIndex = ids.indexOf(overId)
      if (oldIndex < 0 || newIndex < 0) return
      const next = arrayMove(board.lists, oldIndex, newIndex)
      setBoard({ ...board, lists: next })
      await fetch('/api/lists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, orderedIds: next.map((list) => list.id) }),
      })
      return
    }

    const lists = board.lists.map((list) => ({ ...list, cards: [...list.cards] }))
    const from = lists.find((list) => list.cards.some((card) => card.id === activeId))
    if (!from) return
    const card = from.cards.find((item) => item.id === activeId)!
    const sourceListId = from.id
    from.cards = from.cards.filter((item) => item.id !== activeId)

    const overList = lists.find((list) => list.id === overId || list.cards.some((item) => item.id === overId))
    if (!overList) return
    const index = overList.cards.findIndex((item) => item.id === overId)
    overList.cards.splice(index < 0 ? overList.cards.length : index, 0, { ...card, listId: overList.id })
    setBoard({ ...board, lists })
    await fetch(`/api/cards/${card.id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listId: overList.id,
        orderedIds: overList.cards.map((item) => item.id),
        sourceListId,
        sourceOrderedIds: from.cards.map((item) => item.id),
      }),
    })
  }

  if (!board) return <p>…</p>

  const live = process.env.NEXT_PUBLIC_PUSHER_KEY ? t.pusherLive : t.localLive

  return (
    <div>
      <Link href="/" className="text-sm text-[#ff7a00]">
        ← {t.boards}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#ff7a00]">{t.live}: {live}</p>
          <h1 className="display mt-2 text-5xl uppercase text-[#ffaa00]">{locale === 'en' ? board.titleEn : board.title}</h1>
          <p className="mt-2 max-w-2xl text-[#f4e6c8]/70">{locale === 'en' ? board.descriptionEn : board.description}</p>
          <p className="mt-3 text-sm text-[#f4e6c8]/55">{t.moveHint}</p>
        </div>
        <label className="text-sm">
          {t.iAm}
          <select
            className="field mt-1"
            value={memberId}
            onChange={(event) => {
              setMemberId(event.target.value)
              localStorage.setItem('quadro-member', event.target.value)
            }}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={addList} className="mt-6 flex gap-2">
        <input className="field max-w-xs" value={listTitle} onChange={(e) => setListTitle(e.target.value)} placeholder={t.addList} />
        <button className="btn" type="submit">
          {t.addList}
        </button>
      </form>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={(event) => void onDragEnd(event)}>
        <SortableContext items={board.lists.map((list) => `list-${list.id}`)} strategy={horizontalListSortingStrategy}>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-8">
            {board.lists.map((list, index) => (
              <motion.div key={list.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Lane
                  id={list.id}
                  title={locale === 'en' ? list.titleEn : list.title}
                  cards={list.cards}
                  locale={locale}
                  empty={t.emptyList}
                  addLabel={t.addCard}
                  onAdd={(title) => void addCard(list.id, title)}
                  onOpen={setOpen}
                />
              </motion.div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <aside className="mt-4 rounded-[28px] border border-[#f4e6c8]/12 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#ffaa00]">{t.activity}</p>
        <ul className="mt-3 space-y-2 text-sm text-[#f4e6c8]/75">
          {board.activities.map((row) => (
            <li key={row.id}>{locale === 'en' ? row.messageEn : row.message}</li>
          ))}
        </ul>
      </aside>

      {open ? (
        <CardModal
          card={open}
          members={members}
          memberId={memberId}
          onClose={() => setOpen(null)}
          onChanged={() => void load()}
        />
      ) : null}
    </div>
  )
}
