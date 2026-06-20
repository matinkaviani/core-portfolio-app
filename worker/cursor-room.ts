/// <reference types="@cloudflare/workers-types" />
import { DurableObject } from 'cloudflare:workers'
import {
  pickColor,
  randomLabel,
  type PeerState,
  type ServerMessage,
} from '../lib/os/cursor-protocol'

type Attachment = PeerState

/**
 * One coordination point for all live cursors in a "room".
 * Uses the WebSocket Hibernation API so the instance can sleep while idle
 * without dropping connections.
 */
export class CursorRoom extends DurableObject {
  private seq = 0

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]

    const id = crypto.randomUUID()
    const color = pickColor(this.seq++)
    const provided = new URL(request.url).searchParams.get('name')
    const name = sanitizeName(provided, randomLabel())
    const self: Attachment = { id, color, name, x: 0.5, y: 0.5 }

    // Snapshot existing peers before adding the new connection.
    const peers: PeerState[] = []
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment() as Attachment | null
      if (att) peers.push(att)
    }

    this.ctx.acceptWebSocket(server)
    server.serializeAttachment(self)

    this.send(server, { t: 'welcome', id, color, name, peers })
    this.broadcast({ t: 'join', peer: self }, server)

    return new Response(null, { status: 101, webSocket: client })
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== 'string') return
    let parsed: { t?: string; x?: number; y?: number }
    try {
      parsed = JSON.parse(message)
    } catch {
      return
    }
    if (parsed.t !== 'move') return

    const att = ws.deserializeAttachment() as Attachment | null
    if (!att) return

    const x = clamp01(parsed.x)
    const y = clamp01(parsed.y)
    if (x === null || y === null) return

    att.x = x
    att.y = y
    ws.serializeAttachment(att)
    this.broadcast({ t: 'move', id: att.id, x, y }, ws)
  }

  webSocketClose(ws: WebSocket): void {
    const att = ws.deserializeAttachment() as Attachment | null
    if (att) this.broadcast({ t: 'leave', id: att.id })
  }

  webSocketError(ws: WebSocket): void {
    const att = ws.deserializeAttachment() as Attachment | null
    if (att) this.broadcast({ t: 'leave', id: att.id })
  }

  private send(ws: WebSocket, msg: ServerMessage) {
    try {
      ws.send(JSON.stringify(msg))
    } catch {
      // socket already gone
    }
  }

  private broadcast(msg: ServerMessage, except?: WebSocket) {
    const data = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue
      try {
        ws.send(data)
      } catch {
        // ignore individual send failures
      }
    }
  }
}

function clamp01(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return Math.min(1, Math.max(0, v))
}

function sanitizeName(raw: string | null, fallback: string): string {
  if (!raw) return fallback
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24)
  return cleaned.length > 0 ? cleaned : fallback
}
