import React from "react";
import { Flex } from "@chakra-ui/react";

const MainContainer = ({ children }) => {
  return (
    <Flex
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      width="100%"
      height="100vh"
      bgColor="gray.100"
    >
      {children}
    </Flex>
  );
};

export default MainContainer;
