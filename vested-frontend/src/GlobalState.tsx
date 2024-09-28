import React, { createContext, useState, ReactNode, useContext } from "react";

// Define the structure of the state
interface GlobalState {
  count: number;
  user: string | null;
  csvData: any[];
  portfolioItems: any[];
  search: string;
}

// Define the context value type
interface GlobalStateContextType {
  state: GlobalState;
  updateState: (newState: Partial<GlobalState>) => void;
}

// Create the context with an initial value (can be null initially)
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Define the provider props to accept children
interface GlobalStateProviderProps {
  children: ReactNode;
}

// Create the provider component
const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [state, setState] = useState<GlobalState>({
    count: 0,
    user: null,
    csvData: [],
    portfolioItems: [
      { ticker: "AAPL", price: 150, options: ["8/10", "4/10", "9/10"] },
      { ticker: "TSLA", price: 700, options: ["7/10", "5/10", "2/10"] },
    ],
    search: "",
  });

  // Helper function to update state based on the previous state
  const updateState = (newState: Partial<GlobalState>) => {
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  return (
    <GlobalStateContext.Provider value={{ state, updateState }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Helper hook to use the GlobalStateContext (optional but good practice)
const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

export { GlobalStateContext, GlobalStateProvider, useGlobalState };
