import { Box, Text } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import SideNavigationBar from "./components/SideNavigationBar";
import Folders from "./components/Folders";
import TestFolders from "./components/TestFolder";
import TestNav from "./components/TestNav";
function App() {
  return (
    <>
      <Box>
        <header>
          <TopNavigation />
        </header>
        <MainContainer>
          <Box display="flex" width="100%" height="100vh">
            {/* <SideNavigationBar /> */}
            <TestNav></TestNav>
            <Box>
              <TestFolders />
            </Box>
          </Box>
        </MainContainer>
      </Box>
    </>
  );
}

export default App;
