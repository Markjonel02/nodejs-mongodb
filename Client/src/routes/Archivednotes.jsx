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
  useToast, // For notifications
  Spinner, // For loading indicator
  AlertDialog, // For confirmation dialogs
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure, // For managing AlertDialog open/close
  IconButton, // For delete icon button
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react"; // useRef for AlertDialog
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa"; // For delete icon

const Archivednotes = () => {
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set()); // Using Set for efficient lookups of selected note IDs
  const [isDeleting, setIsDeleting] = useState(false); // State to indicate if a delete operation is in progress
  const toast = useToast(); // Initialize Chakra UI toast for notifications

  // --- State and Handlers for Delete All Confirmation Dialog ---
  // useDisclosure hook to manage the open/close state of the "Delete All" AlertDialog
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  // useRef to link the "Cancel" button in the AlertDialog for accessibility (initial focus)
  const cancelRef = useRef();

  // --- State and Handlers for Single Note Delete Confirmation Dialog ---
  // useDisclosure hook to manage the open/close state of the "Delete Single Note" AlertDialog
  const {
    isOpen: isSingleDeleteOpen,
    onOpen: onSingleDeleteOpen,
    onClose: onSingleDeleteClose,
  } = useDisclosure();
  // State to temporarily store the ID of the note being considered for single deletion
  const [noteToDeleteId, setNoteToDeleteId] = useState(null);

  useEffect(() => {
    fetchArchivedNotes();
  }, []); // Empty dependency array ensures this runs only once

  const fetchArchivedNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/getarchivenotes`
      );
      setArchivedNotes(response.data);
      console.log(`Successfully retrieved archived notes:`, response.data);
    } catch (err) {
      console.error(`Failed to retrieve archived notes:`, err);
      setError("Failed to load archived notes. Please try again later.");
      toast({
        title: "Error fetching notes.",
        description: "Could not load archived notes.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (noteId) => {
    setSelectedNotes((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      return newSelected;
    });
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      const allNoteIds = new Set(archivedNotes.map((note) => note._id));
      setSelectedNotes(allNoteIds);
    } else {
      setSelectedNotes(new Set());
    }
  };

  // --- Function to handle deletion of selected notes (multiple delete) ---
  const handleDeleteSelected = async () => {
    onDeleteAllClose(); // Close the "Delete All" confirmation dialog
    if (selectedNotes.size === 0) {
      // Check if any notes are actually selected
      toast({
        title: "No notes selected.",
        description: "Please select notes to delete.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDeleting(true); // Set deleting state to true (disables buttons, shows loaders)
    try {
      // Make an Axios POST request to your backend's batch delete endpoint
      // It sends an array of selected note IDs in the request body.
      // Ensure your backend endpoint is configured to handle POST requests at this path
      // and expects an array of 'ids' in the body.
      await axios.post(
        `http://localhost:5000/api/archivednotes/delete-multiple`,
        {
          ids: Array.from(selectedNotes), // Convert the Set of IDs to an array
        }
      );

      toast({
        // Show success toast
        title: "Notes deleted.",
        description: `${selectedNotes.size} selected note(s) have been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSelectedNotes(new Set()); // Clear the selection after successful deletion
      fetchArchivedNotes(); // Re-fetch notes to update the displayed list
    } catch (err) {
      console.error("Error deleting selected notes:", err);
      toast({
        // Show error toast
        title: "Deletion failed.",
        description: "There was an error deleting the notes.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  // --- Function to handle deletion of a single note ---
  const handleDeleteSingleNote = async (noteId) => {
    onSingleDeleteClose(); // Close the single note confirmation dialog
    setIsDeleting(true); // Set deleting state to true
    try {
      // Make an Axios DELETE request to your backend's single delete endpoint
      // The note ID is passed as a URL parameter.
      // Ensure your backend endpoint is configured to handle DELETE requests at this path.
      await axios.delete(`http://localhost:5000/api/archivednotes/${noteId}`);

      toast({
        // Show success toast
        title: "Note deleted.",
        description: "The note has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSelectedNotes((prev) => {
        // If the deleted note was selected, remove it from selection
        const newSelected = new Set(prev);
        newSelected.delete(noteId);
        return newSelected;
      });
      fetchArchivedNotes(); // Re-fetch notes to update the displayed list
    } catch (err) {
      console.error(`Error deleting note ${noteId}:`, err);
      toast({
        // Show error toast
        title: "Deletion failed.",
        description: "There was an error deleting the note.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false); // Reset deleting state
      setNoteToDeleteId(null); // Clear the stored ID of the note that was to be deleted
    }
  };

  // Function to open the single delete confirmation dialog and set the note ID
  const openSingleDeleteDialog = (noteId) => {
    setNoteToDeleteId(noteId); // Store the ID of the note to be deleted
    onSingleDeleteOpen(); // Open the AlertDialog
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text ml={4} fontSize="xl" color="gray.500">
          Loading archived notes...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center" bg="red.50" borderRadius="md" m={8}>
        <Text fontSize="xl" color="red.700" fontWeight="bold">
          {error}
        </Text>
        <Button
          mt={4}
          onClick={fetchArchivedNotes}
          colorScheme="red"
          variant="outline"
        >
          Retry Loading Notes
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading
        as="h2"
        size="xl"
        mb={8}
        textAlign="center"
        color="purple.700"
        textShadow="1px 1px 2px rgba(0,0,0,0.1)"
      >
        Your Archived Notes
      </Heading>

      {archivedNotes.length > 0 && (
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
              selectedNotes.size === archivedNotes.length &&
              archivedNotes.length > 0
            }
            isIndeterminate={
              selectedNotes.size > 0 &&
              selectedNotes.size < archivedNotes.length
            }
            onChange={handleSelectAllChange}
            colorScheme="purple"
            size="lg"
          >
            Select All
          </Checkbox>
          <Button
            colorScheme="red"
            leftIcon={<FaTrashAlt />}
            onClick={onDeleteAllOpen}
            isDisabled={selectedNotes.size === 0 || isDeleting}
            isLoading={isDeleting}
            loadingText="Deleting..."
          >
            Delete Selected ({selectedNotes.size})
          </Button>
        </Flex>
      )}

      {archivedNotes.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6}>
          {archivedNotes.map((note) => (
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
                  isChecked={selectedNotes.has(note._id)}
                  onChange={() => handleCheckboxChange(note._id)}
                  colorScheme="purple"
                  size="lg"
                />
              </Flex>

              <Flex position="absolute" top={3} right={3} zIndex={1}>
                <IconButton
                  icon={<FaTrashAlt />}
                  aria-label="Delete note"
                  bg={"transparent"}
                  _hover={{ bg: "white" }}
                  size="sm"
                  borderRadius="full"
                  onClick={() => openSingleDeleteDialog(note._id)}
                  isLoading={isDeleting && noteToDeleteId === note._id}
                />
              </Flex>

              <CardHeader pt={12} pb={2}>
                <Heading size="md" mb={2} color="purple.800" noOfLines={2}>
                  {note.title}
                </Heading>
              </CardHeader>
              <CardBody pt={2}>
                <Text fontSize="md" color="gray.700" noOfLines={5}>
                  {note.content}
                </Text>
                {note.isFavorite && (
                  <Text
                    fontSize="sm"
                    color="yellow.600"
                    fontWeight="bold"
                    mt={3}
                  >
                    ⭐ Favorite
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Archived:{" "}
                  {new Date(note.archivedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </CardBody>
            </Card>
          ))}
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
          <Text fontSize="2xl" color="gray.600" fontWeight="semibold">
            No archived notes to display.
          </Text>
          <Text fontSize="md" color="gray.500">
            It looks like your archive is empty. Start archiving notes to see
            them here!
          </Text>
        </VStack>
      )}

      {/* --- AlertDialog for Delete All Confirmation --- */}
      <AlertDialog
        isOpen={isDeleteAllOpen} // Controls if dialog is open
        leastDestructiveRef={cancelRef} // Sets initial focus to the cancel button (accessibility)
        onClose={onDeleteAllClose} // Function to call when dialog is closed (e.g., by clicking outside)
      >
        <AlertDialogOverlay>
          {" "}
          {/* Darkens the background */}
          <AlertDialogContent>
            {" "}
            {/* The actual dialog box */}
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Selected Notes
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedNotes.size} note(s)? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAllClose}>
                {" "}
                {/* Cancel button */}
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteSelected}
                ml={3}
                isLoading={isDeleting}
              >
                {" "}
                {/* Confirm delete button */}
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* --- AlertDialog for Single Note Delete Confirmation --- */}
      <AlertDialog
        isOpen={isSingleDeleteOpen} // Controls if dialog is open
        leastDestructiveRef={cancelRef} // Sets initial focus to the cancel button
        onClose={onSingleDeleteClose} // Function to call when dialog is closed
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Note
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onSingleDeleteClose}>
                {" "}
                {/* Cancel button */}
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDeleteSingleNote(noteToDeleteId)}
                ml={3}
                isLoading={isDeleting}
              >
                {" "}
                {/* Confirm delete button, calls handler with the stored note ID */}
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Archivednotes;
