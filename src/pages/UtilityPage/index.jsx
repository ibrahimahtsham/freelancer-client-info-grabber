import React from "react";
import { Box } from "@mui/material";
import { UtilityProvider } from "./UtilityContext";
import UtilityPageContent from "./components/UtilityPageContent";

const UtilityPage = () => {
  return (
    <UtilityProvider>
      <UtilityPageContent />
    </UtilityProvider>
  );
};

export default UtilityPage;
