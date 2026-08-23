'use client'

import Pusher from 'pusher-js'
import { useEffect } from 'react'

export function useBoardLive(boardId: string, onEvent: () => void) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu'
    if (key) {
      const pusher = new Pusher(key, { cluster })
      const channel = pusher.subscribe(`quadro-${boardId}`)
      channel.bind('board', () => onEvent())
      return () => {
        channel.unbind_all()
        pusher.unsubscribe(`quadro-${boardId}`)
        pusher.disconnect()
      }
    }

    const source = new EventSource(`/api/realtime?boardId=${boardId}`)
    source.onmessage = () => onEvent()
    return () => source.close()
  }, [boardId, onEvent])
}
