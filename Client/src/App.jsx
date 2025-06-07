import { Box } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";

function App() {
  return (
    <>
      <Box>
        <header>
          <TopNavigation />
        </header>
        <MainContainer>
          <Dashboard />
        </MainContainer>
      </Box>
    </>
  );
}

export default App;
