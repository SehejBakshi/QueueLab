import { useSimulation } from "./hooks/SimulationContext";

export default function RuleLens() {
  const { state } = useSimulation();
  const last = state.ruleLog[state.ruleLog.length - 1];

  if (!last) {
    return (
      <p style={{ opacity: 0.4 }}>
        Interact with the system to see which rules are applied.
      </p>
    );
  }

  const prefix = 
    last.type === "DELIVER" ? "📥" :
    last.type === "PROCESS_SUCCESS" ? "✅" :
    last.type === "PROCESS_FAIL" ? "⚠️" :
    last.type === "VISIBILITY_TIMEOUT" ? "⏱️" :
    last.type === "DLQ" ? "💀" :
    last.type === "ENQUEUE" ? "➕" :
    "";

  return (
    <p style={{ opacity: 0.85 }}>
      {prefix} {last.text}
    </p>
  );
}