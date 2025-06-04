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
  Menu, // Import Menu
  MenuButton, // Import MenuButton
} from "@chakra-ui/react";

import { CiCalendar, CiFileOn, CiTrash } from "react-icons/ci";
import {
  MdAssignmentAdd,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
} from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons"; // Import Chakra UI icons
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);

  const [isSmallScreen] = useMediaQuery("(max-width: 48em)");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Determine if the sidebar should be open based on screen size
  const actualCollapsedState = isSmallScreen ? !isOverlayOpen : collapsed;

  return (
    <>
      {/* Hamburger Menu Button for Small Screens */}
      {isSmallScreen && (
        <Box
          position="fixed"
          top="4"
          left="4"
          zIndex="sticky"
          background={"blue.200"}
          borderRadius="md"
        >
          {" "}
          {/* Adjust position and zIndex as needed */}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon w={6} h={6} />} // Adjust size of HamburgerIcon
              variant="outline"
              onClick={() => setIsOverlayOpen(!isOverlayOpen)} // Toggle overlay on click
            />
            {/* The MenuList and MenuItem are now directly controlling the sidebar's state */}
            
          </Menu>
        </Box>
      )}

      {/* Overlay for small screens */}
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
        w={actualCollapsedState ? "100px" : "400px"}
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
          {/* Logo */}
          <HStack justify="space-between">
            {!actualCollapsedState && (
              <Text fontSize="xl" fontWeight="bold">
                My App
              </Text>
            )}
          </HStack>

          {/* Add new section */}
          <VStack align="start" spacing={2}>
            <HStack
              spacing={2}
              onClick={() => setHidden(!hidden)}
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
              >
                {actualCollapsedState ? (
                  <VStack spacing={2} align="start" ml={2} mt={2}>
                    <Circle size="10px" bg="yellow.200" />
                    <Circle size="10px" bg="blue.400" />
                    <Circle size="10px" bg="red.500" />
                    <Circle size="10px" bg="green.500" />
                    <Circle size="10px" bg="yellow.500" />
                    <Circle size="10px" bg="blackAlpha.500" />
                  </VStack>
                ) : (
                  <HStack spacing={2} ml={2} align="start" mt={2}>
                    <Circle size="10px" bg="yellow.200" />
                    <Circle size="10px" bg="blue.400" />
                    <Circle size="10px" bg="red.500" />
                    <Circle size="10px" bg="green.500" />
                    <Circle size="10px" bg="yellow.500" />
                    <Circle size="10px" bg="blackAlpha.500" />
                  </HStack>
                )}
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
              {" "}
              {/* Close on item click */}
              <CiCalendar size={25} />
              {!actualCollapsedState && <Text>Calendar</Text>}
            </HStack>
            <HStack
              spacing={2}
              cursor="pointer"
              onClick={() => isSmallScreen && setIsOverlayOpen(false)}
            >
              {" "}
              {/* Close on item click */}
              <CiFileOn size={25} />
              {!actualCollapsedState && <Text>Archive</Text>}
            </HStack>
            <HStack
              spacing={2}
              cursor="pointer"
              onClick={() => isSmallScreen && setIsOverlayOpen(false)}
            >
              {" "}
              {/* Close on item click */}
              <CiTrash size={25} />
              {!actualCollapsedState && <Text>Trash</Text>}
            </HStack>
          </VStack>
        </VStack>

        {/* Upgrade & Toggle Section */}
        <Box p={4} textAlign="center">
          {!actualCollapsedState && (
            <>
              {/*  <Video src=""></Video> */}
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
            bg={actualCollapsedState ? "transparent" : "white"}
            justifyContent={actualCollapsedState ? "center" : "flex-start"}
            w="100%"
          >
            {/* The regular toggle button is hidden on small screens */}
            {!isSmallScreen && (
              <Button
                onClick={() => {
                  if (isSmallScreen) {
                    setIsOverlayOpen(!isOverlayOpen);
                  } else {
                    setCollapsed(!collapsed);
                  }
                }}
                size="xl"
                variant="outline"
                borderColor="transparent"
                mx="auto"
                display="block"
                _hover={{ bg: "red.200" }}
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
