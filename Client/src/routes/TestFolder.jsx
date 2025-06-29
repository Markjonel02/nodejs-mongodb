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
  // Flex, // Removed Flex as it was only used for the logout button
  Skeleton,
  SkeletonText,
  useBreakpointValue,
} from "@chakra-ui/react";
import { api } from "../utils/api/api";
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
import { applyTimestamps } from "../../../Server/src/models/Trash";

// Assume that 'shouldRefetchNotes' is a prop that a parent component can set to true
// to force a refetch (e.g., after creating a new note).
const Folders = ({ shouldRefetchNotes }) => {
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // NEW STATE: To track login status

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

  // Removed: Logout Confirmation Modal disclosure and ref

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
      const token = localStorage.getItem("jwtToken"); // Make sure 'jwtToken' is the key you used

      if (!token) {
        setError("Not logged in. Please log in to view notes.");
        displayToast(
          "Authentication Required",
          "Please log in to view your notes.",
          "warning"
        );
        setNotes([]); // Clear any old notes if not logged in
        setLoading(false);
        setIsUserLoggedIn(false); // Update login status state
        return;
      }

      // If token exists, proceed with fetch
      setIsUserLoggedIn(true); // User is logged in, set state to true
      const response = await api.get(`/api/notes/getnotes`, {
        headers: {
          Authorization: `Bearer ${token}`, // THIS IS THE CRUCIAL PART
        },
      });
      setNotes(response.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        // If unauthorized or forbidden, it means the token is invalid/expired
        setError("Session expired or unauthorized. Please log in again.");
        displayToast(
          "Unauthorized",
          "Your session has expired or you are not authorized. Please log in.",
          "error"
        );
        // Clear the invalid token and user data, force re-login
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        setNotes([]); // Clear notes if logout/invalid token
        setIsUserLoggedIn(false); // Update login status state
        // Optionally, redirect to login page (requires react-router-dom or similar)
        // navigate('/login');
      } else {
        setError("Failed to load notes. Please try again later.");
        displayToast(
          "Error fetching notes.",
          "Could not load notes from the server.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW useEffect: To monitor localStorage for login/logout changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("jwtToken");
      // Set the local state based on the presence of the token
      setIsUserLoggedIn(!!token);
    };

    // Run once on component mount to set initial status
    checkLoginStatus();

    // Listen for storage events (e.g., if another tab logs in/out)
    window.addEventListener("storage", checkLoginStatus);

    // Cleanup function for the event listener
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []); // Empty dependency array means this runs only once on mount

  // MODIFIED useEffect: Now fetchNotes runs when `isUserLoggedIn` changes (after a login/logout)
  // or when `shouldRefetchNotes` changes (from parent component after CRUD operations).
  useEffect(() => {
    if (isUserLoggedIn) {
      // Only attempt to fetch notes if the user is considered logged in
      fetchNotes();
    } else {
      // If user is not logged in, clear notes and ensure loading state is off
      setNotes([]);
      setLoading(false);
      setError("Not logged in. Please log in to view notes."); // Set error explicitly here too
    }
  }, [isUserLoggedIn, shouldRefetchNotes]); // Depend on `isUserLoggedIn` state

  // All other handlers (confirmDelete, confirmArchive, handleToggleFavorite, confirmUpdate)
  // should also retrieve the token from localStorage before making API calls.
  // I will add token checks to those below for completeness if they are also protected.

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
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setLoading(false);
        return;
      }

      const response = await api.delete(`/api/notes/delnotes/${noteToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteToDelete)
        );
        displayToast(
          "Note Deleted!",
          response.data.message || "Note has been successfully moved to Trash.",
          "success"
        );
        // fetchNotes(); // Can optimize: no need to refetch all if we just filter locally
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
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setLoading(false);
        return;
      }

      const response = await api.delete(
        `/api/notes/archivednotes/${noteToArchive}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        // fetchNotes(); // Can optimize: no need to refetch all if we just filter locally
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
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setLoading(false);
        return;
      }

      const response = await api.put(
        `/api/notes/favorites/${noteId}`,
        { isFavorite: !currentIsFavorite },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        displayToast("Error", "Not authorized. Please log in.", "error");
        setLoading(false);
        return;
      }

      const response = await api.put(
        `/api/notes/updatenotes/${noteToUpdate._id}`,
        {
          title: updatedTitle,
          notes: updatedNotes,
          color: updatedColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        await fetchNotes(); // Re-fetch all notes to ensure data consistency
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

  // Removed: handleLogout and confirmLogout functions

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
    // Check if not logged in and not loading, then show the login message
    if (!isUserLoggedIn && !loading) {
      return (
        <Text textAlign="center" mt={8} color="red.500">
          Not logged in. Please log in to view notes.
        </Text>
      );
    }

    // Existing error handling for other errors (e.g., network issues)
    if (error && isUserLoggedIn) {
      // Only show other errors if logged in
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

    if (filteredAndSortedNotes.length === 0 && !loading && isUserLoggedIn) {
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
      {/* Removed: Logout Button */}
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
      {/* Removed: Logout Confirmation AlertDialog */}
    </Box>
  );
};

export default memo(Folders);
