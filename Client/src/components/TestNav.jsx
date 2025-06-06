import React, { useState, memo } from "react"; // Import memo
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
  Input,
  useToast,
  Textarea,
  Tooltip, // Import Tooltip for improved UX
} from "@chakra-ui/react";

// Importing icons from react-icons/ci and react-icons/md
import { CiCalendar, CiFileOn, CiTrash, CiHeart } from "react-icons/ci";
import { MdAssignmentAdd } from "react-icons/md";
// Using MdOutlineChevronLeft and MdOutlineChevronRight from react-icons/md as they are more appropriate
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons"; // Hamburger icon from Chakra UI
import { motion } from "framer-motion"; // For smooth animations
import video from "/9zre4m7JbH74ruby0Q.mp4";
import axios from "axios"; // For making HTTP requests to your backend

const sidebarLinks = [
  { label: "Calendar", icon: CiCalendar },
  { label: "Archive", icon: CiFileOn },
  { label: "Trash", icon: CiTrash },
  { label: "Favorites", icon: CiHeart },
];

// Array of colors for note selection
export const colors = [
  "yellow.200",
  "#FFD6BA",
  "red.100",
  "#9EC6F3",
  "#FFDCDC",
  "#D5C7A3",
  "#fab6ceff", // Custom color 1
  "#c4f5d3ff", // Custom color 2
  "#BFECFF",
  "#CDC1FF",
  "#E5D9F2",
  "#F8EDE3",
  "#E0E5B6",
  "#F19ED2",
  "#F8F3D9",
  "#F9F5F6",
];
// Define MotionBox for animating the new note form
const MotionBox = motion(Box);

// Wrap the Sidebar component with React.memo for performance optimization
const Sidebar = ({ onNoteAdded }) => {
  // State to manage if the sidebar is collapsed or expanded
  const [collapsed, setCollapsed] = useState(false);
  // State to control the visibility of the new note input form
  const [hidden, setHidden] = useState(false);

  // States for new note input fields
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  // State for selected note color, with a default
  const [selectedColor, setSelectedColor] = useState("gray.200");

  // Hook to check for small screen size, used for responsive behavior
  const [isSmallScreen] = useMediaQuery("(max-width: 48em)");
  // State to manage the overlay visibility on small screens (for mobile sidebar)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  // Chakra UI toast hook for displaying notifications
  const toast = useToast();

  // Determine the actual collapsed state based on screen size and overlay status
  // On small screens, the sidebar is "collapsed" if the overlay is NOT open
  const actualCollapsedState = isSmallScreen ? !isOverlayOpen : collapsed;

  /**
   * Handles the click event for the "Add new" button.
   * - If the sidebar is currently collapsed, it will uncollapse it and show the new note form.
   * - If the sidebar is already uncollapsed, it will simply toggle the visibility of the new note form.
   */
  const handleAddNewClick = () => {
    if (actualCollapsedState) {
      // If sidebar is collapsed, uncollapse it and immediately show the form
      setCollapsed(false);
      setHidden(true);
    } else {
      // If sidebar is already uncollapsed, just toggle the form visibility
      setHidden(!hidden);
    }
  };

  /**
   * Handles saving a new note.
   * Performs input validation, sends data to the backend via axios,
   * displays toast notifications for success or error, and resets form fields.
   */
  const handleSaveNote = async () => {
    // Input validation: ensure title and content are not empty
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
      // Send a POST request to the backend API to save the note
      const response = await axios.post("http://localhost:5000/api/notes", {
        title: newNoteTitle,
        notes: newNoteContent,
        color: selectedColor,
      });

      console.log("Note saved successfully:", response.data);

      // Display success toast
      toast({
        title: "Note created.",
        description: "Your note has been successfully saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Reset form fields and hide the form
      setNewNoteTitle("");
      setNewNoteContent("");
      setSelectedColor("gray.200");
      setHidden(false);

      // Close overlay on small screens after saving
      if (isSmallScreen) {
        setIsOverlayOpen(false);
      }

      // Call parent's onNoteAdded callback if provided
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      // Extract error message from axios response or provide a generic one
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      // Display error toast
      toast({
        title: "Error saving note.",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <>
      {/* Mobile Hamburger Menu Icon for small screens */}
      {isSmallScreen && (
        <Box position="fixed" top="4" left="4" zIndex="sticky">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Open navigation"
              icon={<HamburgerIcon w={6} h={6} />}
              variant="outline"
              onClick={() => setIsOverlayOpen(!isOverlayOpen)}
            />
          </Menu>
        </Box>
      )}

      {/* Overlay for small screens when sidebar is open */}
      {isSmallScreen && isOverlayOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={() => setIsOverlayOpen(false)} // Close overlay on click outside
        />
      )}

      {/* Main Sidebar Container */}
      <Box
        // Adjust width based on collapsed state (80px for collapsed, 320px for expanded)
        w={actualCollapsedState ? "80px" : "350px"}
        bg="white"
        // No right border on small screens when it's an overlay
        borderRight={isSmallScreen ? "none" : "1px solid #e2e8f0"}
        h="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        transition="width 0.3s ease, transform 0.3s ease" // Smooth transition for width and transform
        // Positioning for small screens (fixed, slides in/out) vs. desktop (relative)
        position={isSmallScreen ? "fixed" : "relative"}
        left={isSmallScreen ? (isOverlayOpen ? "0" : "-400px") : "auto"}
        top="0"
        zIndex="modal" // Ensure it's above other content on mobile
        boxShadow={isSmallScreen ? "lg" : "none"} // Shadow for mobile overlay
      >
        <VStack align="stretch" spacing={6} p={4}>
          <HStack justify="space-between">
            {/* App title, visible only when sidebar is not collapsed */}
            {!actualCollapsedState && (
              <Text fontSize="xl" fontWeight="bold">
                My App
              </Text>
            )}
          </HStack>

          <VStack align="start" spacing={2}>
            {/* "Add new" button/link */}
            {/* Display "Add new" text if not collapsed, otherwise just the icon (handled below with tooltip) */}
            {!actualCollapsedState && (
              <HStack spacing={2} onClick={handleAddNewClick} cursor="pointer">
                <MdAssignmentAdd size={30} />
                <Text fontWeight="medium">Add new</Text>
              </HStack>
            )}

            {/* Tooltip for "Add new" when sidebar is collapsed */}
            {actualCollapsedState && (
              <Tooltip label="Add new note" hasArrow placement="right">
                <HStack
                  spacing={2}
                  onClick={handleAddNewClick}
                  cursor="pointer"
                >
                  <MdAssignmentAdd size={30} />
                </HStack>
              </Tooltip>
            )}

            {/* New Note Form: Conditionally rendered based on 'hidden' state and actualCollapsedState.
                Only show if 'hidden' is true AND the sidebar is not collapsed. */}
            {hidden && !actualCollapsedState && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                width="100%"
              >
                <VStack spacing={2} align="start" mt={2} width="100%">
                  {/* Note Title Input */}
                  <Input
                    placeholder="Note title"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    size="sm"
                    variant="filled"
                    borderRadius="md" // Added rounded corners
                  />

                  {/* Note Content Textarea */}
                  <Textarea
                    placeholder="Note content"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    size="sm"
                    rows={5}
                    variant="filled"
                    borderRadius="md" // Added rounded corners
                  />

                  {/* Color Selection Circles */}
                  <HStack spacing={2} align="start" flexWrap="wrap">
                    {colors.map((color) => (
                      <Circle
                        key={color}
                        size="24px"
                        bg={color}
                        cursor="pointer"
                        border="2px solid transparent"
                        borderColor={
                          selectedColor === color ? "blue.500" : "transparent"
                        }
                        _focus={{
                          outline: "2px solid blue.500",
                          boxShadow: "0 0 5px blue.500",
                        }}
                        _active={{
                          borderColor: "blue.500",
                        }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </HStack>

                  {/* Save Note Button */}
                  <Button
                    size="sm"
                    width="100%"
                    bg="green.500"
                    color="white"
                    mt={2}
                    onClick={handleSaveNote}
                    _hover={{ bg: "green.600" }} // Hover effect
                    borderRadius="md" // Added rounded corners
                  >
                    Save Note
                  </Button>
                </VStack>
              </MotionBox>
            )}
          </VStack>

          {/* Navigation Links with Tooltips */}
          <VStack align="start" spacing={4} color="gray.400" mt={5}>
            {sidebarLinks.map(({ label, icon: Icon }) => (
              <Tooltip
                key={label}
                label={label}
                isDisabled={!actualCollapsedState}
                hasArrow
                placement="right"
              >
                <HStack
                  spacing={2}
                  cursor="pointer"
                  _hover={{ color: "gray.600", transform: "scale(1.05)" }}
                  transition="all 0.2s"
                  onClick={() => isSmallScreen && setIsOverlayOpen(false)}
                >
                  <Icon size={25} />
                  {!actualCollapsedState && <Text>{label}</Text>}
                </HStack>
              </Tooltip>
            ))}
          </VStack>
        </VStack>

        {/* Bottom Section: Upgrade Pro and Collapse Button */}
        <Box p={4} textAlign="center">
          {/* Upgrade Pro section, visible only when sidebar is not collapsed */}
          {!actualCollapsedState && (
            <>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Want to access unlimited notes taking experience & lots of
                feature?
              </Text>
              <video width="750" height="500" muted loop autoPlay>
                <source src={video} type="video/mp4" />
              </video>
            </>
          )}
          <Box
            display="flex"
            // Center button if collapsed, align left if expanded
            justifyContent={actualCollapsedState ? "center" : "flex-start"}
            w="100%"
          >
            {/* Collapse/Expand Button, not visible on small screens */}
            {!isSmallScreen && (
              <Button
                onClick={() => setCollapsed(!collapsed)}
                size="xl" // Larger button size
                variant="outline"
                borderColor="transparent" // Transparent border
                mx="auto" // Center horizontally if collapsed
                display="block"
                _hover={{ bg: "gray.100" }} // Slight hover background
                borderRadius="full" // Fully rounded for a cleaner look
              >
                {actualCollapsedState ? (
                  <MdOutlineChevronRight /> // Right arrow when collapsed
                ) : (
                  <MdOutlineChevronLeft /> // Left arrow when expanded
                )}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}; // Wrapped with memo

export default memo(Sidebar);
