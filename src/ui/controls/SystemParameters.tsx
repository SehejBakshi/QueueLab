import { useSimulation } from "../hooks/SimulationContext";

export default function SystemParameters() {
    const {
        state,
        setVisibilityTimeout,
        setMaxRetries,
        setProcessingTime,
        setSuccessRate,
        injectCount,
        setInjectCount,
    } = useSimulation();

    const cfg = state.queue.config;
    const consumer = state.consumers[0];

    return (
        <section className="system-params">
            <div className="param">
                <label>VISIBILITY TIMEOUT</label>
                <span>{cfg.visibilityTimeoutMs} ms</span>
                <input
                    type="range"
                    min={1000}
                    max={15000}
                    step={500}
                    value={cfg.visibilityTimeoutMs}
                    onChange={e => setVisibilityTimeout(Number(e.target.value))}
                />
            </div>

            <div className="param">
                <label>MAX RETRIES</label>
                <span>{cfg.maxRetries}</span>
                <div className="stepper">
                    <button onClick={() => setMaxRetries(Math.max(0, cfg.maxRetries - 1))}>◀</button>
                    <button onClick={() => setMaxRetries(cfg.maxRetries + 1)}>▶</button>
                </div>
            </div>

            <div className="param">
                <label>PROCESSING TIME</label>
                <span>{consumer.processingTimeMs} ms</span>
                <input 
                    type="range"
                    min={200}
                    max={4000}
                    step={100}
                    value={consumer.processingTimeMs}
                    onChange={e => setProcessingTime(Number(e.target.value))}
                />
            </div>

            <div className="param">
                <label>SUCCESS RATE</label>
                <span>{consumer.successRate*100}%</span>
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(consumer.successRate*100)}
                    onChange={e => setSuccessRate(Number(e.target.value))}  
                />
            </div>

            <div className="param">
                <label>INJECT COUNT</label>
                <span>{injectCount}</span>
                <div className="stepper">
                    <button onClick={() => setInjectCount(Math.max(1, injectCount - 1))}>◀</button>
                    <button onClick={() => setInjectCount(injectCount + 1)}>▶</button>
                </div>
            </div>
        </section>
    );
}