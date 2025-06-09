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
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState, useEffect, useRef, memo } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import axios from "axios";
import book from "../assets/img/wmremove-transformed.png";
import { IoTrashBinOutline } from "react-icons/io5";
import { CiFileOff, CiEdit } from "react-icons/ci";
import { MdOutlineFavoriteBorder, MdOutlineFavorite } from "react-icons/md"; // Import filled favorite icon
import { colors } from "../utils/colors"; // Assuming colors are defined here

const Folders = ({ shouldRefetchNotes }) => {
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // State and disclosure for Delete AlertDialog
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [noteToDelete, setNoteToDelete] = useState(null);

  // State and disclosure for Archive AlertDialog
  const {
    isOpen: isArchiveOpen,
    onOpen: onArchiveOpen,
    onClose: onArchiveClose,
  } = useDisclosure();
  const archiveCancelRef = useRef(); // Separate ref for archive dialog
  const [noteToArchive, setNoteToArchive] = useState(null);

  // State and disclosure for Update Modal
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

  // Handler for opening the delete confirmation dialog
  const handleDeleteNote = (noteId) => {
    setNoteToDelete(noteId);
    onDeleteOpen();
  };

  // Handler for opening the archive confirmation dialog
  const handleArchiveNoteClick = (noteId) => {
    setNoteToArchive(noteId);
    onArchiveOpen();
  };

  // Handler for opening the update modal
  const handleUpdateNote = (note) => {
    setNoteToUpdate(note);
    setUpdatedTitle(note.title);
    setUpdatedNotes(note.notes);
    setUpdatedColor(note.color);
    onUpdateOpen();
  };

  // Confirmation logic for deleting a note
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
        fetchNotes(); // Ensure UI is perfectly in sync
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

  // Confirmation logic for archiving a note
  const confirmArchive = async () => {
    if (!noteToArchive) return;

    setLoading(true);
    setError(null);
    onArchiveClose();

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/archivednotes/${noteToArchive}` // Make sure this route exists and handles archiving
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
        fetchNotes(); // Re-fetch notes to update the UI (e.g., remove archived note)
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
      setNoteToArchive(null); // Clear the note after attempt
    }
  };

  const handleToggleFavorite = async (noteId, currentIsFavorite) => {
    setLoading(true);
    setError(null);

    try {
      // Send the new favorite status to the backend
      const response = await axios.put(
        `http://localhost:5000/api/favorites/${noteId}`,
        { isFavorite: !currentIsFavorite } // Toggle the status
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
        // Optimistically update the UI without re-fetching all notes
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
    onUpdateClose(); // Close the update modal

    // Check if any modifications were made
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
        await fetchNotes(); // Re-fetch the latest data from the server
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

  const renderNoteContent = () => {
    if (loading) {
      return (
        <Text textAlign="center" mt={8}>
          Loading notes...
        </Text>
      );
    }

    if (error) {
      return (
        <Text textAlign="center" mt={8} color="red.500">
          {error}
        </Text>
      );
    }

    if (notes.length === 0) {
      return (
        <>
          <Text textAlign="center" mt={20} fontWeight={500} fontSize={20}>
            No notes found. Start by adding a new one!
          </Text>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            w="200px"
            h="auto"
            mx="auto" // Centers the Box itself
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

    return (
      <Box position="relative" width="100%" mb={8}>
        <Box
          width={{ base: "100%" }}
          pr={{ base: 0, md: 4 }}
          mb={6}
          display="flex"
          flexDirection={{ base: "column", md: "column", lg: "row" }}
          alignItems={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <Box flex="1" width="100%">
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 2, lg: 4 }}
              spacing={4}
              mt={4}
              gap={4}
            >
              {notes.map((note, index) => (
                <Box
                  key={note._id || index}
                  p={6}
                  bg={note.color} // Use the note's color here
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
                  <Text fontSize="12px" mt={1}>
                    {note.notes.length > 100
                      ? note.notes.substring(0, 100) + "..."
                      : note.notes}
                  </Text>
                  <Text fontSize="12px" mt={1}>
                    {new Date(note.createdAt).toLocaleDateString()}
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
                      <MenuItem
                        onClick={() => handleArchiveNoteClick(note._id)}
                      >
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
                          } // Conditional icon
                          color={note.isFavorite ? "red.500" : "inherit"} // Conditional color
                          mr={2}
                        />{" "}
                        {note.isFavorite ? "Unfavorite" : "Favorite"}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Heading mt={10} mb={4} textAlign="center">
        My Notes
      </Heading>

      <ButtonGroup mb={4} justifyContent="center" width="100%" display="flex">
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

      {renderNoteContent()}

      {/* Delete Confirmation AlertDialog */}
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

      {/* Archive Confirmation AlertDialog */}
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
              <Button
                colorScheme="blue" // You can choose your desired color scheme
                onClick={confirmArchive}
                ml={3}
              >
                Archive
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Update Note Modal */}
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

            {/* Color selection using Circles */}
            <FormControl id="noteColor" mb={4}>
              <FormLabel>Color</FormLabel>
              <HStack spacing={2} align="start" flexWrap="wrap">
                {colors.map((color) => (
                  <Circle
                    key={color}
                    size="24px"
                    bg={color} // Use the actual color value
                    cursor="pointer"
                    border="2px solid transparent"
                    borderColor={
                      updatedColor === color ? "blue.500" : "transparent"
                    }
                    _hover={{
                      borderColor: "blue.300", // Light hover border
                    }}
                    _focus={{
                      outline: "2px solid blue.500",
                      boxShadow: "0 0 5px blue.500",
                    }}
                    _active={{
                      borderColor: "blue.700", // Darker border on active click
                    }}
                    onClick={() => setUpdatedColor(color)} // Set the updatedColor state
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
