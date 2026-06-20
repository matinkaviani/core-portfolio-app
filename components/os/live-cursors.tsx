'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CURSOR_PATH,
  type PeerState,
  type ServerMessage,
} from '@/lib/os/cursor-protocol'

const SEND_INTERVAL_MS = 45
const MAX_INITIAL_ATTEMPTS = 4

type Peers = Record<string, PeerState>

export function LiveCursors() {
  const [peers, setPeers] = useState<Peers>({})
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setViewport({ w: window.innerWidth, h: window.innerHeight })
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)

    let closedByUs = false
    let everConnected = false
    let attempts = 0
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let lastSent = 0
    let pending: { x: number; y: number } | null = null

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}${CURSOR_PATH}`

    const connect = () => {
      let ws: WebSocket
      try {
        ws = new WebSocket(url)
      } catch {
        return
      }
      wsRef.current = ws

      ws.onopen = () => {
        everConnected = true
        attempts = 0
      }

      ws.onmessage = (event) => {
        let msg: ServerMessage
        try {
          msg = JSON.parse(event.data as string)
        } catch {
          return
        }
        switch (msg.t) {
          case 'welcome': {
            const next: Peers = {}
            for (const p of msg.peers) next[p.id] = p
            setPeers(next)
            break
          }
          case 'join':
            setPeers((prev) => ({ ...prev, [msg.peer.id]: msg.peer }))
            break
          case 'move':
            setPeers((prev) =>
              prev[msg.id]
                ? { ...prev, [msg.id]: { ...prev[msg.id], x: msg.x, y: msg.y } }
                : prev,
            )
            break
          case 'leave':
            setPeers((prev) => {
              if (!prev[msg.id]) return prev
              const next = { ...prev }
              delete next[msg.id]
              return next
            })
            break
        }
      }

      ws.onerror = () => ws.close()

      ws.onclose = () => {
        wsRef.current = null
        setPeers({})
        if (closedByUs) return
        // Stop retrying if we never reached the server (e.g. local dev has no DO).
        if (!everConnected && attempts >= MAX_INITIAL_ATTEMPTS) return
        attempts += 1
        const delay = Math.min(1000 * 2 ** attempts, 15000)
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      pending = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      const now = performance.now()
      if (now - lastSent < SEND_INTERVAL_MS) return
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN || !pending) return
      lastSent = now
      ws.send(JSON.stringify({ t: 'move', x: pending.x, y: pending.y }))
    }

    window.addEventListener('pointermove', onPointerMove)
    connect()

    return () => {
      closedByUs = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  const list = Object.values(peers)

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-95 overflow-hidden"
      >
        <AnimatePresence>
          {list.map((peer) => (
            <motion.div
              key={peer.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: peer.x * viewport.w,
                y: peer.y * viewport.h,
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{
                x: { type: 'spring', stiffness: 700, damping: 40, mass: 0.4 },
                y: { type: 'spring', stiffness: 700, damping: 40, mass: 0.4 },
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
              }}
              className="absolute left-0 top-0"
            >
              <CursorGlyph color={peer.color} />
              <span
                className="ml-3 mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-sm"
                style={{ backgroundColor: peer.color }}
              >
                {peer.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {list.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-4 left-4 z-70 flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-foreground/80 shadow-lg backdrop-blur-md"
          >
            <span className="flex -space-x-1">
              {list.slice(0, 4).map((p) => (
                <span
                  key={p.id}
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-card"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </span>
            <span className="font-mono">
              {list.length} {list.length === 1 ? 'other' : 'others'} here
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function CursorGlyph({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="drop-shadow-md"
    >
      <path
        d="M5 3l14 8.5-6.2 1.3L9.5 19 5 3z"
        fill={color}
        stroke="white"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
