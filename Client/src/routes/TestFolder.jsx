import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  ButtonGroup,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  Circle,
  Flex,
  Skeleton,
  SkeletonText,
  useBreakpointValue, // Import useBreakpointValue
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import axios from "axios";
import book from "../assets/img/wmremove-transformed.png";
import { IoTrashBinOutline } from "react-icons/io5";
import { CiFileOff, CiEdit } from "react-icons/ci";
import { MdOutlineFavoriteBorder, MdOutlineFavorite } from "react-icons/md";
import { colors } from "../utils/colors";

import { usePagination } from "../customhooks/usePagination";
import { PaginationControls } from "../components/PaginationControls";
import { NoteNavigation } from "../components/NoteNavigation";

const Folders = ({ shouldRefetchNotes }) => {
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentSortBy, setCurrentSortBy] = useState("dateDesc");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  const toast = useToast();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [noteToDelete, setNoteToDelete] = useState(null);

  const {
    isOpen: isArchiveOpen,
    onOpen: onArchiveOpen,
    onClose: onArchiveClose,
  } = useDisclosure();
  const archiveCancelRef = useRef();
  const [noteToArchive, setNoteToArchive] = useState(null);

  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();
  const [noteToUpdate, setNoteToUpdate] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedNotes, setUpdatedNotes] = useState("");
  const [updatedColor, setUpdatedColor] = useState("");

  const displayToast = (title, description, status) => {
    toast({
      title,
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/api/getnotes");
      setNotes(response.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes. Please try again later.");
      displayToast(
        "Error fetching notes.",
        "Could not load notes from the server.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [shouldRefetchNotes]);

  const handleSearchChange = useCallback((term) => {
    setCurrentSearchTerm(term);
  }, []);

  const handleSortChange = useCallback((sortOrder) => {
    setCurrentSortBy(sortOrder);
  }, []);

  const handleDeleteNote = (noteId) => {
    setNoteToDelete(noteId);
    onDeleteOpen();
  };

  const handleArchiveNoteClick = (noteId) => {
    setNoteToArchive(noteId);
    onArchiveOpen();
  };

  const handleUpdateNote = (note) => {
    setNoteToUpdate(note);
    setUpdatedTitle(note.title);
    setUpdatedNotes(note.notes);
    setUpdatedColor(note.color);
    onUpdateOpen();
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    setLoading(true);
    setError(null);
    onDeleteClose();

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/delnotes/${noteToDelete}`
      );

      if (response.status === 200) {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteToDelete)
        );
        displayToast(
          "Note Deleted!",
          response.data.message || "Note has been successfully moved to Trash.",
          "success"
        );
        fetchNotes();
      } else {
        throw new Error(
          response.data.message || "Failed to move note to trash."
        );
      }
    } catch (err) {
      console.error("Error moving note to Trash:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to move note to Trash.";
      setError(errorMessage);
      displayToast("Error", errorMessage, "error");
    } finally {
      setLoading(false);
      setNoteToDelete(null);
    }
  };

  const confirmArchive = async () => {
    if (!noteToArchive) return;

    setLoading(true);
    setError(null);
    onArchiveClose();

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/archivednotes/${noteToArchive}`
      );
      if (response.status === 200) {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteToArchive)
        );
        displayToast(
          "Note Archived!",
          response.data.message ||
            "Note has been successfully moved to Archived.",
          "info"
        );
        fetchNotes();
      } else {
        throw new Error(response.data.message || "Failed to archive the note.");
      }
    } catch (err) {
      console.error("Error archiving note:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to archive note. Please try again later.";
      setError(errorMessage);
      displayToast("Error", errorMessage, "error");
    } finally {
      setLoading(false);
      setNoteToArchive(null);
    }
  };

  const handleToggleFavorite = async (noteId, currentIsFavorite) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/favorites/${noteId}`,
        { isFavorite: !currentIsFavorite }
      );

      if (response.status === 200) {
        displayToast(
          "Note Favorite Status Updated!",
          response.data.message ||
            `Note has been ${
              !currentIsFavorite ? "added to" : "removed from"
            } favorites.`,
          "success"
        );
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId
              ? { ...note, isFavorite: !currentIsFavorite }
              : note
          )
        );
      } else {
        throw new Error(
          response.data.message || "Failed to update favorite status."
        );
      }
    } catch (err) {
      console.error("Error toggling favorite status:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update favorite status. Please try again later.";
      setError(errorMessage);
      displayToast("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmUpdate = async () => {
    if (!noteToUpdate) return;

    setLoading(true);
    setError(null);
    onUpdateClose();

    const hasChanges =
      updatedTitle !== noteToUpdate.title ||
      updatedNotes !== noteToUpdate.notes ||
      updatedColor !== noteToUpdate.color;

    if (!hasChanges) {
      displayToast(
        "No Changes Detected",
        "You didn't modify anything.",
        "warning"
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/updatenotes/${noteToUpdate._id}`,
        {
          title: updatedTitle,
          notes: updatedNotes,
          color: updatedColor,
        }
      );

      if (
        response.status === 200 &&
        response.data.message === "Note updated successfully!"
      ) {
        displayToast(
          "Note Updated",
          "Note has been successfully updated.",
          "success"
        );
        await fetchNotes();
      } else {
        const errorMessage =
          response.data.message || "Failed to update the note.";
        displayToast("Update Failed", errorMessage, "error");
      }
    } catch (err) {
      console.error("Error updating note:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update note. Please try again later.";
      setError(errorMessage);
      displayToast("Update Failed", errorMessage, "error");
    } finally {
      setLoading(false);
      setNoteToUpdate(null);
      setUpdatedTitle("");
      setUpdatedNotes("");
      setUpdatedColor("");
    }
  };

  const filteredAndSortedNotes = useMemo(() => {
    let currentNotes = [...notes];

    if (currentSearchTerm) {
      const lowercasedSearchTerm = currentSearchTerm.toLowerCase();
      currentNotes = currentNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowercasedSearchTerm) ||
          note.notes.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

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
  }, [notes, currentSortBy, currentSearchTerm]);

  // Dynamically set notesPerPage based on breakpoint
  const notesPerPage = useBreakpointValue({
    base: 4, // 4 notes on extra small screens (e.g., phones)
    sm: 4, // 4 notes on small screens (e.g., larger phones in portrait/landscape)
    md: 4, // 8 notes on medium screens (e.g., tablets)
    lg: 8, // 8 notes on large screens (e.g., desktops)
  });

  const { currentPage, currentItems, totalPages, paginate } = usePagination(
    filteredAndSortedNotes,
    notesPerPage // Use the dynamic value here
  );

  const renderNoteContent = () => {
    if (error) {
      return (
        <Text textAlign="center" mt={8} color="red.500">
          {error}
        </Text>
      );
    }

    let searchResultCountMessage = null;
    if (currentSearchTerm && filteredAndSortedNotes.length > 0) {
      const resultCount = filteredAndSortedNotes.length;
      searchResultCountMessage = (
        <Text textAlign="center" mt={4} mb={6} fontSize="md" color="gray.600">
          {resultCount} {resultCount === 1 ? "result" : "results"} found.
        </Text>
      );
    }

    if (filteredAndSortedNotes.length === 0 && !loading) {
      return (
        <>
          {searchResultCountMessage}
          <Text textAlign="center" mt={20} fontWeight={500} fontSize={20}>
            {currentSearchTerm
              ? "No matching notes found."
              : "No notes found. Start by adding a new one!"}
          </Text>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            w="200px"
            h="auto"
            mx="auto"
            mt={50}
          >
            <img
              src={book}
              alt="book"
              style={{ display: "block", margin: "auto" }}
            />
          </Box>
        </>
      );
    }

    if (loading) {
      return (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 2, lg: 4 }} // Columns for skeleton loading
          spacing={4}
          mt={4}
          gap={4}
        >
          {[...Array(notesPerPage)].map(
            (
              _,
              index // Use notesPerPage for skeleton count
            ) => (
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
            )
          )}
        </SimpleGrid>
      );
    }

    return (
      <>
        {searchResultCountMessage}
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 2, lg: 4 }} // Adjust these columns based on desired visual layout
          spacing={4}
          mt={4}
          gap={4}
        >
          {currentItems.map((note, index) => (
            <Box
              key={note._id || index}
              p={6}
              bg={note.color}
              borderRadius="lg"
              position="relative"
              width="100%"
              boxShadow="md"
              textAlign="left"
            >
              <FaNoteSticky color="#53b1ffff" mb="4" size={30} />
              <Text fontWeight="bold" fontSize="lg" mt={5}>
                {note.title.length > 15
                  ? note.title.substring(0, 15) + "..."
                  : note.title}
              </Text>
              <Text fontSize="0.9em" mt={1} mb={4}>
                {note.notes.length > 20
                  ? note.notes.substring(0, 20) + "..."
                  : note.notes}
              </Text>

              <Text
                fontSize="12px"
                position="absolute"
                bottom={3}
                left={6}
                mt={2}
                color="gray.600"
              >
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </Text>

              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  position="absolute"
                  top={3}
                  right={3}
                  aria-label="Note options"
                  variant="ghost"
                  _hover={{ bg: "transparent" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiMoreHorizontal size={20} />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handleUpdateNote(note)}>
                    <Icon as={CiEdit} mr={2} /> Edit
                  </MenuItem>
                  <MenuItem onClick={() => handleDeleteNote(note._id)}>
                    <Icon as={IoTrashBinOutline} mr={2} /> Delete
                  </MenuItem>
                  <MenuItem onClick={() => handleArchiveNoteClick(note._id)}>
                    <Icon as={CiFileOff} mr={2} /> Archive
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleToggleFavorite(note._id, note.isFavorite)
                    }
                  >
                    <Icon
                      as={
                        note.isFavorite
                          ? MdOutlineFavorite
                          : MdOutlineFavoriteBorder
                      }
                      color={note.isFavorite ? "red.500" : "inherit"}
                      mr={2}
                    />{" "}
                    {note.isFavorite ? "Unfavorite" : "Favorite"}
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          ))}
        </SimpleGrid>
      </>
    );
  };

  return (
    <Box p={6} pb="80px">
      {" "}
      {/* Add padding-bottom to main content */}
      <Heading mt={10} mb={4} textAlign="center">
        My Notes
      </Heading>
      <ButtonGroup mb={2} justifyContent="center" width="100%" display="flex">
        {["Todays", "This Week", "This Month"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            fontWeight={activeNoteTab === tab ? "bold" : "normal"}
            borderBottom={activeNoteTab === tab ? "2px solid black" : "none"}
            onClick={() => setActiveNoteTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </ButtonGroup>
      <NoteNavigation onSearch={handleSearchChange} onSort={handleSortChange} />
      {renderNoteContent()}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
      {/* Delete Confirmation AlertDialog (unchanged) */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
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
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                bg={"#DA6C6C"}
                onClick={confirmDelete}
                ml={3}
                color={"white"}
                _hover={{ color: "black", bg: "gray.100" }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      {/* Archive Confirmation AlertDialog (unchanged) */}
      <AlertDialog
        isOpen={isArchiveOpen}
        leastDestructiveRef={archiveCancelRef}
        onClose={onArchiveClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Archive Note
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to archive this note? It will be moved to
              your archived notes.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={archiveCancelRef} onClick={onArchiveClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={confirmArchive} ml={3}>
                Archive
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      {/* Update Note Modal (unchanged) */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Note</ModalHeader>
          <ModalBody>
            <FormControl id="noteTitle" mb={4}>
              <FormLabel>Title</FormLabel>
              <Input
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                placeholder="Note Title"
              />
            </FormControl>
            <FormControl id="noteContent" mb={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={updatedNotes}
                onChange={(e) => setUpdatedNotes(e.target.value)}
                placeholder="Your notes here..."
              />
            </FormControl>

            <FormControl id="noteColor" mb={4}>
              <FormLabel>Color</FormLabel>
              <HStack spacing={2} align="start" flexWrap="wrap">
                {colors.map((color) => (
                  <Circle
                    key={color}
                    size="24px"
                    bg={color}
                    cursor="pointer"
                    border="2px solid transparent"
                    borderColor={
                      updatedColor === color ? "blue.500" : "transparent"
                    }
                    _hover={{
                      borderColor: "blue.300",
                    }}
                    _focus={{
                      outline: "2px solid blue.500",
                      boxShadow: "0 0 5px blue.500",
                    }}
                    _active={{
                      borderColor: "blue.700",
                    }}
                    onClick={() => setUpdatedColor(color)}
                  />
                ))}
              </HStack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onUpdateClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" ml={3} onClick={confirmUpdate}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default memo(Folders);
