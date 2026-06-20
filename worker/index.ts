/// <reference types="@cloudflare/workers-types" />
// Custom OpenNext worker: re-uses the generated Next.js fetch handler and adds
// a WebSocket route backed by the CursorRoom Durable Object.
// See https://opennext.js.org/cloudflare/howtos/custom-worker

// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from '../.open-next/worker.js'
import { CURSOR_PATH } from '../lib/os/cursor-protocol'
import { CursorRoom } from './cursor-room'

interface WorkerEnv {
  CURSOR_ROOM: DurableObjectNamespace
}

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)

    if (
      url.pathname === CURSOR_PATH &&
      request.headers.get('Upgrade') === 'websocket'
    ) {
      // Single shared room for the whole site.
      const stub = env.CURSOR_ROOM.get(env.CURSOR_ROOM.idFromName('lobby'))
      return stub.fetch(request)
    }

    // @ts-ignore handler types are resolved from the generated worker
    return handler.fetch(request, env, ctx)
  },
}

export { CursorRoom }
