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

// Import pagination and navigation components/hooks
import { usePagination } from "../customhooks/usePagination";
import { PaginationControls } from "../components/PaginationControls";
import { NoteNavigation } from "../components/NoteNavigation";
import { api } from "../utils/api/api";
// Import the book image
import book from "../assets/img/wmremove-transformed.png"; // Make sure this path is correct

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
            Archived: {new Date(note.ArchivedAt).toLocaleDateString("en-US")}
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

// --- Archivednotes Component ---
const Archivednotes = () => {
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState(null);
  const [noteToRestoreId, setNoteToRestoreId] = useState(null);

  // State for sorting and searching
  const [currentSortBy, setCurrentSortBy] = useState("dateDesc"); // Default sort
  const [currentSearchTerm, setCurrentSearchTerm] = useState(""); // Default empty search

  const toast = useToast();
  const cancelRef = useRef();

  const fetchErrorToastId = "fetch-error-toast"; // To prevent duplicate toasts for fetch errors

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

  // --- Effects ---
  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  // --- Data Fetching ---
  const fetchArchivedNotes = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem("jwtToken");
      const { data } = await api.get(`/api/notes/getarchivenotes`, {
        headers: {
          Authorization: `Bearer ${token}`, //  Send token
        },
      });
      setArchivedNotes(data);
    } catch (err) {
      console.error("Error fetching archived notes:", err);
      setError("Failed to load archived notes.");
      if (!toast.isActive(fetchErrorToastId)) {
        toast({
          id: fetchErrorToastId,
          title: "Failed to load notes",
          description: "There was an error fetching your archived notes.",
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

  // --- Search and Sort Logic (Memoized) ---
  const filteredAndSortedNotes = useMemo(() => {
    let currentNotes = [...archivedNotes];

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
        (a, b) => new Date(b.ArchivedAt) - new Date(a.ArchivedAt)
      );
    } else if (currentSortBy === "dateAsc") {
      currentNotes.sort(
        (a, b) => new Date(a.ArchivedAt) - new Date(b.ArchivedAt)
      );
    }
    return currentNotes;
  }, [archivedNotes, currentSortBy, currentSearchTerm]);

  // --- Dynamic notesPerPage for Pagination ---
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
      setSelectedNotes(
        e.target.checked ? new Set(currentItems.map((n) => n._id)) : new Set()
      );
    },
    [currentItems] // Important: Select only notes on the current page
  );

  const handleDeleteSelected = async () => {
    onDeleteAllClose(); // Close the dialog immediately
    if (!selectedNotes.size) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await api.post(
        `/api/notes/archivednotes/delete-multiple`,
        { ids: Array.from(selectedNotes) },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Correct placement in config
          },
        }
      );

      toast({
        title: "Notes Deleted",
        description: `${selectedNotes.size} note(s) have been permanently deleted.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });
      setSelectedNotes(new Set()); // Clear selection after deletion
      fetchArchivedNotes(); // Refresh the list of notes
    } catch (err) {
      console.error("Error deleting selected notes:", err);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the selected notes.",
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
    onSingleDeleteClose(); // Close the dialog immediately
    setIsDeleting(true);
    try {
      await api.delete(`/api/archivednotes/del-single/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      toast({
        title: "Note Deleted",
        description: "The note has been moved to trash.",
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
      fetchArchivedNotes(); // Refresh the list of notes
    } catch (err) {
      console.error("Error deleting single note:", err);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting this note.",
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle",
      });
    } finally {
      setIsDeleting(false);
      setNoteToDeleteId(null); // Clear ID after operation
    }
  };

  // --- Restore Handlers ---
  const handleRestoreSelected = async () => {
    onRestoreAllClose(); // Close the dialog immediately
    if (!selectedNotes.size) return;

    setIsRestoring(true);
    try {
      const response = await api.put(
        `/api/arcnotes/restore-multiple`,
        { ids: Array.from(selectedNotes) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      toast({
        title: "Notes Restored",
        description:
          response.data.message ||
          `${selectedNotes.size} note(s) have been restored.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />,
        variant: "solid",
      });
      setSelectedNotes(new Set()); // Clear selection after restoration
      fetchArchivedNotes(); // Refresh the list of notes
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
      const response = await api.put(
        `/api/arcnotes/restore/${id}`,
        {}, // No body payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Note Restored",
        description:
          response.data.message || "The note has been successfully restored.",
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

      fetchArchivedNotes(); // Refresh notes
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
  if (loading)
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="purple.500" />
        <Text ml={4} color="gray.600">
          Loading archived notes...
        </Text>
      </Flex>
    );

  // --- Main Component Render ---
  return (
    <Box p={8} bg="gray.50" minH="100vh" pb="80px">
      <Heading mb={8} textAlign="center">
        Your Archived Notes
      </Heading>

      <NoteNavigation onSearch={handleSearchChange} onSort={handleSortChange} />

      {filteredAndSortedNotes.length > 0 && (
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
            Select All (Page)
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
              Delete ({selectedNotes.size})
            </Button>
          </Flex>
        </Flex>
      )}

      {currentItems.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6}>
          {renderedNotes}
        </SimpleGrid>
      ) : (
        <VStack spacing={4} p={10} bg="transparent" textAlign="center" mt={8}>
          <Text fontSize="1.1em" color="gray.600" fontWeight="semibold">
            {currentSearchTerm || filteredAndSortedNotes.length === 0
              ? "No matching archived notes found."
              : "No archived notes to display."}
          </Text>
          {/* Add the book image here */}
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
        </VStack>
      )}

      {/* Pagination Controls */}
      {filteredAndSortedNotes.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* --- AlertDialogs for Confirmations (Unchanged) --- */}
      {/* ... (AlertDialogs are unchanged and remain here) ... */}
      <AlertDialog
        isOpen={isDeleteAllOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAllClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Selected Notes</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedNotes.size} note(s)? This
              action cannot be undone.
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
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* AlertDialog for Single Note Deletion */}
      <AlertDialog
        isOpen={isSingleDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onSingleDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Note</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this note? This action cannot be
              unDone.
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
                Delete
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
              Are you sure you want to restore {selectedNotes.size} note(s) to
              your main notes?
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
              Are you sure you want to restore this note to your main notes?
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

export default Archivednotes;
