import type { RuleExplanation } from "./rules";

// ---------------------
// Core simulation clock
// ---------------------
export type SimulationTime = number;

// ---------------------
// Messafe lifecyle
// ---------------------
export type MessageState = 
    | "queued"
    | "in_flight"
    | "acked"
    | "dead_lettered";

export type Message = {
    id: string;
    payload: string;
    state: MessageState;
    deliveryCount: number;
    visibleAt: SimulationTime;
    lastDeliveredAt?: SimulationTime;
};

// ---------------------
// Queue configuration
// ---------------------
export type QueueConfig = {
    visibilityTimeoutMs: number;
    maxRetries: number;
};

// ---------------------
// Queue state
// ---------------------
export type QueueState = {
    messages: Message[];
    dlq: Message[];
    config: QueueConfig;
};

// ---------------------
// Consumer model
// ---------------------
export type ConsumerState = {
    id: string;
    concurrency: number;
    inFlight: number;
    processingTimeMs: number;
    successRate: number;
}

// ---------------------
// Event system
// ---------------------
export type EventType = 
    | "ENQUEUE"
    | "DELIVER"
    | "VISIBILITY_TIMEOUT"
    | "PROCESS_RESULT"
    | "REMOVE_ACKED";

export type ScheduledEvent<T = any> = {
    at: SimulationTime;
    type: EventType;
    payload: T;
}

// ---------------------
// Global simulation state
// ---------------------
export type SimulationState = {
    now: SimulationTime;
    queue: QueueState;
    consumers: ConsumerState[];
    eventQueue: ScheduledEvent[];
    ruleLog: RuleExplanation[];
}