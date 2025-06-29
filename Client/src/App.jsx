import { Box } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import Login from "./components/UserLogin";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import UserCreation from "./routes/UserCreation";

function App() {
  const [isLogedin, setLogedin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLoginSuccess = (user) => {
    setLogedin(true);
    setLoggedInUser(user);
    // CRITICAL: Ensure UserLogin component navigates to "/"
    // navigate("/"); // This should be in UserLogin.js
  };

  const handleLogout = () => {
    setLogedin(false);
    setLoggedInUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("jwtToken");
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

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/signup" element={<UserCreation />} />

        {/* Protected Dashboard Layout Route */}
        {/* This route acts as a wrapper for all protected routes */}
        <Route
          path="/" // Base path for protected content
          element={
            isLogedin ? (
              <MainContainer>
                <Outlet />
              </MainContainer>
            ) : (
              // If not logged in, redirect to login page
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Nested Routes for Dashboard content */}
          {/* The 'index' route matches the parent path ("/") exactly.
              By rendering <Dashboard /> without a 'type' prop, it triggers
              the default case in Dashboard.js, which renders <TestFolder />. */}
          <Route index element={<Dashboard />} />

          {/* Specific routes for other Dashboard types */}
          <Route path="archive" element={<Dashboard type="archive" />} />
          <Route path="trash" element={<Dashboard type="trash" />} />
          <Route path="favorites" element={<Dashboard type="favorites" />} />
          <Route path="settings" element={<Dashboard type="settings" />} />
        </Route>

        {/* Fallback for any unmatched routes outside of the defined ones.
            This ensures that if a user types a random URL, they are redirected
            to the appropriate logged-in or logged-out home. */}
        <Route
          path="*"
          element={<Navigate to={isLogedin ? "/" : "/login"} replace />}
        />
      </Routes>
    </Box>
  );
}

export default App;
