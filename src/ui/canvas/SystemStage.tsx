import { motion } from "framer-motion";
import { useSimulation } from "../hooks/SimulationContext";

const X = {
  queued: 120,
  in_flight: 420,
  acked: 760,
  dead_lettered: 760,
} as const;

export default function SystemStage() {
  const { state } = useSimulation();

  const queued = state.queue.messages.filter(m => m.state === "queued");
  const inflight = state.queue.messages.filter(
    m => m.state === "in_flight"
  ).length;

  const depth = queued.length;

  return (
    <div
      style={{
        height: 560,
        position: "relative",
        borderRadius: 22,
        background:
          "radial-gradient(1200px 600px at 20% 20%, #181818, #090909)",
        overflow: "hidden",
      }}
    >
      {/* Labels */}
      <div style={{ position: "absolute", left: 100, top: 120, opacity: 0.4 }}>
        Queue
      </div>
      <div style={{ position: "absolute", left: 420, top: 140, opacity: 0.4 }}>
        Consumers
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 20,
          opacity: 0.4,
        }}
      >
        Dead letter
      </div>

      {/* Queue pressure */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 150,
          width: 180,
          height: 260,
          borderRadius: 28,
          background:
            "radial-gradient(circle at 30% 30%, #2b2b2b, transparent)",
          opacity: Math.min(0.9, 0.25 + depth * 0.06),
        }}
      />

      {/* Consumer pull */}
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 190,
          width: 260,
          height: 180,
          borderRadius: 32,
          background:
            "radial-gradient(circle at 50% 50%, #1e1e1e, transparent)",
          opacity: Math.min(0.8, 0.3 + inflight * 0.15),
        }}
      />

      {/* DLQ sink */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 40,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, #2a0f0f, #090909)",
          opacity: 0.75,
        }}
      />

      {state.queue.messages.map((m, i) => {
        const isQueued = m.state === "queued";
        const isRetry = isQueued && m.deliveryCount > 1;
        const qi = queued.findIndex(q => q.id === m.id);
        const safeQi = qi === -1 ? 0 : qi;

        const spacing = Math.min(14, 140 / Math.max(depth, 1));

        return (
          <motion.div
            key={m.id}
            animate={{
              x: isRetry ? [420, 60, X.queued] : X[m.state],
              y:
                m.state === "dead_lettered"
                  ? [260, 520]
                  : isQueued
                  ? 210 + safeQi * spacing
                  : 230 + (i % 10) * 16,
              scale: m.state === "in_flight" ? 1.25 : 1,
              opacity:
                m.state === "acked"
                  ? 0
                  : m.deliveryCount > 1
                  ? 0.75
                  : 1,
            }}
            transition={{
              type: m.state === "in_flight" ? "spring" : "tween",
              stiffness: 190,
              damping: 18,
              duration: m.state === "in_flight" ? undefined : 0.65,
              ease:
                m.state === "in_flight"
                  ? undefined
                  : [0.16, 1, 0.3, 1],
            }}
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                m.state === "dead_lettered"
                  ? "#c84b4b"
                  : m.state === "in_flight"
                  ? "#f2f2f2"
                  : "#9a9a9a",
              boxShadow:
                m.state === "in_flight"
                  ? "0 0 10px rgba(255,255,255,0.45)"
                  : "none",
              filter:
                m.state === "in_flight"
                  ? "drop-shadow(0 0 6px rgba(255,255,255,0.35))"
                  : "none",
            }}
          />
        );
      })}
    </div>
  );
}
