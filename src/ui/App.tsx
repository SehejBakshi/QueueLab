import { SimulationProvider } from "./hooks/SimulationContext";
import { Transport } from "./controls/Transport";
import SystemStage from "./canvas/SystemStage";
import { useSimulation } from "./hooks/SimulationContext";

function Narration() {
  const { state } = useSimulation();

  if (state.queue.messages.length === 0) {
    return <p style={{ opacity: 0.6 }}>The system is idle.</p>;
  }

  if (state.queue.messages.some(m => m.state === "dead_lettered")) {
    return (
      <p style={{ opacity: 0.6 }}>
        Some messages are failing and being dead-lettered.
      </p>
    );
  }

  if (state.queue.messages.some(m => m.state === "in_flight")) {
    return (
      <p style={{ opacity: 0.6 }}>
        Consumers are processing messages.
      </p>
    );
  }

  return (
    <p style={{ opacity: 0.6 }}>
      Messages are waiting in the queue.
    </p>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <div
        style={{
          padding: 32,
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#eaeaea",
        }}
      >
        <h1 style={{ marginBottom: 4 }}>QueueLab</h1>
        <p style={{ opacity: 0.5, marginTop: 0 }}>
          A message queue, experienced as motion
        </p>

        <Transport />

        <div style={{ marginTop: 16 }}>
          <Narration />
        </div>

        <div style={{ marginTop: 24 }}>
          <SystemStage />
        </div>
      </div>
    </SimulationProvider>
  );
}
