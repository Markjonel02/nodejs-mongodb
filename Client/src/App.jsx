import { Box } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import Login from "./components/UserLogin";
import { useState, useEffect } from "react";

function App() {
  // Initialize state from localStorage
  const [isLogedin, setLogedin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Called on successful login
  const handleLoginSuccess = (user) => {
    setLogedin(true);
    setLoggedInUser(user);
    // localStorage is already updated in UserLogin
  };

  const handleLogout = () => {
    setLogedin(false);
    setLoggedInUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setLogedin(localStorage.getItem("isLoggedIn") === "true");
      setLoggedInUser(
        JSON.parse(localStorage.getItem("loggedInUser") || "null")
      );
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Box>
      {isLogedin && (
        <header>
          <TopNavigation user={loggedInUser} onLogout={handleLogout} />
        </header>
      )}

      {isLogedin ? (
        <MainContainer>
          <Dashboard />
        </MainContainer>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </Box>
  );
}

export default App;
