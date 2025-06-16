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
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
  FaRegHeart, // Import FaRegHeart for unfavorite icon
} from "react-icons/fa";

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
          icon={note.isFavorite ? <FaHeart color="red.500" /> : <FaRegHeart />} // Filled heart if favorite, outline if not
          aria-label="Toggle favorite"
          bg={"transparent"}
          _hover={{ bg: "white", color: "purple.500" }}
          size="sm"
          borderRadius="full"
          onClick={() => onToggleFavorite(note._id, !note.isFavorite)} // Pass current favorite status
          isLoading={isTogglingFavorite}
        />
      </Flex>

      <CardHeader pt={12} pb={2}>
        <Heading size="md" mb={2} color="purple.800" noOfLines={2}>
          {note.title}
        </Heading>
      </CardHeader>
      <CardBody pt={2}>
        <Text fontSize="md" color="gray.700" noOfLines={5}>
          {note.notes}
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
      // This URL must match your backend's route
      const { data } = await axios.get(
        "http://localhost:5000/api/getfavorites"
      );
      setFavoriteNotes(data);
    } catch (err) {
      console.error("Error fetching favorite notes:", err);

      // Enhanced logging for debugging Axios errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server responded with error:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
        console.error("No response received from server:", err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", err.message);
      }
      console.error("Axios config:", err.config);

      const errorMessage =
        err.response?.data?.message ||
        "There was an error fetching your favorite notes.";
      setError("Failed to load favorite notes."); // Keep the generic error for display
      if (!toast.isActive(fetchErrorToastId)) {
        toast({
          id: fetchErrorToastId,
          title: "Failed to load notes",
          description: errorMessage, // Use specific error message from backend if available
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
      setSelectedNotes(
        e.target.checked ? new Set(favoriteNotes.map((n) => n._id)) : new Set()
      );
    },
    [favoriteNotes]
  );

  // --- Favorite Toggle Handlers ---
  const handleToggleFavoriteSelected = async () => {
    onUnfavoriteAllClose(); // Close any related modals/drawers
    if (!selectedNotes.size) {
      // No notes selected, do nothing
      return;
    }

    setIsTogglingFavorite(true); // Indicate that an operation is in progress
    try {
      // Frontend sends 'ids' in the request body, which matches the modified backend
      await axios.put(
        "http://localhost:5000/api/favorite/multiple-unfavorite",
        {
          ids: Array.from(selectedNotes), // Convert Set to Array
        }
      );

      // Success Toast
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

      setSelectedNotes(new Set()); // Clear selected notes after successful unfavorite
      fetchFavoriteNotes(); // Refetch to update the list, showing the changes
    } catch (err) {
      console.error("Error unfavoriting selected notes:", err);
      const errorMessage =
        err.response?.data?.message || // Get specific message from backend if available
        "There was an error unfavoriting the selected notes.";

      // Error Toast
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
      setIsTogglingFavorite(false); // Reset loading state
    }
  };

  const handleToggleSingleFavorite = async (id, currentFavoriteStatus) => {
    onSingleUnfavoriteClose(); // Close dialog if opened for unfavorite
    setIsTogglingFavorite(true);

    try {
      // API endpoint to set isFavorite to FALSE for this note
      await axios.put(
        `http://localhost:5000/api/favorites/single-unfavorite/${id}`,
        {
          isFavorite: false, // Explicitly set to false to unfavorite
        }
      );

      toast({
        title: "Note Unfavorited", // Always this title
        description:
          "The note has been successfully removed from your favorites.", // Always this description
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });

      setSelectedNotes((prev) => {
        const next = new Set(prev);
        next.delete(id); // Deselect the note if it was selected
        return next;
      });
      fetchFavoriteNotes(); // Refetch to update the list (removing the unfavorited note)
    } catch (err) {
      console.error("Error unfavoriting single note:", err); // Updated console error message
      const errorMessage =
        err.response?.data?.message ||
        "There was an error removing this note from favorites."; // Updated error message
      toast({
        title: "Unfavorite Failed", // Updated toast title for error
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
      setIsFavoriteStatusToToggle(null); // This might not be strictly needed now, but harmless
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

  // --- Memoized Render ---
  const renderedNotes = useMemo(
    () =>
      favoriteNotes.map((note) => (
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
      favoriteNotes,
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
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading mb={8} textAlign="center" color="purple.700">
        Your Favorites
      </Heading>

      {favoriteNotes.length > 0 && (
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
            isChecked={selectedNotes.size === favoriteNotes.length}
            isIndeterminate={
              selectedNotes.size > 0 &&
              selectedNotes.size < favoriteNotes.length
            }
            onChange={handleSelectAllChange}
            colorScheme="purple"
            size="lg"
          >
            Select All
          </Checkbox>
          <Flex gap={4}>
            <Button
              variant="red"
              leftIcon={<FaRegHeart />}
              onClick={onUnfavoriteAllOpen}
              isDisabled={!selectedNotes.size}
              isLoading={isTogglingFavorite}
            >
              Unfavorite ({selectedNotes.size})
            </Button>
          </Flex>
        </Flex>
      )}

      {favoriteNotes.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6}>
          {renderedNotes}
        </SimpleGrid>
      ) : (
        <VStack
          spacing={4}
          p={10}
          bg="white"
          borderRadius="lg"
          shadow="md"
          textAlign="center"
        >
          <Text fontSize="1.1em" color="gray.600" fontWeight="semibold">
            You don't have any favorite notes yet.
          </Text>
          {error && (
            <Text fontSize="md" color="red.500">
              Error: {error}
            </Text>
          )}
        </VStack>
      )}

      {/* --- AlertDialogs for Confirmations --- */}

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
