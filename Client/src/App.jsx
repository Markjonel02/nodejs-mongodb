// App.js
import { Box } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard"; // Keep Dashboard import
import TopNavigation from "./components/TopNavigation";
import MainContainer from "./components/MainContainer";
import Login from "./components/UserLogin";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom"; // Import Outlet
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
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/signup" element={<UserCreation />} />

        {/* Protected Dashboard Layout Route */}
        <Route
          path="/"
          element={
            isLogedin ? (
              <MainContainer>
                {/* Outlet renders the matched child route */}
                <Outlet />
              </MainContainer>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Nested Routes for Dashboard content */}
          <Route index element={<Dashboard />} />{" "}
          {/* Renders Dashboard at /dashboard */}
          <Route path="archive" element={<Dashboard type="archive" />} />{" "}
          {/* Pass type to Dashboard */}
          <Route path="trash" element={<Dashboard type="trash" />} />
          <Route path="favorites" element={<Dashboard type="favorites" />} />
          <Route path="settings" element={<Dashboard type="settings" />} />
          <Route path="*" element={<Dashboard type="notFound" />} />
        </Route>

        {/* Redirect from root to /dashboard if logged in, otherwise to /login */}
        <Route
          path="/"
          element={
            isLogedin ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Fallback for any unmatched routes outside of login/signup/dashboard */}
        <Route
          path="*"
          element={
            <Navigate to={isLogedin ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Box>
  );
}

export default App;
