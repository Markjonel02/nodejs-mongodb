import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Button,
  Circle,
  useMediaQuery,
  Menu,
  MenuButton,
  Input, // Import Input for text fields
  useToast, // Import useToast for feedback messages
} from "@chakra-ui/react";

import { CiCalendar, CiFileOn, CiTrash } from "react-icons/ci";
import {
  MdAssignmentAdd,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
} from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons"; // Only HamburgerIcon is used from chakra icons
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false); // Controls visibility of 'Add new' expanded section

  // State for new note form inputs
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState(""); // Changed from newNoteNotes to newNoteContent
  const [selectedColor, setSelectedColor] = useState("gray.200"); // Default color for new notes

  const [isSmallScreen] = useMediaQuery("(max-width: 48em)"); // Detects small screens
  const [isOverlayOpen, setIsOverlayOpen] = useState(false); // Controls overlay visibility on small screens
  const toast = useToast(); // Initialize Chakra UI toast for user feedback

  // Determines the actual collapsed state based on screen size and overlay status
  const actualCollapsedState = isSmallScreen ? !isOverlayOpen : collapsed;

  // Function to handle saving a new note to the backend
  const handleSaveNote = async () => {
    // Basic client-side validation
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Input missing.",
        description: "Please enter both a title and content for your note.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      // Make a POST request to your backend API
      const response = await fetch("http://localhost:5000/api/notes", {
        // IMPORTANT: Ensure this URL matches your backend server
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Convert JavaScript object to JSON string
          title: newNoteTitle,
          notes: newNoteContent, // Ensure this matches your backend model
          color: selectedColor,
        }),
      });

      // Check if the request was successful (status code 2xx)
      if (!response.ok) {
        const errorData = await response.json(); // Parse error response from backend
        throw new Error(errorData.message || "Failed to save note");
      }

      const savedNote = await response.json(); // Parse the successful response
      console.log("Note saved successfully:", savedNote);

      // Show success toast
      toast({
        title: "Note created.",
        description: "Your note has been successfully saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Reset form fields and UI state after successful save
      setNewNoteTitle("");
      setNewNoteContent("");
      setSelectedColor("gray.200"); // Reset to default color
      setHidden(false); // Collapse the 'Add new' section
      if (isSmallScreen) {
        setIsOverlayOpen(false); // Close the overlay sidebar on small screens
      }

      // In a real application, you might also want to fetch and display the updated list of notes here.
    } catch (error) {
      console.error("Error saving note:", error);
      // Show error toast
      toast({
        title: "Error saving note.",
        description: error.message || "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Array of colors for note selection
  const colors = [
    "yellow.200",
    "blue.400",
    "red.500",
    "green.500",
    "yellow.500",
    "blackAlpha.500",
    "#fab6ceff",
    "#c4f5d3ff",
  ];

  return (
    <>
      {/* Hamburger Menu Button for Small Screens (Fixed Position) */}
      {isSmallScreen && (
        <Box position="fixed" top="4" left="4" zIndex="sticky">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Open navigation"
              icon={<HamburgerIcon w={6} h={6} />} // Hamburger icon for mobile menu
              variant="outline"
              onClick={() => setIsOverlayOpen(!isOverlayOpen)} // Toggles sidebar overlay
            />
            {/* MenuList is not used here as the MenuButton directly toggles the main sidebar */}
          </Menu>
        </Box>
      )}

      {/* Overlay Background for Small Screens (when sidebar is open) */}
      {isSmallScreen && isOverlayOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600" // Semi-transparent black overlay
          zIndex="overlay" // Ensures it's above main content
          onClick={() => setIsOverlayOpen(false)} // Closes overlay when clicked
        />
      )}

      {/* Main Sidebar Container */}
      <Box
        w={actualCollapsedState ? "100px" : "200px"} // Width changes based on collapsed state
        bg="white"
        borderRight={isSmallScreen ? "none" : "1px solid #e2e8f0"} // No border on small screens (overlay)
        h="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        transition="width 0.3s ease, transform 0.3s ease" // Smooth transition for width and slide effect
        position={isSmallScreen ? "fixed" : "relative"} // Fixed for overlay, relative for desktop
        left={isSmallScreen ? (isOverlayOpen ? "0" : "-400px") : "auto"} // Slides in/out from left
        top="0"
        zIndex="modal" // Higher z-index than overlay background
        boxShadow={isSmallScreen ? "lg" : "none"} // Adds shadow for overlay effect
      >
        <VStack align="stretch" spacing={6} p={4}>
          {/* Logo Section */}
          <HStack justify="space-between">
            {!actualCollapsedState && (
              <Text fontSize="xl" fontWeight="bold">
                My App
              </Text>
            )}
          </HStack>

          {/* Add New Note Section */}
          <VStack align="start" spacing={2}>
            <HStack
              spacing={2}
              onClick={() => setHidden(!hidden)} // Toggles visibility of note input fields
              cursor="pointer"
            >
              <MdAssignmentAdd size={30} />
              {!actualCollapsedState && (
                <Text fontWeight="medium">Add new</Text>
              )}
            </HStack>
            {hidden && ( // Conditionally render note input fields and save button
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                width="100%"
              >
                <VStack spacing={2} align="start" mt={2} width="100%">
                  {!actualCollapsedState && ( // Show inputs only when sidebar is expanded
                    <>
                      <Input
                        placeholder="Note title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        size="sm"
                        variant="filled"
                      />
                      <Input
                        placeholder="Note content"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        size="sm"
                        variant="filled"
                      />
                    </>
                  )}
                  <HStack spacing={2} align="start" flexWrap="wrap">
                    {colors.map((color) => (
                      <Circle
                        key={color}
                        size="24px" // Larger circles for better clickability
                        bg={color}
                        cursor="pointer"
                        border={
                          selectedColor === color
                            ? "2px solid blue.500"
                            : "2px solid transparent"
                        } // Highlight selected color
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </HStack>
                  {!actualCollapsedState && (
                    <Button
                      size="sm"
                      width="100%"
                      bg="green.500"
                      color="white"
                      mt={2}
                      onClick={handleSaveNote} // Calls the save function
                    >
                      Save Note
                    </Button>
                  )}
                </VStack>
              </MotionBox>
            )}
          </VStack>

          {/* Navigation Items */}
          <VStack align="start" spacing={4} color="gray.400" mt={5}>
            <HStack
              spacing={2}
              cursor="pointer"
              onClick={() => isSmallScreen && setIsOverlayOpen(false)}
            >
              <CiCalendar size={25} />
              {!actualCollapsedState && <Text>Calendar</Text>}
            </HStack>
            <HStack
              spacing={2}
              cursor="pointer"
              onClick={() => isSmallScreen && setIsOverlayOpen(false)}
            >
              <CiFileOn size={25} />
              {!actualCollapsedState && <Text>Archive</Text>}
            </HStack>
            <HStack
              spacing={2}
              cursor="pointer"
              onClick={() => isSmallScreen && setIsOverlayOpen(false)}
            >
              <CiTrash size={25} />
              {!actualCollapsedState && <Text>Trash</Text>}
            </HStack>
          </VStack>
        </VStack>

        {/* Upgrade & Toggle Section */}
        <Box p={4} textAlign="center">
          {!actualCollapsedState && (
            <>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Want to access unlimited notes taking experience & lots of
                feature?
              </Text>
              <Button size="sm" bg="blue.600" width="100%" mb={4} color="white">
                Upgrade pro
              </Button>
            </>
          )}
          <Box
            display="flex"
            justifyContent={actualCollapsedState ? "center" : "flex-start"}
            w="100%"
          >
            {/* The regular toggle button is hidden on small screens */}
            {!isSmallScreen && (
              <Button
                onClick={() => setCollapsed(!collapsed)} // Toggles collapsed state on desktop
                size="xl"
                variant="outline"
                borderColor="transparent"
                mx="auto"
                display="block"
                _hover={{ bg: "none" }}
              >
                {actualCollapsedState ? (
                  <MdOutlineChevronRight />
                ) : (
                  <MdOutlineChevronLeft />
                )}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
