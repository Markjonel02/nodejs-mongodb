import { Box, Text } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import SideNavigationBar from "./components/SideNavigationBar";
import Folders from "./components/Folders";
import TestFolders from "./components/TestFolder";
import TestNav from "./components/TestNav";
import { useState } from "react";
function App() {
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);

  return (
    <>
      <Box>
        <header>
          <TopNavigation />
        </header>
        <MainContainer>
          <Box display="flex" width="100%">
            {/* <SideNavigationBar /> */}
            <TestNav
              onNoteAdded={() => {
                setShouldRefetchNotes((prev) => !prev);
              }}
            ></TestNav>
            <Box width="100%">
              <TestFolders shouldRefetchNotes={shouldRefetchNotes} />
            </Box>
          </Box>
        </MainContainer>
      </Box>
    </>
  );
}

export default App;
