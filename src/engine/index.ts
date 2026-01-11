import type { SimulationState } from "./types";
import { dispatchEvent } from "./events";
import { popNextEvent } from "./scheduler";

export function createInitialState(): SimulationState {
  return {
    now: 0,
    queue: {
        messages: [],
        dlq: [],
        config: {
            visibilityTimeoutMs: 6000,
            maxRetries: 3,
        },
    },
    consumers: [
      {
        id: "c1",
        concurrency: 1,
        inFlight: 0,
        processingTimeMs: 1500,
        successRate: 0.3
      }
    ],
    eventQueue: [],
    ruleLog: [],
  };
}

export function runNextEvent(state: SimulationState): boolean {
    const event = popNextEvent(state);
    if (!event)
        return false;

    state.now = event.at;
    dispatchEvent(state, event);
    return true;
}