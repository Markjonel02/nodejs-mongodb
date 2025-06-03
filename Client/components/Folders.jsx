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
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState } from "react";
import { FaFileCirclePlus } from "react-icons/fa6";
import { IoFolderSharp } from "react-icons/io5";
import { FaNoteSticky } from "react-icons/fa6";
import { HiPencilSquare } from "react-icons/hi2";

const folders = [
  { title: "Movie Review", date: "12/12/2021", color: "blue.100" },
  { title: "Class Notes", date: "12/12/2021", color: "pink.100" },
  { title: "Book Lists", date: "12/12/2021", color: "yellow.100" },
  { title: "Recipe Ideas", date: "01/01/2022", color: "purple.100" },
  { title: "Recipe Ideas", date: "01/01/2022", color: "purple.100" },
];

const notes = [
  {
    title: "Mid test exam",
    date: "12/12/2021",
    time: "10:30 PM, Monday",
    content:
      "Ultrices viverra odio congue lecos felis, libero egestas nunc sagi are masa, elit ornare eget sem veib in ulum.",
    color: "yellow.200",
  },
  {
    title: "Project Brainstorm",
    date: "12/15/2021",
    time: "02:00 PM, Tuesday",
    content:
      "Ideas for new feature development. Focus on user authentication and data privacy.",
    color: "pink.200",
  },
  {
    title: "Meeting Summary",
    date: "12/10/2021",
    time: "09:00 AM, Friday",
    content:
      "Discussed Q4 targets, budget allocations, and team performance metrics.",
    color: "blue.200",
  },
  {
    title: "Grocery List",
    date: "01/05/2022",
    time: "05:00 PM, Wednesday",
    content: "Milk, eggs, bread, vegetables, fruits, and snacks for the week.",
    color: "green.100",
  },
];

const Folders = () => {
  const [activeFolderTab, setActiveFolderTab] = useState("Todays");
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");

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

  const handleAddFolder = () => {
    // In a real application, you'd add logic here to save the new folder
    // For now, we'll just log it and close the modal
    console.log("New Folder Title:", newFolderTitle);
    setNewFolderTitle(""); // Clear the input
    onFolderModalClose();
  };

  const handleAddNote = () => {
    // In a real application, you'd add logic here to save the new note
    // For now, we'll just log it and close the modal
    console.log("New Note Title:", newNoteTitle);
    console.log("New Note Content:", newNoteContent);
    setNewNoteTitle(""); // Clear the input
    setNewNoteContent(""); // Clear the input
    onNoteModalClose();
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
            {" "}
            {/* Added width="100%" here */}
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }} // Ensures 4 columns on large screens
              spacing={4}
              mt={4}
              gap={4}
            >
              {folders.slice(0, 4).map(
                (
                  folder,
                  index // Slices to 4 items
                ) => (
                  <Box
                    key={index}
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
                      {folder.date}
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
                )
              )}
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
            w={{ base: "100%", md: "120px", lg: "120px" }} // Adjusted width for responsiveness
            h={{ base: "auto", md: "100%" }}
            minH={{ base: "100px", md: "auto" }}
            p={4}
            _hover={{ borderColor: "blue.300", cursor: "pointer" }}
            flexShrink={0}
            onClick={onFolderModalOpen} // Open modal on click
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
            {" "}
            {/* Added width="100%" here */}
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }} // Ensures 4 columns on large screens
              spacing={4}
              mt={4}
              gap={4}
            >
              {notes.slice(0, 4).map(
                (
                  note,
                  index // Slices to 4 items
                ) => (
                  <Box
                    key={index}
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
                    <Text fontSize="12px" mt={1}>
                      {note.content}
                    </Text>
                    <Text fontSize="12px" mt={1}>
                      {note.date}
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
                )
              )}
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
            w={{ base: "100%", md: "120px", lg: "120px" }} // Adjusted width for responsiveness
            h={{ base: "auto", md: "100%" }}
            minH={{ base: "100px", md: "auto" }}
            p={4}
            _hover={{ borderColor: "blue.300", cursor: "pointer" }}
            flexShrink={0}
            onClick={onNoteModalOpen} // Open modal on click
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
      {/* Centered Heading */}
      <Heading mb={4} textAlign="center">
        Recent Folders
      </Heading>

      {/* Centered ButtonGroup */}
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

      {/* Centered Heading */}
      <Heading mt={10} mb={4} textAlign="center">
        My Notes
      </Heading>

      {/* Centered ButtonGroup */}
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

export default Folders;
