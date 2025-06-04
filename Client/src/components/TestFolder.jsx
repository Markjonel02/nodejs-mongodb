import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  ButtonGroup,
  // Removed Modal imports as they are commented out in your original code
  // and likely handled by the Sidebar's 'Add new' section
  // FormControl,
  // FormLabel,
  // Input,
  // useDisclosure, // Removed if not used for modals within this component
  useToast, // Import useToast for feedback messages, useful for fetch errors
} from "@chakra-ui/react";

import { FiMoreHorizontal } from "react-icons/fi";
import { useState, useEffect } from "react"; // Import useEffect
import { FaNoteSticky } from "react-icons/fa6";
/* import { HiPencilSquare } from "react-icons/hi2"; // Not used currently */

const Folders = () => {
  const [activeNoteTab, setActiveNoteTab] = useState("Todays");
  const [notes, setNotes] = useState([]); // State to store fetched notes
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const toast = useToast(); // Initialize Chakra UI toast

  // Assuming you might receive a trigger from the Sidebar to re-fetch notes.
  // For now, we'll just use a simple state to trigger a re-fetch.
  // In a real app, this might be handled via context API, Redux, or a callback.
  const [shouldRefetchNotes, setShouldRefetchNotes] = useState(false);

  // Function to fetch notes from the backend
  const fetchNotes = async () => {
    setLoading(true); // Indicate loading state
    setError(null); // Clear previous errors

    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "GET", // Explicitly set GET method
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setNotes(data); // Update state with fetched notes
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
      setLoading(false); // Reset loading state
    }
  };

  // useEffect to fetch notes when the component mounts or when shouldRefetchNotes changes
  useEffect(() => {
    fetchNotes();
  }, [shouldRefetchNotes]); // Re-fetch notes if shouldRefetchNotes changes

  // Dummy function to simulate triggering a re-fetch after a new note is added
  // In a real application, the Sidebar's handleSaveNote would call a prop function
  // from this component, or update a global state that this component listens to.
  const handleNoteAddedSuccessfully = () => {
    setShouldRefetchNotes((prev) => !prev); // Toggle to trigger useEffect
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
                  key={note._id || index} // Use note._id if available from backend, otherwise index
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
                    {note.notes}{" "}
                    {/* Ensure this matches your backend field (notes, not content) */}
                  </Text>
                  <Text fontSize="12px" mt={1}>
                    {new Date(note.createdAt).toLocaleDateString()}{" "}
                    {/* Format date */}
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
