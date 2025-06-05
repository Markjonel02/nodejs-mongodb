import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState, useEffect } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import axios from "axios";

// Accept shouldRefetchNotes as a prop
const Folders = ({ shouldRefetchNotes }) => {
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/api/getnotes");
      setNotes(response.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes. Please try again later.");

      toast({
        title: "Error fetching notes.",
        description: "Could not load notes from the server.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Now, useEffect depends on the shouldRefetchNotes prop
  useEffect(() => {
    fetchNotes();
  }, [shouldRefetchNotes]); // This will trigger fetchNotes whenever shouldRefetchNotes changes

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
        <Text textAlign="center" mt={8}>
          No notes found. Start by adding a new one!
        </Text>
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
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              mt={4}
              gap={4}
            >
              {notes.map((note, index) => (
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
                    {note.title}
                  </Text>
                  <Text fontSize="12px" mt={1}>
                    {note.notes}
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
    </Box>
  );
};

export default Folders;
