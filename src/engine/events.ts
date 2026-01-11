import type { ScheduledEvent, SimulationState, Message } from "./types";
import { scheduleEvent } from "./scheduler";
import { hasDeliverableMessage } from "./queue";

function maybeScheduleDeliver(state: SimulationState) {
    if (!hasDeliverableMessage(state))
        return;

    // prevent double scheduling
    const alreadyScheduled = state.eventQueue.some(
        e => e.type === "DELIVER" && e.at === state.now
    );

    if (alreadyScheduled)
        return;

    scheduleEvent(state, {
        at: state.now,
        type: "DELIVER",
        payload: { consumerId: "c1" },
    });
}

function handleEnqueue(
    state: SimulationState,
    event: ScheduledEvent<{ payload: string }>
) {
    const message: Message = {
        id: crypto.randomUUID(),
        payload: event.payload.payload,
        state: "queued",
        deliveryCount: 0,
        visibleAt: state.now
    };

    state.queue.messages.push(message);
    maybeScheduleDeliver(state);
}

function handleDeliver(
    state: SimulationState,
    event: ScheduledEvent<{ consumerId: string }>
) {
    const consumer = state.consumers.find(
        c => c.id === event.payload.consumerId
    );
    
    const message = state.queue.messages.find(
        m => m.state === "queued" && m.visibleAt <= state.now
    );

    if (!message || !consumer)
        return;

    if (consumer.inFlight >= consumer.concurrency)
        return;

    message.state = "in_flight";
    message.deliveryCount += 1;
    message.lastDeliveredAt = state.now;

    // schedule processing completion
    scheduleEvent(state, {
        at: state.now + state.queue.config.visibilityTimeoutMs,
        type: "PROCESS_RESULT",
        payload: { messageId: message.id,consumerId: consumer.id }
    });

    maybeScheduleDeliver(state);
}

function handleProcessResult(
     state: SimulationState,
        event: ScheduledEvent<{ messageId: string; consumerId: string }>
) {
    const consumer = state.consumers.find(
        c => c.id === event.payload.consumerId
    );
    
    const message = state.queue.messages.find(
        m => m.state === "queued" && m.visibleAt <= state.now
    );

    if (!message || !consumer)
        return;
    
    if (message.state !== "in_flight")
        return;

    consumer.inFlight = -1;

    const succeded = Math.random() < consumer.successRate;

    if (succeded)
        message.state = "acked";

    maybeScheduleDeliver(state);
}

function handleVisibilityTimeout(
    state: SimulationState,
    event: ScheduledEvent<{ messageId: string }>
) {
    const message = state.queue.messages.find(
        m => m.id === event.payload.messageId
    );

    if (!message || message?.state !== "in_flight")
        return;

    if (message.deliveryCount >= state.queue.config.maxRetries) {
        message.state = "dead_lettered";
        state.queue.dlq.push(message);
    } else {
        message.state = "queued";
        message.visibleAt = state.now;
        maybeScheduleDeliver(state);
    }
}

export function dispatchEvent(
    state: SimulationState,
    event: ScheduledEvent
) {
    switch(event.type) {
        case "ENQUEUE":
            handleEnqueue(
                state, 
                event as ScheduledEvent<{ payload: string }>
            );
            return;
            
        case "DELIVER":
            handleDeliver(
                state, 
                event as ScheduledEvent<{ consumerId: string }>
            );
            return;

        case "VISIBILITY_TIMEOUT":
            handleVisibilityTimeout(
                state, 
                event as ScheduledEvent<{ messageId: string }>
            );
            return;

        case "PROCESS_RESULT":
            handleProcessResult(
                state, 
                event as ScheduledEvent<{ messageId: string, consumerId: string }>
            );
            return;

        default:
            return;
    }
}