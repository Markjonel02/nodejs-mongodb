import React from "react";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
// import notFoundImage from "/404.mp4"; // This import is commented out as the video is not used

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionText = motion(Text); // Added MotionText for animating the background text

export default function NotFoundPage() {
  return (
    <Box
      height="100vh"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      // Using CSS gradient for better performance than Chakra's prop
      color="#fff"
      textAlign="center"
      overflow="hidden"
      px="4"
      position="relative" // Set to relative for absolute positioning of children
    >
      {/* Background "NO PAGE FOUND" text with breathing animation */}
      <MotionText
        fontSize={{ base: "6xl", md: "8xl", lg: "9xl" }} // Responsive font size
        fontWeight="extrabold"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        color="rgba(255, 255, 255, 0.1)" // Light color with low opacity
        userSelect="none" // Prevent text selection
        pointerEvents="none" // Allow clicks to pass through
        zIndex="0" // Ensure it's in the background
        initial={{ opacity: 0.05 }}
        animate={{ opacity: [0.05, 0.15, 0.05] }} // Breathing animation
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        NO PAGE FOUND
      </MotionText>

      {/* "404" text on top of the background text */}
      <MotionText
        fontSize={{ base: "8xl", md: "9xl", lg: "10rem" }} // Very large font size
        fontWeight="extrabold"
        color="black" // Stronger color to stand out
        zIndex="1" // Ensure it's above the background text
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        mb="4" // Margin bottom to separate from heading
      >
        404
      </MotionText>

      {/* Animated Heading and Text (main content) */}
      <MotionBox
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        zIndex="2" // Ensure main content is on top
      >
        <Heading mb="4" color="black" fontSize={{ base: "2xl", md: "3xl" }}>
          Page Not Found
        </Heading>
        <Text fontSize={{ base: "md", md: "lg" }} mb="6" color="black">
          Sorry, we couldn’t find the page you’re looking for.
        </Text>
      </MotionBox>

      {/* Animated Floating Button */}
    </Box>
  );
}
