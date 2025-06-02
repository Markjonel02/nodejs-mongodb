import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  IconButton,
  useBreakpointValue,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState } from "react";
import { TbPencilPlus } from "react-icons/tb";
import { FaNoteSticky } from "react-icons/fa6";
import { FaFileCirclePlus } from "react-icons/fa6";
import { IoFolderSharp } from "react-icons/io5";
import { HiPencilSquare } from "react-icons/hi2";

const folders = [
  { title: "Movie Review", date: "12/12/2021", color: "blue.100" },
  { title: "Class Notes", date: "12/12/2021", color: "pink.100" },
  { title: "Book Lists", date: "12/12/2021", color: "yellow.100" },
  { title: "Book Lists", date: "12/12/2021", color: "yellow.100" },
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
    title: "Mid test exam",
    date: "12/12/2021",
    time: "10:30 PM, Monday",
    content:
      "Ultrices viverra odio congue lecos felis, libero egestas nunc sagi are masa, elit ornare eget sem veib in ulum.",
    color: "pink.200",
  },
  {
    title: "Jonas's notes",
    date: "12/12/2021",
    time: "04:20 PM, Sunday",
    content:
      "Rokity viverra odio congue lecos felis, libero egestas nunc sagi are masa, elit ornare eget sem veib in ulum.",
    color: "blue.200",
  },
  {
    title: "Jonas's notes",
    date: "12/12/2021",
    time: "04:20 PM, Sunday",
    content:
      "Rokity viverra odio congue lecos felis, libero egestas nunc sagi are masa, elit ornare eget sem veib in ulum.",
    color: "blue.200",
  },
];

const Folders = () => {
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3 });
  const [activeFolderTab, setActiveFolderTab] = useState("Todays");
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");

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
          <Box flex="1">
            {/* ... (previous code) ... */}
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              mt={4}
              gap={4}
            >
              {/* Make sure this line slices to 4 */}
              {folders.slice(0, 4).map((folder, index) => (
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
              ))}
            </SimpleGrid>
            {/* ... (rest of your code) ... */}
          </Box>

          {/* Add New Folder Button */}
          <Box
            border="2px dashed gray"
            borderRadius="lg"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            w={{ base: "100%", md: "120px" }}
            h={{ base: "auto", md: "100%" }}
            minH={{ base: "100px", md: "auto" }}
            p={4}
            _hover={{ borderColor: "blue.300", cursor: "pointer" }}
            flexShrink={0}
          >
            <FaFileCirclePlus size={32} color="gray" />

            <Text color="gray.400" mt={3} fontSize="sm">
              Add New Folder
            </Text>
          </Box>
        </Box>
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
          {/* Recent Folders */}
          <Box flex="1">
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              mt={4}
              gap={4}
            >
              {notes.slice(0, 3).map((note, index) => (
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
                    {" "}
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
            w={{ base: "100%", md: "120px" }}
            h={{ base: "auto", md: "100%" }}
            minH={{ base: "100px", md: "auto" }}
            p={4}
            _hover={{ borderColor: "blue.300", cursor: "pointer" }}
            flexShrink={0}
          >
            <HiPencilSquare size={32} color="gray" />

            <Text color="gray.400" mt={3} fontSize="sm">
              Add New Note
            </Text>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Heading mb={4} textAlign="center">
        Recent Folders
      </Heading>

      <ButtonGroup mb={4}>
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

      <Heading mt={10} mb={4}>
        My Notes
      </Heading>

      <ButtonGroup mb={4}>
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
