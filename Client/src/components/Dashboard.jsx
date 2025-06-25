// Dashboard.js
import { useState, Suspense, lazy } from "react";
import { Box } from "@chakra-ui/react";

import TestNav from "../components/TestNav";
import Skeletons from "./Spinner"; // Assuming Skeletons is a loading spinner

// Lazily loaded components
const TestFolder = lazy(() => import("../routes/TestFolder"));
const ArchiveComponent = lazy(() => import("../routes/Archivednotes"));
const TrashRoutes = lazy(() => import("../routes/TrashRoutes"));
const Favorites = lazy(() => import("../routes/Favorites"));
const NotFoundPage = lazy(() => import("../routes/Nopage"));
const Settings = lazy(() => import("../routes/Settings"));

// Dashboard component now accepts a 'type' prop
const Dashboard = ({ type }) => {
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);

  // Helper function to render the correct component based on 'type'
  const renderContent = () => {
    switch (type) {
      case "archive":
        return <ArchiveComponent />;
      case "trash":
        return <TrashRoutes />;
      case "favorites":
        return <Favorites />;
      case "settings":
        return <Settings />;
      case "notFound":
        return <NotFoundPage />;
      default: // This will be the "index" route, or main folder
        return <TestFolder shouldRefetchNotes={shouldRefetchNotes} />;
    }
  };

  return (
    <Box display="flex" width="100%" minH="100vh" bg="gray.50">
      <TestNav onNoteAdded={() => setShouldRefetchNotes((prev) => !prev)} />

      {/* Main Content Area */}
      <Box width="100%" flex="1">
        <Suspense fallback={<Skeletons />}>
          {renderContent()} {/* Render content based on the 'type' prop */}
        </Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard;
