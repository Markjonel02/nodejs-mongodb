import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import notFoundImage from "/404.mp4";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function NotFoundPage() {
  return (
    <Box
      height="100vh"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      backgroundGradient="linear(to-br, purple.500, pink.500)"
      color="#fff"
      textAlign="center"
      overflow="hidden"
      px="4"
      position="relative"
    >
      {/* 404 video with 80% width */}
      <Box mb="6" display="flex" justifyContent="center" alignItems="center">
        <video src={notFoundImage} muted loop autoPlay width="600" />
      </Box>

      {/* Animated Heading and Text */}
      <MotionBox
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      >
        <Heading mb="4" color="black">
          Page Not Found
        </Heading>
        <Text fontSize="lg" mb="6" color="black">
          Sorry, we couldn’t find the page you’re looking for.
        </Text>
      </MotionBox>

      {/* Animated Floating Button */}
      <MotionButton
        colorScheme="yellow"
        size="lg"
        onClick={() => (window.location.href = "/")}
        position="fixed"
        bottom="50px"
        right="50px"
        boxShadow="lg"
        borderRadius="full"
        _hover={{ transform: "translateY(-5px)", boxShadow: "dark-lg" }}

        // framer-motion float-up-down animation
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Go Back Home
      </MotionButton>
    </Box>
  );
}
