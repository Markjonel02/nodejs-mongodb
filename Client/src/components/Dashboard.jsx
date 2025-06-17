import { useState, Suspense, lazy } from "react";
import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import TestNav from "../components/TestNav";
import Skeletons from "./Spinner";

const ArchiveComponent = lazy(() => import("../routes/Archivednotes"));
const TestFolder = lazy(() => import("../routes/TestFolder"));
const TrashRoutes = lazy(() => import("../routes/TrashRoutes"));
const Favorites = lazy(() => import("../routes/Favorites"));
const NotfoundPage = lazy(() => import("../routes/Nopage")); // Ensure the file exists

const Dashboard = () => {
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);

  return (
    <Routes>
      {/* 404 Route */}
      <Route path="*" element={<NotfoundPage />} />

      {/* All other routes with side panel */}
      <Route
        path="/"
        element={
          <Box display="flex" width="100%" minH="100vh" bg="gray.50">
            <TestNav
              onNoteAdded={() => setShouldRefetchNotes((prev) => !prev)}
            />

            {/* Main Content Area */}
            <Box width="100%" flex="1">
              <Suspense fallback={<Skeletons />}>
                <Routes>
                  <Route
                    index
                    path="/"
                    element={
                      <TestFolder shouldRefetchNotes={shouldRefetchNotes} />
                    }
                  />
                  <Route path="/archive" element={<ArchiveComponent />} />
                  <Route path="/trash" element={<TrashRoutes />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Routes>
              </Suspense>
            </Box>
          </Box>
        }
      ></Route>
    </Routes>
  );
};

export default Dashboard;
