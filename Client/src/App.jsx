import React from "react";
import { Box, Text } from "@chakra-ui/react";
import MainContainer from "./components/MainContainer";
import SideNavigationBar from "./components/SideNavigationBar";
import TopNavigation from "./components/TopNavigation";
import Folders from "./components/Folders";
const App = () => {
  return (
    <>
      <header>
        <TopNavigation />
      </header>
      <MainContainer>
        <Box display="flex" height="100vh">
          <SideNavigationBar />

          <Folders />
        </Box>
      </MainContainer>
    </>
  );
};

export default App;
