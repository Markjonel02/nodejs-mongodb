import "./App.css";
import { Box, Text } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import TopNavigation from "@/components/TopNavigation";
import MainContainer from "./components/MainContainer";
import SideNavigationBar from "./components/SideNavigationBar";
import Folders from "./components/Folders";
function App() {
  return (
    <>
      <Box>
        <header>
          <TopNavigation />
        </header>
        <MainContainer>
          <Box display="flex" width="100%" height="100vh">
            <Box width="250px" padding="20px">
              <SideNavigationBar />
            </Box>
            <Box flex="1">
              <Text fontSize="2xl" fontWeight="bold">
                Welcome to the Application
              </Text>
              <Text mt={4}>
                This is a sample application demonstrating the use of Chakra UI
                components.
              </Text>
              <Folders />
            </Box>
          </Box>
        </MainContainer>
      </Box>
    </>
  );
}

export default App;
