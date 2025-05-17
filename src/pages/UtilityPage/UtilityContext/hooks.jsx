import { useContext } from "react";
import { UtilityContext } from "./provider";

export function useUtility() {
  const context = useContext(UtilityContext);
  if (context === undefined) {
    throw new Error("useUtility must be used within a UtilityProvider");
  }
  return context;
}
