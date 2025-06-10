import React from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";

const LoadingSpinner = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh" // Full screen height
      width="100%"
      flexDirection="column"
    >
      <Spinner
        boxSize="50px" // Custom size to make it bigger
        thickness="5px"
        speed="0.65s"
        color="#9EC6F3"
        mb={4}
      />

      <Text fontSize="1.2em" fontWeight={500}>
        Loading...
      </Text>
    </Box>
  );
};

export default LoadingSpinner;
