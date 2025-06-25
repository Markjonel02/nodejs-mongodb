import { useState, memo, lazy, Suspense } from "react"; // Suspense is imported but not directly used in Sidebar, only in the parent where Routes are defined
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
  Tooltip,
} from "@chakra-ui/react";

import {
  CiCalendar,
  CiFileOn,
  CiTrash,
  CiHeart,
  CiHome,
  CiSettings,
} from "react-icons/ci";
import { MdAssignmentAdd } from "react-icons/md";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import axios from "axios";
import { colors } from "../utils/colors"; // Assuming colors are defined here
import { Link as RouterLink, useLocation } from "react-router-dom";

// Removed lazy imports from here, as they are used in the main App component for Routes, not directly in sidebarLinks
// routes are used in the parent App.js (or similar) where <Routes> are defined.
// The sidebar itself only needs the string path.

const sidebarLinks = [
  { label: "Dashboard", icon: CiHome, path: "/" },
  { label: "Calendar", icon: CiCalendar, path: "/calendar" },
  { label: "Archive", icon: CiFileOn, path: "/archive" },
  { label: "Trash", icon: CiTrash, path: "/trash" },
  { label: "Favorites", icon: CiHeart, path: "/favorites" },
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
  // Hook to get current location for active link styling
  const location = useLocation();

  // Determine the actual collapsed state based on screen size and overlay status
  // On small screens, the sidebar is "collapsed" if the overlay is NOT open
  const actualCollapsedState = isSmallScreen ? !isOverlayOpen : collapsed;

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

  const handleSaveNote = async () => {
    // Input validation... (keep existing code)
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

    // --- START OF FIX ---

    // 1. Retrieve the JWT token from storage (e.g., localStorage)
    const token = localStorage.getItem("jwtToken"); // Assuming you save it as 'token' on login

    // 2. Check if a token exists
    if (!token) {
      toast({
        title: "Authentication required.",
        description: "Please log in to create notes.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      // Optionally, redirect to login page
      // history.push('/login'); // If you're using react-router-dom's useHistory
      return;
    }

    try {
      // 3. Send a POST request to the backend API, including the Authorization header
      const response = await axios.post(
        "http://localhost:5000/api/notes",
        {
          // Request body
          title: newNoteTitle,
          notes: newNoteContent,
          color: selectedColor,
        },
        {
          // Configuration object for axios, including headers
          headers: {
            "Content-Type": "application/json", // Good practice to explicitly set
            Authorization: `Bearer ${token}`, // THIS IS THE CRITICAL LINE
          },
        }
      );

      // --- END OF FIX ---

      console.log("Note saved successfully:", response.data);

      // Display success toast... (keep existing code)
      toast({
        title: "Note created.",
        description: "Your note has been successfully saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Reset form fields and hide the form... (keep existing code)
      setNewNoteTitle("");
      setNewNoteContent("");
      setSelectedColor("gray.200");
      setHidden(false);

      if (isSmallScreen) {
        setIsOverlayOpen(false);
      }

      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
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
        w={actualCollapsedState ? "80px" : "250px"}
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
            {sidebarLinks.map(({ label, icon: Icon, path }) => (
              <Tooltip
                key={label}
                label={label}
                isDisabled={!actualCollapsedState}
                hasArrow
                placement="right"
              >
                <HStack
                  as={RouterLink} // Use RouterLink for navigation
                  to={path} // 'path' here is a string URL, e.g., "/calendar"
                  spacing={2}
                  cursor="pointer"
                  _hover={{ color: "gray.600", transform: "scale(1.05)" }}
                  transition="all 0.2s"
                  onClick={() => isSmallScreen && setIsOverlayOpen(false)}
                  // Apply active styling if the current path matches the link's path
                  color={location.pathname === path ? "blue.500" : "gray.400"} // This comparison is now correct
                  fontWeight={location.pathname === path ? "bold" : "normal"}
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
