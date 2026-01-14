import { motion, AnimatePresence } from "framer-motion";
import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useSimulation } from "../hooks/SimulationContext";

const X = {
  queued: 140 + 180 / 2,
  in_flight: 320 + 260 / 2,
} as const;

const bucketBase = {
  position: "absolute" as const,
  borderRadius: 28,
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: `
    inset 0 0 0 1px rgba(255,255,255,0.04),
    0 20px 60px rgba(0,0,0,0.6)
  `,
};

function messageStyle(m: any) {
  switch (m.state) {
    case "in_flight":
      return {
        bg: "linear-gradient(180deg, #ffffff, #f5f5f5)",
        color: "#111",
        shadow: "0 0 26px rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.75)",
      };
    case "acked":
      return {
        bg: "linear-gradient(180deg, #6fcf97, #4caf50)",
        color: "#0c2b16",
        shadow: "0 0 14px rgba(76,175,80,0.4)",
        border: "1px solid rgba(120,220,160,0.6)",
      };
    case "dead_lettered":
      return {
        bg: "linear-gradient(180deg, #d26b6b, #b84242)",
        color: "#2b0c0c",
        shadow: "0 0 16px rgba(200,75,75,0.45)",
        border: "1px solid rgba(220,100,100,0.6)",
      };
    default:
      return {
        bg: "rgba(200,200,200,0.95)",
        color: "#111",
        shadow: "0 0 10px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.5)",
      };
  }
}

export default function SystemStage() {
  const { state } = useSimulation();

  const stageRef = useRef<HTMLDivElement>(null);
  const ackRef = useRef<HTMLDivElement>(null);
  const dlqRef = useRef<HTMLDivElement>(null);

  const [ackPos, setAckPos] = useState({ x: 0, y: 0 });
  const [dlqPos, setDlqPos] = useState({ x: 0, y: 0 });

  const [ackGlow, setAckGlow] = useState(false);
  const [dlqGlow, setDlqGlow] = useState(false);

  const prevAckCount = useRef(0);
  const prevDlqCount = useRef(0);

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
  const inflight = state.queue.messages.filter(m => m.state === "in_flight");
  const acked = state.queue.messages.filter(m => m.state === "acked");
  const dlq = state.queue.dlq;

  useEffect(() => {
    if (acked.length > prevAckCount.current) {
      setAckGlow(true);
      setTimeout(() => setAckGlow(false), 600);
    }
    prevAckCount.current = acked.length;
  }, [acked.length]);

  useEffect(() => {
    if (dlq.length > prevDlqCount.current) {
      setDlqGlow(true);
      setTimeout(() => setDlqGlow(false), 600);
    }
    prevDlqCount.current = dlq.length;
  }, [dlq.length]);

  return (
    <div
      ref={stageRef}
      className="simulator"
      style={{
        height: 533,
        position: "relative",
        borderRadius: "403vh",
        background:
          "radial-gradient(1200px 600px at 20% 20%, rgba(80,137,147,0.32), rgba(0,0,0,0.83))",
        overflow: "hidden",
      }}
    >
      {/* QUEUE */}
      <div
        style={{
          ...bucketBase,
          left: 140,
          top: 140,
          width: 160,
          height: 300,
          borderRadius: "18px 18px 32px 32px",
          background: 
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.12), rhba(40, 46, 60, 0.55))",
            // "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 65%), rgba(40,46,60,0.55)",
          boxShadow: `
            inset 0 6px 0 rgba(255, 255, 255, 0.08),
            inset 0 -12px 20px rgba(0, 0, 0, 0.5),
            0 20px 60px rgba(0, 0, 0, 0.6)
          `,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 48,
            height: 8,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.25)",
          }}
        />
        <div style={{ position: "absolute", top: 14, left: 18, fontSize: 11, letterSpacing: "0.12em", opacity: 0.7, fontFamily: "IBM Plex Mono" }}>
          QUEUE
        </div>
      </div>

      {/* CONSUMER */}
      <div
        style={{
          ...bucketBase,
          left: 360,
          top: 190,
          width: 260,
          height: 180,
          borderRadius: 32,
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.18), transparent 60%), rgba(60,66,80,0.6)",
        }}
      >
        <div style={{ position: "absolute", top: 14, left: 18, fontSize: 11, letterSpacing: "0.12em", opacity: 0.75, fontFamily: "IBM Plex Mono" }}>
          CONSUMER
        </div>
      </div>

      {/* ACK */}
      <div
        ref={ackRef}
        style={{
          ...bucketBase,
          right: 500,
          top: 100,
          width: 180,
          minHeight: 140,
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 50%, rgba(80,180,120,0.35), transparent 65%), rgba(30,60,40,0.6)",
          boxShadow: ackGlow
            ? "0 0 50px rgba(120,220,160,0.7)"
            : bucketBase.boxShadow,
          border: ackGlow
            ? "1px solid rgba(120,220,160,0.9)"
            : bucketBase.border,
        }}
      >
        <div style={{ position: "absolute", top: 14, left: 18, fontSize: 11, letterSpacing: "0.12em", opacity: 0.75, fontFamily: "IBM Plex Mono" }}>
          ACKNOWLEDGED
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 42,
            padding: "0 14px 14px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 8,
            justifyItems: "center",
          }}
        >
          <AnimatePresence>
            {acked.map(m => (
              <motion.div
                key={m.id}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  minWidth: 42,
                  height: 24,
                  padding: "0 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono",
                  fontWeight: 600,
                  background: messageStyle(m).bg,
                  color: messageStyle(m).color,
                  boxShadow: messageStyle(m).shadow,
                  border: messageStyle(m).border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                #{m.id.slice(0, 2)}
                {m.deliveryCount > 1 && (
                  <span style={{ marginLeft: 6, opacity: 0.75 }}>
                    R{m.deliveryCount}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* DLQ */}
      <div
        ref={dlqRef}
        style={{
          ...bucketBase,
          right: 500,
          top: 320,
          width: 170,
          minHeight: 170,
          borderRadius: "50%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 50%, rgba(160,60,60,0.4), transparent 65%), rgba(60,20,20,0.75)",
          boxShadow: dlqGlow
            ? "0 0 55px rgba(220,90,90,0.75)"
            : bucketBase.boxShadow,
          border: dlqGlow
            ? "1px solid rgba(220,100,100,0.95)"
            : bucketBase.border,
        }}
      >
        <div style={{ position: "absolute", top: 20, left: 38, fontSize: 11, letterSpacing: "0.12em", opacity: 0.7, fontFamily: "IBM Plex Mono" }}>
          DEAD LETTER
        </div>

        <div
          style={{
            position: "absolute",
            inset: "42px 14px 14px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            justifyItems: "center",
            alignContent: "start",
          }}
        >
          <AnimatePresence>
            {dlq.map(m => (
              <motion.div
                key={m.id}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{
                  minWidth: 42,
                  height: 24,
                  padding: "0 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono",
                  fontWeight: 600,
                  background: messageStyle(m).bg,
                  color: messageStyle(m).color,
                  boxShadow: messageStyle(m).shadow,
                  border: messageStyle(m).border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                #{m.id.slice(0, 2)}
                {m.deliveryCount > 1 && (
                  <span style={{ marginLeft: 6, opacity: 0.75 }}>
                    R{m.deliveryCount}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* STAGE MESSAGES (QUEUED + IN-FLIGHT ONLY) */}
      {[...queued, ...inflight].map((m, i) => {
        const qi = queued.findIndex(q => q.id === m.id);
        const spacing = Math.min(14, 140 / Math.max(queued.length, 1));

        return (
          <motion.div
            key={m.id}
            layout
            animate={{
              x: m.state === "queued" ? X.queued : X.in_flight,
              y: m.state === "queued" ? 210 + qi * spacing : 240 + (i % 6) * 14,
              scale: m.state === "in_flight" ? 1.35 : 1,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            style={{
              position: "absolute",
              minWidth: 42,
              height: 24,
              padding: "0 10px",
              borderRadius: 999,
              fontSize: 11,
              fontFamily: "IBM Plex Mono",
              fontWeight: 600,
              background: messageStyle(m).bg,
              color: messageStyle(m).color,
              boxShadow: messageStyle(m).shadow,
              border: messageStyle(m).border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: m.state === "in_flight" ? 4 : 2,
            }}
          >
            #{m.id.slice(0, 2)}
            {m.deliveryCount > 1 && (
              <span style={{ marginLeft: 6, opacity: 0.75 }}>
                R{m.deliveryCount}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
