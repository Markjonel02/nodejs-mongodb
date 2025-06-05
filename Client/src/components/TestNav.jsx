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
  Input,
  useToast,
  Textarea,
  Tooltip, // Import Tooltip
} from "@chakra-ui/react";

import { CiCalendar, CiFileOn, CiTrash } from "react-icons/ci";
import {
  MdAssignmentAdd,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
} from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import axios from "axios"; // Import axios

const MotionBox = motion(Box);

const Sidebar = ({ onNoteAdded }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("gray.200");

  const [isSmallScreen] = useMediaQuery("(max-width: 48em)");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const toast = useToast();

  const actualCollapsedState = isSmallScreen ? !isOverlayOpen : collapsed;

  // Function to handle "Add new" click
  const handleAddNewClick = () => {
    if (actualCollapsedState) {
      setCollapsed(false); // Uncollapse the sidebar if it's collapsed
    }
    setHidden(!hidden); // Toggle the visibility of the new note form
  };

  const handleSaveNote = async () => {
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
      // Use axios.post instead of fetch
      const response = await axios.post("http://localhost:5000/api/notes", {
        // Axios automatically serializes the body to JSON
        title: newNoteTitle,
        notes: newNoteContent,
        color: selectedColor,
      });

      console.log("Note saved successfully:", response.data); // response.data contains the JSON response

      toast({
        title: "Note created.",
        description: "Your note has been successfully saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

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
      // Axios errors have a response object with data for error details
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

  const colors = [
    "yellow.200",
    "blue.400",
    "red.100",
    "green.500",
    "yellow.500",
    "blackAlpha.500",
    "#fab6ceff",
    "#c4f5d3ff",
  ];

  return (
    <>
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

      {isSmallScreen && isOverlayOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={() => setIsOverlayOpen(false)}
        />
      )}

      <Box
        w={actualCollapsedState ? "100px" : "200px"}
        bg="white"
        borderRight={isSmallScreen ? "none" : "1px solid #e2e8f0"}
        h="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        transition="width 0.3s ease, transform 0.3s ease"
        position={isSmallScreen ? "fixed" : "relative"}
        left={isSmallScreen ? (isOverlayOpen ? "0" : "-400px") : "auto"}
        top="0"
        zIndex="modal"
        boxShadow={isSmallScreen ? "lg" : "none"}
      >
        <VStack align="stretch" spacing={6} p={4}>
          <HStack justify="space-between">
            {!actualCollapsedState && (
              <Text fontSize="xl" fontWeight="bold">
                My App
              </Text>
            )}
          </HStack>

          <VStack align="start" spacing={2}>
            <HStack
              spacing={2}
              onClick={handleAddNewClick} // Use the new handler
              cursor="pointer"
            >
              <MdAssignmentAdd size={30} />
              {!actualCollapsedState && (
                <Text fontWeight="medium">Add new</Text>
              )}
            </HStack>
            {hidden && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                width="100%"
              >
                <VStack spacing={2} align="start" mt={2} width="100%">
                  {/* These inputs and buttons will now always be visible if 'hidden' is true, regardless of collapsed state */}
                  <>
                    <Input
                      placeholder="Note title"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      size="sm"
                      variant="filled"
                    />

                    <Textarea
                      placeholder="Note content"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      size="sm"
                      variant="filled"
                    />
                  </>

                  <HStack spacing={2} align="start" flexWrap="wrap">
                    {colors.map((color) => (
                      <Circle
                        key={color}
                        size="24px"
                        bg={color}
                        cursor="pointer"
                        border={
                          selectedColor === color
                            ? "2px solid blue.500"
                            : "2px solid transparent"
                        }
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </HStack>
                  {/* Save Note button will also always be visible if 'hidden' is true */}
                  <Button
                    size="sm"
                    width="100%"
                    bg="green.500"
                    color="white"
                    mt={2}
                    onClick={handleSaveNote}
                  >
                    Save Note
                  </Button>
                </VStack>
              </MotionBox>
            )}
          </VStack>

          <VStack align="start" spacing={4} color="gray.400" mt={5}>
            <Tooltip
              label="Calendar"
              isDisabled={!actualCollapsedState}
              hasArrow
              placement="right"
            >
              <HStack
                spacing={2}
                cursor="pointer"
                onClick={() => isSmallScreen && setIsOverlayOpen(false)}
              >
                <CiCalendar size={25} />
                {!actualCollapsedState && <Text>Calendar</Text>}
              </HStack>
            </Tooltip>
            <Tooltip
              label="Archive"
              isDisabled={!actualCollapsedState}
              hasArrow
              placement="right"
            >
              <HStack
                spacing={2}
                cursor="pointer"
                onClick={() => isSmallScreen && setIsOverlayOpen(false)}
              >
                <CiFileOn size={25} />
                {!actualCollapsedState && <Text>Archive</Text>}
              </HStack>
            </Tooltip>
            <Tooltip
              label="Trash"
              isDisabled={!actualCollapsedState}
              hasArrow
              placement="right"
            >
              <HStack
                spacing={2}
                cursor="pointer"
                onClick={() => isSmallScreen && setIsOverlayOpen(false)}
              >
                <CiTrash size={25} />
                {!actualCollapsedState && <Text>Trash</Text>}
              </HStack>
            </Tooltip>
          </VStack>
        </VStack>

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
            {!isSmallScreen && (
              <Button
                onClick={() => setCollapsed(!collapsed)}
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
