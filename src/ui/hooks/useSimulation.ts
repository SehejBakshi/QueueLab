import { useRef, useState, useEffect } from "react";
import { createInitialState, runNextEvent } from "../../engine";
import { scheduleEvent } from "../../engine/scheduler";
import type { SimulationState } from "../../engine/types";

export function useSimulation() {
    const [state, setState] = useState<SimulationState>(() => 
        createInitialState()
    );

    const [injectCount, setInjectCount] = useState(8);

    const runningRef = useRef(true);
    const speedRef = useRef(400);

     const activeRule =
        state.ruleLog.length > 0
            ? state.ruleLog[state.ruleLog.length - 1]
            : null;

    function enqueue(payload: string, count = injectCount) {
        runningRef.current = true;
        setState(prev => {
            const next = structuredClone(prev);
            for(let i=0; i<count; i++) {
                scheduleEvent(next, {
                    at: next.now,
                    type: "ENQUEUE",
                    payload: { payload }
                });
            }
            return next;
        });
    }

    function play() {
        runningRef.current = true;
    }

    function pause() {
        runningRef.current = false;
    }

    function setSpeed(ms: number) {
        speedRef.current = ms;
    }

    function setVisibilityTimeout(ms: number) {
        setState(prev => {
            const next = structuredClone(prev);
            next.queue.config.visibilityTimeoutMs = ms;
            next.ruleLog.push({
                messageId: "system",
                text: `[CONFIG] visibility timeout set to ${ms}ms`,
            });
            return next;
        });
    }

    function setMaxRetries(n: number) {
        setState(prev => {
            const next = structuredClone(prev);
            next.queue.config.maxRetries = n;
            next.ruleLog.push({
                messageId: "system",
                text: `[CONFIG] max retries set to ${n}`,
            });
            return next;
        });
    }

    function setProcessingTime(ms: number) {
        setState(prev => {
            const next = structuredClone(prev);
            next.consumers[0].processingTimeMs = ms;
            next.ruleLog.push({
                messageId: "system",
                text: `[CONFIG] processing time set to ${ms}ms`,
            });
            return next;
        });
    }

    function setSuccessRate(rate: number) {
        setState(prev => {
            const next = structuredClone(prev);
            next.consumers[0].successRate = rate;
            next.ruleLog.push({
                messageId: "system",
                text: `[CONFIG] success rate set to ${rate}%`,
            });
            return next;
        });
    }

    function reset() {
        runningRef.current = false;
        setState(createInitialState());
    }

    useEffect(() => {
        let cancelled = false;

        async function loop() {
            while (!cancelled) {
                if (!runningRef.current) {
                    await new Promise(r => setTimeout(r, 50));
                    continue;
                }

                setState(prev => {
                    const next = structuredClone(prev);
                    if(next.eventQueue.length > 0)
                        runNextEvent(next);
                    return next;
                });

                await new Promise(r => setTimeout(r, speedRef.current));
            }
        }

        loop();
        return () => {
            cancelled = true;
        };
    }, []);
    
    return { 
        state,
        activeRule, 
        enqueue,
        play, 
        pause,
        setSpeed,
        setVisibilityTimeout,
        setMaxRetries,
        setProcessingTime,
        setSuccessRate,
        injectCount,
        setInjectCount,
        reset,
    };
}