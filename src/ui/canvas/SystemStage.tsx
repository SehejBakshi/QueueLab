import { motion } from "framer-motion";
import { useRef, useLayoutEffect, useState } from "react";
import { useSimulation } from "../hooks/SimulationContext";

const X = {
  queued: 140 + 180 / 2,
  in_flight: 320 + 260 / 2,
} as const;

export default function SystemStage() {
  const { state, activeRule } = useSimulation();

  const stageRef = useRef<HTMLDivElement>(null);
  const ackRef = useRef<HTMLDivElement>(null);
  const dlqRef = useRef<HTMLDivElement>(null);

  const [ackPos, setAckPos] = useState({ x: 0, y: 0 });
  const [dlqPos, setDlqPos] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!stageRef.current || !ackRef.current || !dlqRef.current) return;

    const stage = stageRef.current.getBoundingClientRect();
    const ack = ackRef.current.getBoundingClientRect();
    const dlq = dlqRef.current.getBoundingClientRect();

    setAckPos({
      x: ack.left - stage.left + ack.width / 2,
      y: ack.top - stage.top + ack.height / 2,
    });

    setDlqPos({
      x: dlq.left - stage.left + dlq.width / 2,
      y: dlq.top - stage.top + dlq.height / 2,
    });
  }, []);

  const queued = state.queue.messages.filter(m => m.state === "queued");
  const inflight = state.queue.messages.filter(m => m.state === "in_flight").length;
  const depth = queued.length;

  const allMessages = [...state.queue.messages, ...state.queue.dlq];

  const ruleText = activeRule?.text ?? "";
  const isVisibilityRule = ruleText.includes("Visibility timeout");

  return (
    <div
      ref={stageRef}
      style={{
        height: 560,
        position: "relative",
        borderRadius: 22,
        background:
          "radial-gradient(1200px 600px at 20% 20%, #131212ff, #090909)",
        overflow: "hidden",
      }}
      className="simulator"
    >
      {/* Labels */}
      <div style={{ position: "absolute", left: 160, top: 120, opacity: 0.4 }}>
        Queue
      </div>
      <div style={{ position: "absolute", left: 380, top: 140, opacity: 0.4 }}>
        Consumers
      </div>
      <div style={{ position: "absolute", left: ackPos.x - 60, top: ackPos.y - 100, opacity: 0.4 }}>
        Acknowledged
      </div>
      <div style={{ position: "absolute", left: dlqPos.x - 50, top: dlqPos.y - 110, opacity: 0.4 }}>
        Dead letter
      </div>

      {/* Queue pressure */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 150,
          width: 180,
          height: 260,
          borderRadius: 28,
          background: `
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(0,0,0,0.6), transparent 70%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(255,255,255,0.12),
            inset 0 0 30px rgba(255,255,255,0.06),
            0 20px 40px rgba(0,0,0,0.6)
          `,
          opacity: Math.min(0.95, 0.35 + depth * 0.06),
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
          background: `
            radial-gradient(circle at 50% 40%, rgba(255,255,255,0.12), transparent 55%),
            radial-gradient(circle at 50% 80%, rgba(0,0,0,0.5), transparent 70%)
          `,

          boxShadow: `
            inset 0 0 0 1px rgba(255,255,255,0.14),
            inset 0 0 40px rgba(255,255,255,0.08),
            0 16px 36px rgba(0,0,0,0.7)
          `,

          opacity: Math.min(0.9, 0.35 + inflight * 0.18),
        }}
      />

      {/* ACK bucket */}
      <div
        ref={ackRef}
        style={{
          position: "absolute",
          right: 500,
          top: 100,
          width: 180,
          height: 140,
          borderRadius: 28,
          background:
            "radial-gradient(circle at 50% 50%, #1f3a1f, transparent)",
          opacity: 0.55,
        }}
      />

      {/* DLQ bucket */}
      <div
        ref={dlqRef}
        style={{
          position: "absolute",
          right: 500,
          top: 320,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, #2a0f0f, #090909)",
          opacity: 0.75,
        }}
      />

      {allMessages.map((m, i) => {
        const qi = queued.findIndex(q => q.id === m.id);
        const safeQi = qi === -1 ? 0 : qi;
        const spacing = Math.min(14, 140 / Math.max(depth, 1));

        const isQueued = m.state === "queued";
        const isRetry = isQueued && m.deliveryCount > 1;
        const isTerminal = m.state === "acked" || m.state === "dead_lettered";

        return (
          <motion.div
            key={m.id}
            layout={!isTerminal}
            animate={{
              x:
                m.state === "acked"
                  ? ackPos.x
                  : m.state === "dead_lettered"
                  ? dlqPos.x
                  : isRetry
                  ? [420, 60, X.queued]
                  : X[m.state],

              y:
                m.state === "acked"
                  ? ackPos.y + ((i % 6) - 2.5) * 12
                  : m.state === "dead_lettered"
                  ? dlqPos.y + ((i % 6) - 2.5) * 12
                  : m.state === "queued"
                  ? 210 + safeQi * spacing
                  : 240 + (i % 6) * 14,

              scale:
                m.state === "in_flight"
                  ? 1.35
                  : isTerminal
                  ? 0.85
                  : 1,

              opacity:
                isVisibilityRule && m.state !== "queued"
                  ? 0.25
                  : 1,
            }}
            transition={{
              type: isTerminal ? "tween" : "spring",
              stiffness: 180,
              damping: 20,
              duration: isTerminal ? 0.45 : undefined,
            }}
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                m.state === "dead_lettered"
                  ? "#c84b4b"
                  : m.state === "acked"
                  ? "#4caf50"
                  : m.state === "in_flight"
                  ? "#f2f2f2"
                  : "#9a9a9a",
              boxShadow:
                m.state === "in_flight"
                  ? "0 0 10px rgba(255,255,255,0.45)"
                  : m.state === "acked"
                  ? "0 0 8px rgba(76,175,80,0.35)"
                  : "none",
            }}
          />
        );
      })}
    </div>
  );
}
