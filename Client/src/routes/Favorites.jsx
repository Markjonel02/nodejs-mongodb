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
  useBreakpointValue, // Import useBreakpointValue for responsive pagination
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
  FaRegHeart, // Import FaRegHeart for unfavorite icon
} from "react-icons/fa";

// --- Import your custom hooks/components ---
import { usePagination } from "../customhooks/usePagination"; // Adjust this path if necessary
import { PaginationControls } from "../components/PaginationControls"; // Adjust this path if necessary
import { NoteNavigation } from "../components/NoteNavigation"; // Adjust this path if necessary

// Import the placeholder image for no notes found
import book from "../assets/img/wmremove-transformed.png"; // Adjust this path if necessary
import { axiosInstance } from "../lib/axiosInstance";
// --- FavoriteNoteCard Component ---
const FavoriteNoteCard = ({
  note,
  isSelected,
  onSelect,
  onToggleFavorite,
  isTogglingFavorite,
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
          icon={
            note.isFavorite ? (
              <FaHeart color="red.500" />
            ) : (
              <FaRegHeart color="red.500" />
            )
          } // Filled heart if favorite, outline if not
          aria-label="Toggle favorite"
          bg={"transparent"}
          _hover={{ bg: "white", color: "red" }}
          size="sm"
          borderRadius="full"
          onClick={() => onToggleFavorite(note._id, !note.isFavorite)} // Pass current favorite status
          isLoading={isTogglingFavorite}
        />
      </Flex>

      <CardHeader pt={12} pb={2}>
        <Heading size="md" mb={2} color="purple.800" noOfLines={2}>
          {/* Apply truncation to title */}
          {note.title.length > 15
            ? note.title.substring(0, 15) + "..."
            : note.title}
        </Heading>
      </CardHeader>
      <CardBody pt={2}>
        <Text fontSize="md" color="gray.700" noOfLines={5}>
          {/* Apply truncation to notes content */}
          {note.notes.length > 20
            ? note.notes.substring(0, 20) + "..."
            : note.notes}
        </Text>
        <Flex justify="space-between" align="center" mt={3}>
          <Text fontSize="xs" color="gray.500">
            Created: {new Date(note.createdAt).toLocaleDateString("en-US")}{" "}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

// --- Favorites Component ---
const Favorites = () => {
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [noteToToggleFavoriteId, setNoteToToggleFavoriteId] = useState(null);
  const [isFavoriteStatusToToggle, setIsFavoriteStatusToToggle] =
    useState(null);

  // --- State for sorting and searching ---
  const [currentSortBy, setCurrentSortBy] = useState("dateDesc"); // Default sort: newest created first
  const [currentSearchTerm, setCurrentSearchTerm] = useState(""); // Default empty search

  const toast = useToast();
  const cancelRef = useRef();

  const fetchErrorToastId = "fetch-error-toast";

  // Disclosure hooks for dialogs
  const {
    isOpen: isUnfavoriteAllOpen,
    onOpen: onUnfavoriteAllOpen,
    onClose: onUnfavoriteAllClose,
  } = useDisclosure();
  const {
    isOpen: isSingleUnfavoriteOpen,
    onOpen: onSingleUnfavoriteOpen,
    onClose: onSingleUnfavoriteClose,
  } = useDisclosure();

  // --- Effects ---
  useEffect(() => {
    fetchFavoriteNotes();
  }, []);

  // --- Data Fetching ---
  const fetchFavoriteNotes = async () => {
    setLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
      const { data } = await axios.get(
        "https://nodejs-mongodb-server-7pfw.onrender.com/api/getfavorites",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
=======
      const { data } = await axiosInstance.get("/getfavorites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
>>>>>>> production
      setFavoriteNotes(data);
    } catch (err) {
      console.error("Error fetching favorite notes:", err);

      if (err.response) {
        console.error("Server responded with error:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("No response received from server:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }
      console.error("Axios config:", err.config);

      const errorMessage =
        err.response?.data?.message ||
        "There was an error fetching your favorite notes.";
      setError("Failed to load favorite notes.");
      if (!toast.isActive(fetchErrorToastId)) {
        toast({
          id: fetchErrorToastId,
          title: "Failed to load notes",
          description: errorMessage,
          status: "error",
          position: "top",
          duration: 5000,
          isClosable: true,
          icon: <FaExclamationCircle />,
          variant: "left-accent",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Search and Sort Logic (Memoized for performance) ---
  const filteredAndSortedNotes = useMemo(() => {
    let currentNotes = [...favoriteNotes];

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
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (currentSortBy === "dateAsc") {
      currentNotes.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return currentNotes;
  }, [favoriteNotes, currentSortBy, currentSearchTerm]);

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

  // --- Favorite Toggle Handlers ---
  const handleToggleFavoriteSelected = async () => {
    onUnfavoriteAllClose();
    if (!selectedNotes.size) {
      return;
    }

    setIsTogglingFavorite(true);
    try {
<<<<<<< HEAD
      await axios.patch(
        "https://nodejs-mongodb-server-7pfw.onrender.com/api/favorite/multiple-unfavorite",
=======
      await axiosInstance.patch(
        "/favorite/multiple-unfavorite",
>>>>>>> production
        {
          ids: Array.from(selectedNotes),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      toast({
        title: "Notes Unfavorited",
        description: `${selectedNotes.size} note(s) have been unfavorited.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });

      setSelectedNotes(new Set());
      fetchFavoriteNotes();
    } catch (err) {
      console.error("Error unfavoriting selected notes:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error unfavoriting the selected notes.";

      toast({
        title: "Unfavorite Failed",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleToggleSingleFavorite = async (id, currentFavoriteStatus) => {
    onSingleUnfavoriteClose();
    setIsTogglingFavorite(true);

    try {
<<<<<<< HEAD
      await axios.put(
        `https://nodejs-mongodb-server-7pfw.onrender.com/api/favorites/single-unfavorite/${id}`,
=======
      await axiosInstance.put(
        `/favorites/single-unfavorite/${id}`,
>>>>>>> production
        {
          isFavorite: false,
          currentFavoriteStatus: currentFavoriteStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      toast({
        title: "Note Unfavorited",
        description:
          "The note has been successfully removed from your favorites.",
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });

      setSelectedNotes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchFavoriteNotes();
    } catch (err) {
      console.error("Error unfavoriting single note:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error removing this note from favorites.";
      toast({
        title: "Unfavorite Failed",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsTogglingFavorite(false);
      setNoteToToggleFavoriteId(null);
      setIsFavoriteStatusToToggle(null);
    }
  };

  // --- Dialog Openers ---
  const openSingleUnfavoriteDialog = useCallback(
    (id, currentFavoriteStatus) => {
      setNoteToToggleFavoriteId(id);
      setIsFavoriteStatusToToggle(currentFavoriteStatus);
      onSingleUnfavoriteOpen();
    },
    [onSingleUnfavoriteOpen]
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
        <FavoriteNoteCard
          key={note._id}
          note={note}
          isSelected={selectedNotes.has(note._id)}
          onSelect={handleCheckboxChange}
          onToggleFavorite={openSingleUnfavoriteDialog}
          isTogglingFavorite={
            isTogglingFavorite && noteToToggleFavoriteId === note._id
          }
        />
      )),
    [
      currentItems,
      selectedNotes,
      handleCheckboxChange,
      openSingleUnfavoriteDialog,
      isTogglingFavorite,
      noteToToggleFavoriteId,
    ]
  );

  // --- Loading and Empty State ---
  if (loading)
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="purple.500" />
        <Text ml={4} color="gray.600">
          Loading favorite notes...
        </Text>
      </Flex>
    );

  // --- Main Component Render ---
  return (
    <Box p={8} bg="gray.50" minH="100vh" pb="80px">
      <Heading mb={8} textAlign="center">
        Your Favorites
      </Heading>

      {/* Note Navigation (Search and Sort) */}
      <NoteNavigation
        onSearch={handleSearchChange}
        onSort={handleSortChange}
        currentSearchTerm={currentSearchTerm}
        currentSortBy={currentSortBy}
      />

      {/* Action buttons (Select All, Unfavorite Selected) */}
      {favoriteNotes.length > 0 && ( // Only show controls if there are any notes in favorites
        <Flex justify="space-between" align="center" mb={6} p={4}>
          <Checkbox
            // Check if all notes on the current page are selected
            isChecked={
              selectedNotes.size === currentItems.length &&
              currentItems.length > 0
            }
            // Check if some but not all notes on the current page are selected
            isIndeterminate={
              selectedNotes.size > 0 && selectedNotes.size < currentItems.length
            }
            onChange={handleSelectAllChange}
            colorScheme="purple"
            size="lg"
          >
            Select All (Page)
          </Checkbox>
          <Flex gap={4}>
            <Button
              variant="solid" // Changed to solid for better visibility
              color={"red.300"}
              leftIcon={<FaRegHeart />}
              bg={"transparent"}
              onClick={onUnfavoriteAllOpen}
              isDisabled={!selectedNotes.size} // Disable if no notes are selected
              isLoading={isTogglingFavorite}
            >
              Unfavorite ({selectedNotes.size})
            </Button>
          </Flex>
        </Flex>
      )}

      {currentItems.length > 0 ? ( // Display notes if there are items on the current page after filtering/sorting
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6}>
          {renderedNotes}
        </SimpleGrid>
      ) : (
        // Conditional rendering for the "no notes" message and its background
        <VStack
          spacing={4}
          textAlign="center"
          mt={8}
          // Apply background/shadow only if there are NO filtered notes at all
          // or if the initial fetch resulted in no notes.
          {...(filteredAndSortedNotes.length === 0 && !loading
            ? { p: 10 }
            : {})}
        >
          <Text fontSize="1.1em" color="gray.600" fontWeight="semibold">
            {
              (currentSearchTerm || currentSortBy !== "dateDesc") &&
              filteredAndSortedNotes.length === 0 &&
              !loading
                ? "No matching notes found in your favorites." // When search/sort yields no results
                : favoriteNotes.length === 0 && !loading // When there are absolutely no favorite notes
                ? "You don't have any favorite notes yet."
                : filteredAndSortedNotes.length > 0 &&
                  currentItems.length === 0 &&
                  !loading // When notes exist but not on current page due to pagination (unlikely with pagination)
                ? "No favorite notes found on this page matching your criteria."
                : "" // Should not happen if currentItems.length > 0
            }
          </Text>
          {/* Display book image only when there are no notes at all or no matching results */}
          {(favoriteNotes.length === 0 ||
            filteredAndSortedNotes.length === 0 ||
            currentItems.length === 0) &&
            !loading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                w="200px" // Adjust width as needed
                h="auto"
                mx="auto"
                mt={4} // Add some margin top
              >
                <img
                  src={book}
                  alt="No notes"
                  style={{ display: "block", margin: "auto", maxWidth: "100%" }}
                />
              </Box>
            )}
          {error && (
            <Text fontSize="md" color="red.500">
              Error: {error}
            </Text>
          )}
        </VStack>
      )}

      {/* Pagination Controls */}
      {/* Only show pagination if there are filtered and sorted notes to paginate */}
      {filteredAndSortedNotes.length > 0 && !loading && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* --- AlertDialogs for Confirmations (unchanged) --- */}

      {/* AlertDialog for Unfavorite Selected Notes */}
      <AlertDialog
        isOpen={isUnfavoriteAllOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUnfavoriteAllClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Unfavorite Selected Notes</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to unfavorite {selectedNotes.size} note(s)?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onUnfavoriteAllClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleToggleFavoriteSelected}
                ml={3}
                isLoading={isTogglingFavorite}
              >
                Unfavorite
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* AlertDialog for Single Note Unfavorite */}
      <AlertDialog
        isOpen={isSingleUnfavoriteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onSingleUnfavoriteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Unfavorite Note</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to unfavorite this note?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onSingleUnfavoriteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={() =>
                  handleToggleSingleFavorite(
                    noteToToggleFavoriteId,
                    isFavoriteStatusToToggle
                  )
                }
                ml={3}
                isLoading={isTogglingFavorite}
              >
                Unfavorite
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Favorites;
