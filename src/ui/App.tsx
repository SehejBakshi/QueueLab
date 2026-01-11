import { SimulationProvider } from "./hooks/SimulationContext";
import SystemStage from "./canvas/SystemStage";
import HeaderPanel from "./HeaderPanel";

export default function App() {
  return (
    <SimulationProvider>
      <div>
        <HeaderPanel />
        <SystemStage />
      </div>
    </SimulationProvider>
  );
}
