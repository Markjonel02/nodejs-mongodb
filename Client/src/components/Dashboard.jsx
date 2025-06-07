import { useState } from "react";
import { Box } from "@chakra-ui/react";

import TestFolders from "./TestFolder";
import TestNav from "./TestNav";
const Dashboard = () => {
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);
  return (
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
  );
};

export default Dashboard;
