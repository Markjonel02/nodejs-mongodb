import { Box } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import Login from "./components/UserLogin";
import { useState } from "react";

function App() {
  const [isLogedin, setLogedin] = useState(false);

  const handleLoginSuccess = () => {
    setLogedin(true);
  };

  return (
    <>
      <Box>
        {isLogedin && ( // Conditionally render TopNavigation
          <header>
            <TopNavigation />
          </header>
        )}

        {isLogedin ? (
          // If logged in, show the Dashboard and MainContainer
          <MainContainer>
            <Dashboard />
          </MainContainer>
        ) : (
          // If not logged in, show the Login component
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </Box>
    </>
  );
}

export default App;
