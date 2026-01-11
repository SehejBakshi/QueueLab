import { useRef, useState, useEffect } from "react";
import { createInitialState, runNextEvent } from "../../engine";
import { scheduleEvent } from "../../engine/scheduler";
import type { SimulationState } from "../../engine/types";

export function useSimulation() {
    const [state, setState] = useState<SimulationState>(() => 
        createInitialState()
    );

    const runningRef = useRef(true);
    const speedRef = useRef(400);

    function enqueue(payload: string, count = 1) {
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
        enqueue,
        play, 
        pause,
        setSpeed,
    };
}