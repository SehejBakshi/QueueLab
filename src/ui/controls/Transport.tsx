import { useState } from "react";
import { useSimulation } from "../hooks/SimulationContext";

export function Transport() {
  const { enqueue, play, pause, setSpeed, injectCount, reset } = useSimulation();
  const [running, setRunning] = useState(false);

  function toggle() {
    setRunning(r => {
      if (r) pause();
      else play();
      return !r;
    });
  }

  return (
    <div className="transport">
      <button className="transport-btn" onClick={toggle}>
        <span className="material-icons">
          {running ? "pause" : "play_arrow"}
        </span>
        <span className="transport-label">
          {running ? "PAUSE" : "RUN"}
        </span>
      </button>

      <div className="speed">
        <span>SPEED</span>
        <input
        type="range"
          min={80}
          max={1200}
          step={40}
          defaultValue={400}
          onChange={e => {
            const v = Number(e.target.value);
            setSpeed(1280 - v);
          }}
        />
      </div>

      <button
        className="inject-btn" 
        onClick={() => {
          enqueue("burst", injectCount);
          if(!running)
            toggle();
        }}
      >
        START RUN
      </button>

      <button className="transport-btn" onClick={() => {
        reset();
        if(running)
          toggle();
      }}>
        <span className="material-icons">replay</span>
        <span className="transport-label">RESET</span>
      </button>

    </div>
  );
}
