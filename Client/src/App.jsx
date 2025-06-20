// App.jsx
import { Box } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import Login from "./components/UserLogin";
import { useState, useEffect } from "react"; // Import useEffect

function App() {
  // Initialize state from localStorage
  const [isLogedin, setLogedin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Function called on successful login from UserLogin component
  const handleLoginSuccess = (user) => {
    setLogedin(true);
    setLoggedInUser(user);
    // localStorage is already updated in UserLogin, no need to duplicate here
  };

  // Function to handle logout
  const handleLogout = () => {
    setLogedin(false);
    setLoggedInUser(null);
    localStorage.removeItem("isLoggedIn"); // Clear login flag from localStorage
    localStorage.removeItem("loggedInUser"); // Clear user data from localStorage
    // Optionally, you might redirect to login page or home page
    // window.location.href = '/login';
  };

  // Optional: Use useEffect to re-sync if localStorage changes in other tabs/windows
  // (More advanced, but good for robust apps)
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
    <>
      <Box>
        {isLogedin && (
          <header>
            {/* Pass the loggedInUser object AND the handleLogout function to TopNavigation */}
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
    </>
  );
}

export default App;
