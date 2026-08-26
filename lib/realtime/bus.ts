import { EventEmitter } from "node:events";

/**
 * Same-instance shortcut.
 *
 * The SSE route tails Redis on a timer, which is what makes fan-out work
 * across instances. But when the writer and the reader happen to be the same
 * Node process — local dev, or two viewers who landed on one warm instance —
 * waiting out the tick is latency for nothing. A write pings this emitter and
 * any stream on the same instance tails immediately.
 *
 * It is an optimisation, never the transport. Correctness lives in the tail.
 */
const globalForBus = globalThis as unknown as { __cohortBus?: EventEmitter };

export const bus =
  globalForBus.__cohortBus ??
  (globalForBus.__cohortBus = new EventEmitter().setMaxListeners(0));

export function poke(channelId: string): void {
  bus.emit(`channel:${channelId}`);
}

export function onPoke(channelId: string, fn: () => void): () => void {
  const event = `channel:${channelId}`;
  bus.on(event, fn);
  return () => bus.off(event, fn);
}
