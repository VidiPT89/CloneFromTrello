'use client'

import { readJson } from '@/lib/http'
import { useLocale } from '@/i18n/LocaleProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

type BoardRow = {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  _count: { lists: number }
}

async function fetchBoards(): Promise<BoardRow[]> {
  return readJson<BoardRow[]>(await fetch('/api/boards'), [])
}

export function BoardsDesk() {
  const { t, locale } = useLocale()
  const [boards, setBoards] = useState<BoardRow[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function load() {
    setBoards(await fetchBoards())
  }

  useEffect(() => {
    let ignore = false
    fetchBoards()
      .then((rows) => {
        if (!ignore) setBoards(rows)
      })
      .catch(() => {
        /* offline: no boards to show */
      })
    return () => {
      ignore = true
    }
  }, [])

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, titleEn: title, description, descriptionEn: description }),
    })
    setTitle('')
    setDescription('')
    await load()
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-[#ff7a00]">{t.boards}</p>
      <h1 className="display mt-3 text-6xl uppercase text-[#ffaa00]">{t.brand}</h1>
      <p className="mt-4 max-w-2xl text-[#f4e6c8]/75">{t.tagline}</p>

      <form onSubmit={onCreate} className="mt-10 grid gap-3 rounded-[28px] border border-[#f4e6c8]/12 bg-black/40 p-6 md:grid-cols-[1fr_1fr_auto]">
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.boardTitle} required />
        <input className="field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.boardLead} />
        <button className="btn" type="submit">
          {t.newBoard}
        </button>
      </form>

      {boards.length === 0 ? <p className="mt-8 text-[#f4e6c8]/60">{t.emptyBoards}</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {boards.map((board, index) => (
          <motion.article
            key={board.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-[28px] border border-[#f4e6c8]/12 bg-black/45 p-6"
          >
            <h2 className="display text-3xl uppercase">{locale === 'en' ? board.titleEn : board.title}</h2>
            <p className="mt-2 text-[#f4e6c8]/70">{locale === 'en' ? board.descriptionEn : board.description}</p>
            <p className="mt-4 text-sm text-[#ffaa00]">
              {board._count.lists} {t.lists}
            </p>
            <Link href={`/boards/${board.id}`} className="btn mt-5 inline-block">
              {t.open}
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
