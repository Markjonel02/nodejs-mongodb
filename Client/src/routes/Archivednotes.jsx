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
  FaTrashAlt,
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa"; // Import FaCheckCircle and FaExclamationCircle

const NoteCard = ({ note, isSelected, onSelect, onDelete, isDeleting }) => {
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

      <Flex position="absolute" top={3} right={3} zIndex={1}>
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
          {note.title}
        </Heading>
      </CardHeader>
      <CardBody pt={2}>
        <Text fontSize="md" color="gray.700" noOfLines={5}>
          {note.notes}
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

const Archivednotes = () => {
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  // Define a unique toast ID for the "fetch error" to prevent duplicates
  const fetchErrorToastId = "fetch-error-toast";

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

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  const fetchArchivedNotes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/getarchivenotes"
      );
      setArchivedNotes(data);
    } catch (err) {
      setError("Failed to load archived notes.");
      // Show fetch error toast only if it's not already active
      if (!toast.isActive(fetchErrorToastId)) {
        toast({
          id: fetchErrorToastId, // Use the unique ID
          title: "Failed to load notes",
          description: "There was an error fetching your archived notes.",
          status: "error",
          position: "top",
          duration: 5000, // Slightly longer duration
          isClosable: true,
          icon: <FaExclamationCircle />, // Add an error icon
          variant: "left-accent", // A more distinct variant
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
        e.target.checked ? new Set(archivedNotes.map((n) => n._id)) : new Set()
      );
    },
    [archivedNotes]
  );

  const handleDeleteSelected = async () => {
    onDeleteAllClose();
    if (!selectedNotes.size) return;
    setIsDeleting(true);
    try {
      await axios.post(
        "http://localhost:5000/api/archivednotes/delete-multiple",
        { ids: Array.from(selectedNotes) }
      );
      toast({
        title: "Notes Deleted",
        description: `${selectedNotes.size} note(s) have been permanently deleted.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
        icon: <FaCheckCircle />, // Add a success icon
        variant: "solid", // A solid background for success
      });
      setSelectedNotes(new Set());
      fetchArchivedNotes();
    } catch {
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the selected notes.",
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        icon: <FaExclamationCircle />,
        variant: "subtle", // A subtle background for error
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleNote = async (id) => {
    onSingleDeleteClose();
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/archivednotes/del-single/${id}`
      );
      toast({
        title: "Note Deleted",
        description: "The note has been permanently deleted.",
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
      fetchArchivedNotes();
    } catch {
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
      setNoteToDeleteId(null);
    }
  };

  const openSingleDeleteDialog = useCallback(
    (id) => {
      setNoteToDeleteId(id);
      onSingleDeleteOpen();
    },
    [onSingleDeleteOpen]
  );

  const renderedNotes = useMemo(
    () =>
      archivedNotes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          isSelected={selectedNotes.has(note._id)}
          onSelect={handleCheckboxChange}
          onDelete={openSingleDeleteDialog}
          isDeleting={isDeleting && noteToDeleteId === note._id}
        />
      )),
    [
      archivedNotes,
      selectedNotes,
      handleCheckboxChange,
      openSingleDeleteDialog,
      isDeleting,
      noteToDeleteId,
    ]
  );

  if (loading)
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading archived notes...</Text>
      </Flex>
    );

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading mb={8} textAlign="center">
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
            isChecked={selectedNotes.size === archivedNotes.length}
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
            variant="transparent"
            color="red.300"
            leftIcon={<FaTrashAlt />}
            onClick={onDeleteAllOpen}
            isDisabled={!selectedNotes.size}
            isLoading={isDeleting}
          >
            Delete ({selectedNotes.size})
          </Button>
        </Flex>
      )}

      {archivedNotes.length > 0 ? (
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
          <Text fontSize="1em" color="gray.600" fontWeight="semibold">
            No archived notes to display.
          </Text>
          {error && (
            <Text fontSize="md" color="red.500">
              Error: {error}
            </Text>
          )}
        </VStack>
      )}

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
              undone.
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
    </Box>
  );
};

export default Archivednotes;
