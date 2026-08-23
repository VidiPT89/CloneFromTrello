import Pusher from 'pusher'

type Listener = (payload: unknown) => void

const listeners = new Map<string, Set<Listener>>()

function pusherReady() {
  return Boolean(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET)
}

export function channelName(boardId: string) {
  return `quadro-${boardId}`
}

export function subscribeBoard(boardId: string, listener: Listener) {
  const key = channelName(boardId)
  const set = listeners.get(key) ?? new Set()
  set.add(listener)
  listeners.set(key, set)
  return () => {
    set.delete(listener)
  }
}

export async function publishBoard(boardId: string, payload: unknown) {
  const key = channelName(boardId)
  const set = listeners.get(key)
  if (set) {
    for (const listener of set) listener(payload)
  }

  if (!pusherReady()) return

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER || 'eu',
    useTLS: true,
  })
  await pusher.trigger(key, 'board', payload)
}

export function pusherPublicConfig() {
  return {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  }
}
