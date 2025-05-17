import React, { useState } from "react";
import { Box } from "@mui/material";
import { UtilityProvider } from "./UtilityContext";
import UtilityPageContent from "./UtilityPageContent";

// Wrapper component that provides the context
const UtilityPage = () => {
  return (
    <UtilityProvider>
      <UtilityPageContent />
    </UtilityProvider>
  );
};

export default UtilityPage;
