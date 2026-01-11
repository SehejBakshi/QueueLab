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

  return (
    <p style={{ opacity: 0.75 }}>
      {last.text}
    </p>
  );
}