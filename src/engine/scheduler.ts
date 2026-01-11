import type { ScheduledEvent, SimulationState } from "./types";

export function scheduleEvent(
    state: SimulationState,
    event: ScheduledEvent
) {
    state.eventQueue.push(event);
    state.eventQueue.sort((a, b) => a.at - b.at);
}

export function popNextEvent(
    state: SimulationState
): ScheduledEvent | null {
    if (state.eventQueue.length === 0) 
        return null;

    return state.eventQueue.shift()!;
}