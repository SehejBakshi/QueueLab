import { useSimulation } from "../hooks/SimulationContext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const MIN_INJECT = 1;
const MAX_INJECT = 10;

const MIN_RETRIES = 1;
const MAX_RETRIES = 5;

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

    const clampInject = (v: number) => Math.min(MAX_INJECT, Math.max(MIN_INJECT, v));
    const clampRetries = (v: number) => Math.min(MAX_RETRIES, Math.max(MIN_RETRIES, v));

    function setFromClick(
        e: React.MouseEvent<HTMLInputElement>,
        min: number,
        max: number,
        step: number,
        setter: (v: number) => void
    ) {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const raw = min + ratio * (max - min);
        const snapped = Math.round(raw / step) * step;
        setter(Math.min(max, Math.max(min, snapped)));
    }

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
                    onClick={e =>
                        setFromClick(e, 1000, 15000, 500, setVisibilityTimeout)
                    }
                />
            </div>

            <div className="param">
                <label>MAX RETRIES</label>
                <span>{cfg.maxRetries}</span>
                <div className="stepper">
                    <button
                        onClick={() =>
                            setMaxRetries(clampRetries(cfg.maxRetries - 1))
                        }
                        disabled={cfg.maxRetries <= MIN_RETRIES}
                    >
                        <ChevronLeftIcon style={{marginTop: "5px"}} fontSize="small" />
                    </button>
                    <button
                        onClick={() =>
                            setMaxRetries(clampRetries(cfg.maxRetries + 1))
                        }
                        disabled={cfg.maxRetries >= MAX_RETRIES}
                    >
                        <ChevronRightIcon style={{marginTop: "5px"}} fontSize="small" />
                    </button>
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
                    onClick={e =>
                        setFromClick(e, 200, 4000, 100, setProcessingTime)
                    }
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
                    onChange={e => setSuccessRate(Number(e.target.value)/100)}  
                    onClick={e =>
                        setFromClick(e, 0, 100, 5, v => setSuccessRate(v / 100))
                    }
                />
            </div>

            <div className="param">
                <label>INJECT COUNT</label>
                <span>{injectCount}</span>
                <div className="stepper">
                    <button 
                        onClick={() => setInjectCount(clampInject(injectCount - 1))} 
                        disabled={injectCount <= MIN_INJECT}
                    >
                        <ChevronLeftIcon style={{marginTop: "5px"}} fontSize="small" />
                    </button>
                    <button 
                        onClick={() => setInjectCount(clampInject(injectCount + 1))}
                        disabled={injectCount >= MAX_INJECT}
                    >
                        <ChevronRightIcon style={{marginTop: "5px"}} fontSize="small" />
                    </button>
                </div>
            </div>
        </section>
    );
}