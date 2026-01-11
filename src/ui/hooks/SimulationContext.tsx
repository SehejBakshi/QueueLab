import { createContext, type ReactNode, useContext } from "react";
import { useSimulation as useSimInternal} from "./useSimulation";

const SimulationContext = createContext<
    ReturnType<typeof useSimInternal> | null
>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const sim = useSimInternal();
    return (
        <SimulationContext.Provider value={sim}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const ctx = useContext(SimulationContext);
    if (!ctx)
        throw new Error("SimulationProvider missing");
    return ctx;
}