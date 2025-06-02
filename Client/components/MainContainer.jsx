import React from "react";
import { Box } from "@chakra-ui/react";

const MainContainer = ({ children }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      margin="0"
      padding="0"
    >
      {children}
    </Box>
  );
};

export default MainContainer;
