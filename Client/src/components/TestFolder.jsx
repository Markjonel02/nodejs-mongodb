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
import { useState, useEffect, useRef } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import axios from "axios";
import { memo } from "react";
import book from "../assets/img/wmremove-transformed.png";
import { IoTrashBinOutline } from "react-icons/io5";
import { CiFileOff, CiEdit } from "react-icons/ci";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { colors } from "../utils/colors"; // Assuming colors are defined here
import { color } from "framer-motion";

const Folders = ({ shouldRefetchNotes }) => {
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [noteToDelete, setNoteToDelete] = useState(null);

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

  const handleDeleteNote = (noteId) => {
    setNoteToDelete(noteId);
    onDeleteOpen();
  };

  const handleUpdateNote = (note) => {
    // This function is correctly used to prepare the modal with the note's current data
    setNoteToUpdate(note);
    setUpdatedTitle(note.title);
    setUpdatedNotes(note.notes);
    setUpdatedColor(note.color);
    onUpdateOpen(); // Open the update modal
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

      // Ensure we check the HTTP status for success instead of relying on the message
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

  const handleArchiveNote = async (noteId) => {
    console.log("Archiving note with ID:", noteId);
    displayToast(
      "Note Archived",
      "Note has been successfully archived.",
      "info"
    );
    // You might want to implement actual archiving logic here (e.g., API call)
    // and then re-fetch notes. For now, it's just a toast and a re-fetch.
    fetchNotes();
  };

  const handleFavoriteNote = async (noteId) => {
    console.log("Favoriting note with ID:", noteId);
    displayToast(
      "Note Favorited",
      "Note has been added to favorites.",
      "success"
    );
    // You might want to implement actual favoriting logic here (e.g., API call)
    // and then re-fetch notes. For now, it's just a toast and a re-fetch.
    fetchNotes();
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
                      <MenuItem onClick={() => handleArchiveNote(note._id)}>
                        <Icon as={CiFileOff} mr={2} /> Archive
                      </MenuItem>
                      <MenuItem onClick={() => handleFavoriteNote(note._id)}>
                        <Icon as={MdOutlineFavoriteBorder} mr={2} /> Favorite
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
