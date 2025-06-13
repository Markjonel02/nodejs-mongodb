// src/Dashboard.jsx
import { useState, Suspense, lazy } from "react";
import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom"; // Import Routes and Route

import TestNav from "../components/TestNav"; // Renamed from TestNav to Sidebar as per your provided code
import Skeletons from "./Spinner";
// Lazily load the Archive component
const ArchiveComponent = lazy(() => import("../routes/Archivednotes"));
const TestFolder = lazy(() => import("../routes/TestFolder"));
const TrashRoutes = lazy(() => import("../routes/TrashRoutes"));
const Dashboard = () => {
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);

  return (
    <Box display="flex" width="100%" minH="100vh" bg="gray.50">
      {" "}
      {/* Added minH="100vh" */}
      {/* Sidebar (your navigation) */}
      <TestNav
        onNoteAdded={() => {
          setShouldRefetchNotes((prev) => !prev);
        }}
      />
      {/* Main Content Area */}
      <Box width="100%" flex="1">
        <Suspense fallback={<Skeletons />}>
          <Routes>
            <Route
              index
              path="/"
              element={<TestFolder shouldRefetchNotes={shouldRefetchNotes} />}
            />
            {/* Archive Route: Displays ArchiveComponent */}
            <Route path="/archive" element={<ArchiveComponent />} />
            {/* Add other routes as needed */}
            <Route path="/calendar" element={<div>Calendar View</div>} />
            <Route path="/trash" element={<TrashRoutes />} />
            <Route path="/favorites" element={<div>Favorites View</div>} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard;
