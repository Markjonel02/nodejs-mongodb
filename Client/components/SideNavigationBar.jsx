import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Button,
  Image,
  Circle,
  Spacer,
} from "@chakra-ui/react";

import { CiCalendar } from "react-icons/ci";
import { CiFileOn } from "react-icons/ci";
import { CiTrash } from "react-icons/ci";
import { MdAssignmentAdd } from "react-icons/md";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [Hidden, setHidden] = useState(false);

  return (
    <Box
      w={collapsed ? "60px" : "220px"}
      bg="white"
      borderRight="1px solid #e2e8f0"
      h="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      transition="width 0.3s ease"
      position="relative"
    >
      <VStack align="stretch" spacing={6} p={4}>
        {/* Logo */}
        <HStack justify="space-between">
          {!collapsed && (
            <HStack spacing={2} mb={5}>
              {/*     <Image boxSize="20px" src="/logo.png" alt="Logo" /> */}
              <Text fontWeight="bold" color="blue.700">
                MINO
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Add new section */}
        <VStack align="start" spacing={2}>
          <HStack spacing={2} onClick={() => setHidden(!Hidden)}>
            <MdAssignmentAdd size={30} />
            {!collapsed && <Text fontWeight="medium">Add new</Text>}
          </HStack>
          {Hidden && (
            <Box
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {collapsed ? (
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
            </Box>
          )}
        </VStack>

        {/* Navigation Items */}
        <VStack align="start" spacing={4} color="gray.400" mt={5}>
          <HStack spacing={2}>
            <CiCalendar size={25} />

            {!collapsed && <Text>Calander</Text>}
          </HStack>
          <HStack spacing={2}>
            <CiFileOn size={25} />
            {!collapsed && <Text>Archive</Text>}
          </HStack>
          <HStack spacing={2}>
            <CiTrash size={25} />
            {!collapsed && <Text>Trash</Text>}
          </HStack>
        </VStack>
      </VStack>

      {/* Upgrade & Toggle Section */}
      <Box p={4} textAlign="center">
        {!collapsed && (
          <>
            <Text fontSize="xs" color="gray.500" mb={2}>
              Want to access unlimited notes taking experience & lots of
              feature?
            </Text>

            <video src="9zre4m7JbH74ruby0Q.mp4" autoPlay muted loop mx="auto" />
            <Button size="sm" bg="blue.600" width="100%" mb={4}>
              Upgrade pro
            </Button>
          </>
        )}
        <Box
          display="flex"
          justifyContent={collapsed ? "center" : "flex-start"}
          w="100%"
        >
          <Button
            onClick={() => setCollapsed(!collapsed)}
            size="xl"
            variant="outline"
            borderColor="transparent"
            mx="auto"
            display="block"
            _hover={{ bg: "none" }}
          >
            {collapsed ? <MdOutlineChevronRight /> : <MdOutlineChevronLeft />}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
