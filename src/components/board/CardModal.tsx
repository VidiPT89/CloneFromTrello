'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import type { CardRow, Member } from '@/lib/types'
import { FormEvent, useState } from 'react'

export function CardModal({
  card,
  members,
  memberId,
  onClose,
  onChanged,
}: {
  card: CardRow
  members: Member[]
  memberId: string
  onClose: () => void
  onChanged: () => void
}) {
  const { t, locale } = useLocale()
  const [title, setTitle] = useState(locale === 'en' ? card.titleEn : card.title)
  const [notes, setNotes] = useState(locale === 'en' ? card.descriptionEn : card.description)
  const [assigneeIds, setAssigneeIds] = useState(card.assignees.map((row) => row.member.id))
  const [comment, setComment] = useState('')

  async function save(event: FormEvent) {
    event.preventDefault()
    await fetch(`/api/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        titleEn: title,
        description: notes,
        descriptionEn: notes,
        assigneeIds,
      }),
    })
    onChanged()
  }

  async function sendComment(event: FormEvent) {
    event.preventDefault()
    await fetch(`/api/cards/${card.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, body: comment }),
    })
    setComment('')
    onChanged()
  }

  async function attach(file: File) {
    const form = new FormData()
    form.set('file', file)
    await fetch(`/api/cards/${card.id}/attachments`, { method: 'POST', body: form })
    onChanged()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16">
      <div className="w-full max-w-2xl rounded-[28px] border border-[#f4e6c8]/15 bg-[#0b0704] p-6">
        <form onSubmit={save} className="grid gap-3">
          <input className="field display text-2xl uppercase" aria-label={t.cardTitle} value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="field min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.description} />
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffaa00]">{t.assignees}</p>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const on = assigneeIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm ${on ? 'bg-[#ff7a00] text-black' : 'border border-[#f4e6c8]/20'}`}
                  onClick={() =>
                    setAssigneeIds((current) =>
                      current.includes(member.id) ? current.filter((id) => id !== member.id) : [...current, member.id],
                    )
                  }
                >
                  {member.name}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <button className="btn" type="submit">
              {t.save}
            </button>
            <button className="btn-ghost" type="button" onClick={onClose}>
              {t.cancel}
            </button>
          </div>
        </form>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffaa00]">{t.attachments}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {card.attachments.map((file) => (
              <li key={file.id}>
                <a className="text-[#ff7a00]" href={file.url} target="_blank" rel="noreferrer">
                  {file.filename}
                </a>
              </li>
            ))}
          </ul>
          <input
            className="mt-3 text-sm"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void attach(file)
            }}
          />
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffaa00]">{t.comments}</p>
          <ul className="mt-3 space-y-3">
            {card.comments.map((row) => (
              <li key={row.id} className="rounded-2xl border border-[#f4e6c8]/10 p-3">
                <p className="text-xs text-[#ffaa00]">{row.member.name}</p>
                <p className="mt-1">{row.body}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={sendComment} className="mt-3 flex gap-2">
            <input className="field" value={comment} onChange={(e) => setComment(e.target.value)} required />
            <button className="btn" type="submit">
              {t.comment}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
