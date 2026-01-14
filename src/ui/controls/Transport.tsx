import { useState } from "react";
import { useSimulation } from "../hooks/SimulationContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";

export function Transport() {
  const { enqueue, play, pause, setSpeed, injectCount, reset } = useSimulation();

  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  function toggleRun() {
    setRunning(r => {
      if (r) pause();
      else play();
      return !r;
    });
  }

  function startRun() {
    enqueue("burst", injectCount);
    setStarted(true);
    setRunning(true);
    play();
  }

  function handleReset() {
    reset();
    pause();
    setRunning(false);
    setStarted(false);
  }

  return (
    <div className="transport">
      <button
        className="transport-btn"
        onClick={toggleRun}
        disabled={!started}
      >
        {running ? <PauseIcon /> : <PlayArrowIcon />}
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
        onClick={startRun}
        disabled={started}
      >
        START RUN
      </button>

      <button
        className="transport-btn"
        onClick={handleReset}
        disabled={!started}
      >
        <ReplayIcon />
        <span className="transport-label">RESET</span>
      </button>
    </div>
  );
}
