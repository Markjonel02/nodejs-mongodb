import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast, // Import useToast for notifications
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState, useEffect } from "react"; // Import useEffect
import { FaFileCirclePlus } from "react-icons/fa6";
import { IoFolderSharp } from "react-icons/io5";
import { FaNoteSticky } from "react-icons/fa6";
import { HiPencilSquare } from "react-icons/hi2";

const API_BASE_URL = "http://localhost:5000/api"; // Your backend API base URL

const Folder = () => {
  const [activeFolderTab, setActiveFolderTab] = useState("Todays");
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");

  // State to store folders and notes fetched from the backend
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);

  // Disclosure hooks for modals
  const {
    isOpen: isFolderModalOpen,
    onOpen: onFolderModalOpen,
    onClose: onFolderModalClose,
  } = useDisclosure();
  const {
    isOpen: isNoteModalOpen,
    onOpen: onNoteModalOpen,
    onClose: onNoteModalClose,
  } = useDisclosure();

  // State for new folder input
  const [newFolderTitle, setNewFolderTitle] = useState("");

  // State for new note inputs
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const toast = useToast(); // Initialize toast

  // --- Functions to fetch data from backend ---
  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/folders`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders.",
        description: "Could not load folders from the server.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error fetching notes.",
        description: "Could not load notes from the server.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFolders();
    fetchNotes();
  }, []);

  // --- Handlers for adding new data ---
  const handleAddFolder = async () => {
    if (!newFolderTitle.trim()) {
      toast({
        title: "Input required.",
        description: "Folder title cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newFolderTitle }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newFolder = await response.json();
      setFolders((prevFolders) => [newFolder, ...prevFolders].slice(0, 4)); // Add new folder and keep only 4 recent
      setNewFolderTitle(""); // Clear the input
      onFolderModalClose();
      toast({
        title: "Folder created.",
        description: "Your new folder has been added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding folder:", error);
      toast({
        title: "Error creating folder.",
        description: "There was an issue adding your folder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Inputs required.",
        description: "Note title and content cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: newNoteContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newNote = await response.json();
      setNotes((prevNotes) => [newNote, ...prevNotes].slice(0, 4)); // Add new note and keep only 4 recent
      setNewNoteTitle(""); // Clear the input
      setNewNoteContent(""); // Clear the input
      onNoteModalClose();
      toast({
        title: "Note created.",
        description: "Your new note has been added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error creating note.",
        description: "There was an issue adding your note.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderFolderContent = () => {
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
          {/* Recent Folders */}
          <Box flex="1" width="100%">
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              mt={4}
              gap={4}
            >
              {folders.map((folder, index) => (
                <Box
                  key={folder._id || index} // Use _id from MongoDB if available
                  p={6}
                  bg={folder.color}
                  borderRadius="lg"
                  position="relative"
                  width="100%"
                  boxShadow="md"
                  textAlign="left"
                >
                  <IoFolderSharp color="#53b1ffff" mb="4" size={30} />

                  <Text fontWeight="bold" fontSize="lg" mt={5}>
                    {folder.title}
                  </Text>
                  <Text fontSize="12px" mt={1}>
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </Text>
                  <Button
                    size="sm"
                    position="absolute"
                    top={3}
                    right={3}
                    aria-label="More"
                    variant="ghost"
                    _hover={{ bg: "transparent" }}
                  >
                    <FiMoreHorizontal size={20} />
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Add New Folder Button */}
          <Box
            border="2px dashed gray"
            borderRadius="lg"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            w={{ base: "100%", md: "120px", lg: "120px" }}
            h={{ base: "auto", md: "100%" }}
            minH={{ base: "100px", md: "auto" }}
            p={4}
            _hover={{ borderColor: "blue.300", cursor: "pointer" }}
            flexShrink={0}
            onClick={onFolderModalOpen}
          >
            <FaFileCirclePlus size={32} color="gray" />
            <Text color="gray.400" mt={3} fontSize="sm" textAlign={"center"}>
              Add New Folder
            </Text>
          </Box>
        </Box>

        {/* Add New Folder Modal */}
        <Modal isOpen={isFolderModalOpen} onClose={onFolderModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Folder</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Folder Title</FormLabel>
                <Input
                  placeholder="Enter folder title"
                  value={newFolderTitle}
                  onChange={(e) => setNewFolderTitle(e.target.value)}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={onFolderModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" ml={3} onClick={handleAddFolder}>
                Create Folder
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  };

  const renderNoteContent = () => {
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
          {/* Recent Notes */}
          <Box flex="1" width="100%">
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              mt={4}
              gap={4}
            >
              {notes.map((note, index) => (
                <Box
                  key={note._id || index} // Use _id from MongoDB if available
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
                    {note.title}
                  </Text>
                  <Text fontSize="12px" mt={1} noOfLines={2}>
                    {" "}
                    {/* Added noOfLines */}
                    {note.content}
                  </Text>
                  <Text fontSize="12px" mt={1}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                  <Button
                    size="sm"
                    position="absolute"
                    top={3}
                    right={3}
                    aria-label="More"
                    variant="ghost"
                    _hover={{ bg: "transparent" }}
                  >
                    <FiMoreHorizontal size={20} />
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Add New Note Button */}
          <Box
            border="2px dashed gray"
            borderRadius="lg"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            w={{ base: "100%", md: "120px", lg: "120px" }}
            h={{ base: "auto", md: "100%" }}
            minH={{ base: "100px", md: "auto" }}
            p={4}
            _hover={{ borderColor: "blue.300", cursor: "pointer" }}
            flexShrink={0}
            onClick={onNoteModalOpen}
          >
            <HiPencilSquare size={32} color="gray" />
            <Text color="gray.400" mt={3} fontSize="sm" textAlign={"center"}>
              Add New Note
            </Text>
          </Box>
        </Box>

        {/* Add New Note Modal */}
        <Modal isOpen={isNoteModalOpen} onClose={onNoteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Note</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>Note Title</FormLabel>
                <Input
                  placeholder="Enter note title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Note Content</FormLabel>
                <Input
                  placeholder="Enter note content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={onNoteModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" ml={3} onClick={handleAddNote}>
                Create Note
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Heading mb={4} textAlign="center">
        Recent Folders
      </Heading>
      <ButtonGroup mb={4} justifyContent="center" width="100%" display="flex">
        {["Todays", "This Week", "This Month"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            fontWeight={activeFolderTab === tab ? "bold" : "normal"}
            borderBottom={activeFolderTab === tab ? "2px solid black" : "none"}
            onClick={() => setActiveFolderTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </ButtonGroup>
      {renderFolderContent()}

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
    </Box>
  );
};

export default Folder;
