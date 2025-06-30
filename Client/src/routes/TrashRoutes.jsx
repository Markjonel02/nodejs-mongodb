import {
  Box,
  Text,
  VStack,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Flex,
  Checkbox,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  useBreakpointValue,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaTrashAlt,
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
  FaRedo,
} from "react-icons/fa";

import { usePagination } from "../customhooks/usePagination";
import { PaginationControls } from "../components/PaginationControls";
import { NoteNavigation } from "../components/NoteNavigation";

import book from "../assets/img/wmremove-transformed.png";

// --- NoteCard Component (No changes needed, looks good!) ---
const NoteCard = ({
  note,
  isSelected,
  onSelect,
  onDelete,
  onRestore,
  isDeleting,
  isRestoring,
}) => {
  return (
    <Card
      key={note._id}
      bg={note.color || "white"}
      shadow="xl"
      borderRadius="xl"
      overflow="hidden"
      _hover={{ transform: "translateY(-5px)", shadow: "2xl" }}
      transition="all 0.3s ease-in-out"
      position="relative"
    >
      <Flex position="absolute" top={3} left={3} zIndex={1}>
        <Checkbox
          isChecked={isSelected}
          onChange={() => onSelect(note._id)}
          colorScheme="purple"
          size="lg"
        />
      </Flex>

      <Flex position="absolute" top={3} right={3} zIndex={1} gap={2}>
        <IconButton
          icon={<FaRedo />} // Restore icon
          aria-label="Restore note"
          bg={"transparent"}
          _hover={{ bg: "white", color: "purple.500" }}
          size="sm"
          borderRadius="full"
          onClick={() => onRestore(note._id)}
          isLoading={isRestoring}
        />
        <IconButton
          icon={<FaTrashAlt />}
          aria-label="Delete note"
          bg={"transparent"}
          _hover={{ bg: "white" }}
          size="sm"
          borderRadius="full"
          onClick={() => onDelete(note._id)}
          isLoading={isDeleting}
        />
      </Flex>

      <CardHeader pt={12} pb={2}>
        <Heading size="md" mb={2} color="purple.800" noOfLines={2}>
          {note.title.length > 15
            ? note.title.substring(0, 15) + "..."
            : note.title}
        </Heading>
      </CardHeader>
      <CardBody pt={2}>
        <Text fontSize="md" color="gray.700" noOfLines={5}>
          {note.notes.length > 20
            ? note.notes.substring(0, 20) + "..."
            : note.notes}
        </Text>
        <Flex justify="space-between" align="center" mt={3}>
          <Text fontSize="xs" color="gray.500">
            Deleted: {new Date(note.deletedAt).toLocaleDateString("en-US")}{" "}
            {/* Assuming 'deletedAt' field */}
          </Text>
          {note.isFavorite && (
            <Box as="span" color="red.500" fontSize="lg">
              <FaHeart />
            </Box>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

// --- Trashnotes Component ---
const Trashnotes = () => {
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState(null);
  const [noteToRestoreId, setNoteToRestoreId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // NEW STATE: To track login status

  // --- State for sorting and searching ---
  const [currentSortBy, setCurrentSortBy] = useState("dateDesc"); // Default sort: newest deleted first
  const [currentSearchTerm, setCurrentSearchTerm] = useState(""); // Default empty search

  const toast = useToast();
  const cancelRef = useRef();

  const fetchErrorToastId = "fetch-error-toast";

  // Disclosure hooks for dialogs
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const {
    isOpen: isSingleDeleteOpen,
    onOpen: onSingleDeleteOpen,
    onClose: onSingleDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isRestoreAllOpen,
    onOpen: onRestoreAllOpen,
    onClose: onRestoreAllClose,
  } = useDisclosure();
  const {
    isOpen: isSingleRestoreOpen,
    onOpen: onSingleRestoreOpen,
    onClose: onSingleRestoreClose,
  } = useDisclosure();

  // --- Data Fetching ---
  const fetchTrashedNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        setError("Not logged in. Please log in to view trash.");
        if (!toast.isActive("auth-required-toast")) {
          toast({
            id: "auth-required-toast",
            title: "Authentication Required",
            description: "Please log in to view your trashed notes.",
            status: "warning",
            position: "top",
            duration: 5000,
            isClosable: true,
            icon: <FaExclamationCircle />,
          });
        }
        setTrashedNotes([]); // Clear any old notes
        setLoading(false);
        setIsUserLoggedIn(false); // Update login status state
        return;
      }

      setIsUserLoggedIn(true); // User is logged in, set state to true
      const { data } = await axios.get(
        "https://nodejs-mongodb-server-7pfw.onrender.com/api/trashview", // API endpoint for trash
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT here
          },
        }
      );
      setTrashedNotes(data);
    } catch (err) {
      console.error("Error fetching trashed notes:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("Session expired or unauthorized. Please log in again.");
        if (!toast.isActive("auth-expired-toast")) {
          toast({
            id: "auth-expired-toast",
            title: "Unauthorized",
            description:
              "Your session has expired or you are not authorized. Please log in.",
            status: "error",
            position: "top",
            duration: 5000,
            isClosable: true,
            icon: <FaExclamationCircle />,
          });
        }
        // Clear the invalid token and user data, force re-login
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        setTrashedNotes([]); // Clear notes if logout/invalid token
        setIsUserLoggedIn(false); // Update login status state
        // Optionally, redirect to login page (requires react-router-dom or similar)
        // navigate('/login');
      } else {
        setError("Failed to load trashed notes.");
        if (!toast.isActive(fetchErrorToastId)) {
          toast({
            id: fetchErrorToastId,
            title: "Failed to load notes",
            description: "There was an error fetching your trashed notes.",
            status: "error",
            position: "top",
            duration: 5000,
            isClosable: true,
            icon: <FaExclamationCircle />,
            variant: "left-accent",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW useEffect: To monitor localStorage for login/logout changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("jwtToken");
      setIsUserLoggedIn(!!token);
    };

    checkLoginStatus(); // Set initial status

    window.addEventListener("storage", checkLoginStatus); // Listen for storage changes

    return () => {
      window.removeEventListener("storage", checkLoginStatus); // Cleanup
    };
  }, []);

  // MODIFIED useEffect: Now fetchTrashedNotes runs when `isUserLoggedIn` changes.
  useEffect(() => {
    if (isUserLoggedIn) {
      fetchTrashedNotes();
    } else {
      setTrashedNotes([]);
      setLoading(false);
      setError("Not logged in. Please log in to view trash."); // Set error explicitly here too
    }
  }, [isUserLoggedIn]); // Depend on `isUserLoggedIn` state

  // --- Search and Sort Logic (Memoized for performance) ---
  const filteredAndSortedNotes = useMemo(() => {
    let currentNotes = [...trashedNotes];

    // Apply search filter
    if (currentSearchTerm) {
      const lowercasedSearchTerm = currentSearchTerm.toLowerCase();
      currentNotes = currentNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowercasedSearchTerm) ||
          note.notes.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // Apply sort order
    if (currentSortBy === "az") {
      currentNotes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSortBy === "dateDesc") {
      currentNotes.sort(
        (a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)
      );
    } else if (currentSortBy === "dateAsc") {
      currentNotes.sort(
        (a, b) => new Date(a.deletedAt) - new Date(b.deletedAt)
      );
    }
    return currentNotes;
  }, [trashedNotes, currentSortBy, currentSearchTerm]);

  // --- Responsive Notes Per Page for Pagination ---
  const notesPerPage = useBreakpointValue({
    base: 4, // 4 notes on extra small screens (e.g., phones)
    sm: 4, // 4 notes on small screens
    md: 8, // 8 notes on medium screens (e.g., tablets)
    lg: 8, // 8 notes on large screens (e.g., desktops)
  });

  // --- Pagination Hook ---
  const { currentPage, currentItems, totalPages, paginate } = usePagination(
    filteredAndSortedNotes,
    notesPerPage
  );

  // --- Checkbox Handlers ---
  const handleCheckboxChange = useCallback((id) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelectAllChange = useCallback(
    (e) => {
      // Select only notes currently visible on the page
      setSelectedNotes(
        e.target.checked ? new Set(currentItems.map((n) => n._id)) : new Set()
      );
    },
    [currentItems] // Dependency: currentItems
  );

  // --- Delete Handlers ---
  const handleDeleteSelected = async () => {
    onDeleteAllClose();
    if (!selectedNotes.size) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setIsDeleting(false);
        return;
      }
      await axios.delete(
        "https://nodejs-mongodb-server-7pfw.onrender.com/api/delpermanentmutiple",
        {
          data: { ids: Array.from(selectedNotes) }, // Ensure data is wrapped correctly
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT here
          },
        }
      );

      toast({
        title: "Notes Permanently Deleted",
        description: `${selectedNotes.size} note(s) have been permanently deleted from trash.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });

      setSelectedNotes(new Set()); // Clear selection after deletion
      fetchTrashedNotes(); // Re-fetch notes to update UI
    } catch (err) {
      console.error("Error deleting selected notes:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error permanently deleting the selected notes.";
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleNote = async (id) => {
    onSingleDeleteClose();
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setIsDeleting(false);
        return;
      }
      await axios.delete(
        `https://nodejs-mongodb-server-7pfw.onrender.com/api/trashdelete/${id}`, // API endpoint for single permanent deletion
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT here
          },
        }
      );
      toast({
        title: "Note Permanently Deleted",
        description: "The note has been permanently deleted from trash.",
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });
      setSelectedNotes((prev) => {
        const next = new Set(prev);
        next.delete(id); // Remove the deleted note from selection
        return next;
      });
      fetchTrashedNotes(); // Re-fetch notes to update UI
    } catch (err) {
      console.error("Error deleting single note:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error permanently deleting this note.";
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsDeleting(false);
      setNoteToDeleteId(null);
    }
  };

  // --- Restore Handlers ---
  const handleRestoreSelected = async () => {
    onRestoreAllClose();
    if (!selectedNotes.size) return;

    setIsRestoring(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setIsRestoring(false);
        return;
      }
      const response = await axios.put(
        "https://nodejs-mongodb-server-7pfw.onrender.com/api/restore-multiple-trash", // API endpoint to restore from trash to main notes
        { ids: Array.from(selectedNotes) },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT here
          },
        }
      );
      toast({
        title: "Notes Restored",
        description:
          response.data.message ||
          `${selectedNotes.size} note(s) have been restored from trash.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });
      setSelectedNotes(new Set()); // Clear selection after restoration
      fetchTrashedNotes(); // Re-fetch notes to update UI
    } catch (err) {
      console.error("Error restoring selected notes:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error restoring the selected notes.";
      toast({
        title: "Restore Failed",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreSingleNote = async (id) => {
    onSingleRestoreClose();
    setIsRestoring(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setIsRestoring(false);
        return;
      }
      const response = await axios.post(
        `https://nodejs-mongodb-server-7pfw.onrender.com/api/restore-single-trash/${id}`, // API endpoint to restore single note from trash
        {}, // Empty body for POST request if only ID is in URL
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT here
          },
        }
      );
      toast({
        title: "Note Restored",
        description:
          response.data.message ||
          "The note has been successfully restored from trash.",
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });
      setSelectedNotes((prev) => {
        const next = new Set(prev);
        next.delete(id); // Remove the restored note from selection
        return next;
      });
      fetchTrashedNotes(); // Re-fetch notes to update UI
    } catch (err) {
      console.error("Error restoring single note:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error restoring this note.";
      toast({
        title: "Restore Failed",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsRestoring(false);
      setNoteToRestoreId(null);
    }
  };

  // --- Dialog Openers ---
  const openSingleDeleteDialog = useCallback(
    (id) => {
      setNoteToDeleteId(id);
      onSingleDeleteOpen();
    },
    [onSingleDeleteOpen]
  );

  const openSingleRestoreDialog = useCallback(
    (id) => {
      setNoteToRestoreId(id);
      onSingleRestoreOpen();
    },
    [onSingleRestoreOpen]
  );

  // --- Handlers for NoteNavigation (Search & Sort) ---
  const handleSearchChange = useCallback(
    (term) => {
      setCurrentSearchTerm(term);
      paginate(1); // Reset to first page on search
    },
    [paginate]
  );

  const handleSortChange = useCallback(
    (sortOrder) => {
      setCurrentSortBy(sortOrder);
      paginate(1); // Reset to first page on sort
    },
    [paginate]
  );

  // --- Memoized Render of Paginated Notes ---
  const renderedNotes = useMemo(
    () =>
      currentItems.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          isSelected={selectedNotes.has(note._id)}
          onSelect={handleCheckboxChange}
          onDelete={openSingleDeleteDialog}
          onRestore={openSingleRestoreDialog}
          isDeleting={isDeleting && noteToDeleteId === note._id}
          isRestoring={isRestoring && noteToRestoreId === note._id}
        />
      )),
    [
      currentItems,
      selectedNotes,
      handleCheckboxChange,
      openSingleDeleteDialog,
      openSingleRestoreDialog,
      isDeleting,
      noteToDeleteId,
      isRestoring,
      noteToRestoreId,
    ]
  );

  // --- Loading and Empty State ---
  if (loading) {
    // Show skeleton if logged in and loading, else spinner
    if (isUserLoggedIn) {
      return (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 2, lg: 4 }} // Columns for skeleton loading
          spacing={6}
          p={8}
          mt={4}
          gap={4}
        >
          {[...Array(notesPerPage)].map((_, index) => (
            <Box
              key={index}
              p={6}
              bg="gray.100"
              borderRadius="lg"
              position="relative"
              width="100%"
              boxShadow="md"
              textAlign="left"
            >
              <Skeleton height="30px" width="30px" mb={4} />
              <SkeletonText mt="4" noOfLines={1} spacing="4" height="20px" />
              <SkeletonText
                mt="4"
                noOfLines={3}
                spacing="4"
                skeletonHeight="10px"
              />
              <Skeleton mt="4" height="15px" width="50%" />
            </Box>
          ))}
        </SimpleGrid>
      );
    } else {
      return (
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" color="purple.500" />
          <Text ml={4} color="gray.600">
            Loading...
          </Text>
        </Flex>
      );
    }
  }

  // --- Main Component Render ---
  return (
    <Box p={8} bg="gray.50" minH="100vh" pb="80px">
      <Heading mb={8} textAlign="center">
        Your Trash
      </Heading>

      {/* Conditionally render NoteNavigation based on login status */}
      {isUserLoggedIn && (
        <NoteNavigation
          onSearch={handleSearchChange}
          onSort={handleSortChange}
          currentSearchTerm={currentSearchTerm}
          currentSortBy={currentSortBy}
        />
      )}

      {/* Action buttons (Select All, Restore Selected, Delete Selected) */}
      {isUserLoggedIn && trashedNotes.length > 0 && (
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          p={4}
          bg="white"
          borderRadius="lg"
          shadow="sm"
        >
          <Checkbox
            isChecked={
              selectedNotes.size === currentItems.length &&
              currentItems.length > 0
            }
            isIndeterminate={
              selectedNotes.size > 0 && selectedNotes.size < currentItems.length
            }
            onChange={handleSelectAllChange}
            colorScheme="purple"
            size="lg"
          >
            Select All
          </Checkbox>
          <Flex gap={4}>
            <Button
              variant="ghost"
              leftIcon={<FaRedo />}
              onClick={onRestoreAllOpen}
              isDisabled={!selectedNotes.size}
              isLoading={isRestoring}
            >
              Restore ({selectedNotes.size})
            </Button>
            <Button
              variant="ghost"
              colorScheme="red"
              leftIcon={<FaTrashAlt />}
              onClick={onDeleteAllOpen}
              isDisabled={!selectedNotes.size}
              isLoading={isDeleting}
            >
              Delete Permanently ({selectedNotes.size})
            </Button>
          </Flex>
        </Flex>
      )}

      {/* Conditional rendering for notes grid or empty state */}
      {isUserLoggedIn ? ( // If logged in, show notes or empty message
        currentItems.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6}>
            {renderedNotes}
          </SimpleGrid>
        ) : (
          <VStack
            spacing={4}
            textAlign="center"
            mt={8}
            {...(filteredAndSortedNotes.length === 0 && !loading
              ? { p: 10 }
              : {})}
          >
            <Text fontSize="1.1em" color="gray.600" fontWeight="semibold">
              {(currentSearchTerm || currentSortBy !== "dateDesc") &&
              filteredAndSortedNotes.length === 0 &&
              !loading
                ? "No matching notes found in trash."
                : trashedNotes.length === 0 && !loading
                ? "Your trash is empty."
                : currentItems.length === 0 && filteredAndSortedNotes.length > 0
                ? "No matching notes found on this page in trash."
                : ""}
            </Text>
            {(trashedNotes.length === 0 ||
              filteredAndSortedNotes.length === 0 ||
              currentItems.length === 0) &&
              !loading && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="200px"
                  h="auto"
                  mx="auto"
                  mt={4}
                >
                  <img
                    src={book}
                    alt="No notes"
                    style={{
                      display: "block",
                      margin: "auto",
                      maxWidth: "100%",
                    }}
                  />
                </Box>
              )}
            {error && (
              <Text fontSize="md" color="red.500">
                Error: {error}
              </Text>
            )}
          </VStack>
        )
      ) : (
        // If not logged in, show a direct message
        <Text textAlign="center" mt={8} fontSize="lg" color="red.500">
          Not logged in. Please log in to view trash notes.
        </Text>
      )}

      {/* Pagination Controls */}
      {isUserLoggedIn && filteredAndSortedNotes.length > 0 && !loading && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* --- AlertDialogs for Confirmations (unchanged) --- */}
      {/* ... (AlertDialogs as per your original code) ... */}

      {/* AlertDialog for Delete Selected Notes (Permanent) */}
      <AlertDialog
        isOpen={isDeleteAllOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAllClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Permanently Delete Selected Notes
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to permanently delete {selectedNotes.size}{" "}
              note(s)? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAllClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteSelected}
                ml={3}
                isLoading={isDeleting}
              >
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* AlertDialog for Single Note Deletion (Permanent) */}
      <AlertDialog
        isOpen={isSingleDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onSingleDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Permanently Delete Note</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to permanently delete this note? This action
              cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onSingleDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDeleteSingleNote(noteToDeleteId)}
                ml={3}
                isLoading={isDeleting}
              >
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* AlertDialog for Restore Selected Notes */}
      <AlertDialog
        isOpen={isRestoreAllOpen}
        leastDestructiveRef={cancelRef}
        onClose={onRestoreAllClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Restore Selected Notes</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to restore {selectedNotes.size} note(s) from
              trash to your main notes?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRestoreAllClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleRestoreSelected}
                ml={3}
                isLoading={isRestoring}
              >
                Restore
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* AlertDialog for Single Note Restore */}
      <AlertDialog
        isOpen={isSingleRestoreOpen}
        leastDestructiveRef={cancelRef}
        onClose={onSingleRestoreClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Restore Note</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to restore this note from trash to your main
              notes?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onSingleRestoreClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={() => handleRestoreSingleNote(noteToRestoreId)}
                ml={3}
                isLoading={isRestoring}
              >
                Restore
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Trashnotes;
