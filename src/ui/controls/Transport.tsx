import { useSimulation } from "../hooks/SimulationContext";

export function Transport() {
  const { enqueue, play, pause, setSpeed } = useSimulation();

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        marginTop: 20,
      }}
    >
      <button className="mono" onClick={play}>▶</button>
      <button className="mono" onClick={pause}>❚❚</button>

      <input
        type="range"
        min={80}
        max={1200}
        step={40}
        defaultValue={400}
        onChange={e => setSpeed(Number(e.target.value))}
      />

      <button
        className="mono"
        onClick={() => enqueue("burst", 8)}
      >
        inject ×8
      </button>
    </div>
  );
}
