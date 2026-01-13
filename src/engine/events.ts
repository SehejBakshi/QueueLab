import type { ScheduledEvent, SimulationState, Message } from "./types";
import { scheduleEvent } from "./scheduler";
import { hasDeliverableMessage } from "./queue";
import type { RuleExplanation } from "./rules";

function maybeScheduleDeliver(state: SimulationState) {
    if (!hasDeliverableMessage(state))
        return;

    // prevent double scheduling
    const alreadyScheduled = state.eventQueue.some(
        e => e.type === "DELIVER" && e.at >= state.now
    );

    if (alreadyScheduled)
        return;

    scheduleEvent(state, {
        at: state.now,
        type: "DELIVER",
        payload: { consumerId: "c1" },
    });
}

function pushRule(state: SimulationState, rule: RuleExplanation) {
    state.ruleLog.push(rule);
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

    pushRule(state, {
        messageId: message.id,
        type: "ENQUEUE",
        text: "Message enqueued into the queue",
    });

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

    consumer.inFlight += 1;

    message.state = "in_flight";
    // message.consumerId = consumer.id;
    message.deliveryCount += 1;
    message.lastDeliveredAt = state.now;

    pushRule(state, {
        messageId: message.id,
        type: "DELIVER",
        text: "Message delivered to consumer (at-least-once delivery)",
    });

    // processing completion
    scheduleEvent(state, {
        at: state.now + consumer.processingTimeMs,
        type: "PROCESS_RESULT",
        payload: { messageId: message.id, consumerId: consumer.id }
    });

    // visibility timeout
    scheduleEvent(state, {
        at: state.now + state.queue.config.visibilityTimeoutMs,
        type: "VISIBILITY_TIMEOUT",
        payload: { messageId: message.id }
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
        m => m.id === event.payload.messageId
    );

    if (!message || !consumer || message.state !== "in_flight")
        return;

    consumer.inFlight -= 1;

    const succeeded = Math.random() < consumer.successRate;

    if (succeeded) {
        message.state = "acked";
        // message.consumerId = undefined;

        pushRule(state, {
            messageId: message.id,
            type: "PROCESS_SUCCESS",
            text: "Message acknowledged and removed from the queue",
        });

        maybeScheduleDeliver(state);
        return;
    }

    pushRule(state, {
        messageId: message.id,
        type: "PROCESS_FAIL",
        text: "Message processing failed, waiting for visibility timeout",
    });
}

function handleVisibilityTimeout(
    state: SimulationState,
    event: ScheduledEvent<{ messageId: string }>
) {
    const message = state.queue.messages.find(
        m => m.id === event.payload.messageId
    );

    if (!message || message.state !== "in_flight")
        return;

    if (message.deliveryCount >= state.queue.config.maxRetries) {
        message.state = "dead_lettered";
        state.queue.dlq.push(message);
        // message.consumerId = undefined;
        
        state.queue.messages = state.queue.messages.filter(
            m => m.id !== message.id
        )
 
        pushRule(state, {
            messageId: message.id,
            type: "DLQ",
            text: `Message exceeded max retries (${state.queue.config.maxRetries}), sent to DLQ`,
        });
        
        maybeScheduleDeliver(state);
        return;
    } 
    
    // message.consumerId = undefined;
    message.state = "queued";
    message.visibleAt = state.now;

    pushRule(state, {
        messageId: message.id,
        type: "VISIBILITY_TIMEOUT",
        text: "Visibility timeout expired, message returned to queue",
    });

    maybeScheduleDeliver(state);
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