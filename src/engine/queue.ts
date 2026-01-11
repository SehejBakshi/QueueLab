import type { SimulationState } from "./types";

export function hasDeliverableMessage(state: SimulationState): boolean {
    return state.queue.messages.some(
        m => m.state === "queued" && m.visibleAt <= state.now
    );
}