import { useState, Suspense, lazy } from "react";
import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import TestNav from "../components/TestNav";
import Skeletons from "./Spinner";

const ArchiveComponent = lazy(() => import("../routes/Archivednotes"));
const TestFolder = lazy(() => import("../routes/TestFolder"));
const TrashRoutes = lazy(() => import("../routes/TrashRoutes"));
const Favorites = lazy(() => import("../routes/Favorites"));
const NotFoundPage = lazy(() => import("../routes/Nopage"));

const Dashboard = () => {
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);

  return (
    <Box display="flex" width="100%" minH="100vh" bg="gray.50">
      <TestNav onNoteAdded={() => setShouldRefetchNotes((prev) => !prev)} />

      {/* Main Content Area */}
      <Box width="100%" flex="1">
        <Suspense fallback={<Skeletons />}>
          <Routes>
            {/* Index route for main folder */}
            <Route
              index
              element={<TestFolder shouldRefetchNotes={shouldRefetchNotes} />}
            />

            {/* Other routes */}
            <Route path="/archive" element={<ArchiveComponent />} />
            <Route path="/trash" element={<TrashRoutes />} />
            <Route path="/favorites" element={<Favorites />} />

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard;
