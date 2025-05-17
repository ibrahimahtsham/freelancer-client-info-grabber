import { useContext } from "react";
import { UtilityContext } from "./context"; // Import from the new file

export function useUtility() {
  const context = useContext(UtilityContext);
  if (context === undefined) {
    throw new Error("useUtility must be used within a UtilityProvider");
  }
  return context;
}
