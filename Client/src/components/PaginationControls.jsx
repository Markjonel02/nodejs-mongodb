// components/PaginationControls.js
import { Button, ButtonGroup, Flex, Box } from "@chakra-ui/react"; // Import Box
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import React from "react";

export const PaginationControls = ({ currentPage, totalPages, paginate }) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or no items
  }

  return (
    // Use a Box with fixed positioning for the container
    <Box
      position="fixed" // Fixes the element relative to the viewport
      bottom="0" // Positions it at the bottom of the viewport
      left="0" // Starts from the left edge
      right="0" // Extends to the right edge
      width="100%" // Ensures it spans the full width
      p={4} // Add some padding
      bg="transparent" // Set a background color (important for readability)
      zIndex="10" // Ensure it stays on top of other content
    >
      <Flex justifyContent="center">
        <ButtonGroup>
          <Button
            onClick={() => paginate(currentPage - 1)}
            isDisabled={currentPage === 1}
            leftIcon={<ChevronLeftIcon fontSize={25} />}
            colorScheme="blue"
            variant="outline"
          ></Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              colorScheme={currentPage === i + 1 ? "blue" : "gray"}
              variant={currentPage === i + 1 ? "solid" : "outline"}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            onClick={() => paginate(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            rightIcon={<ChevronRightIcon fontSize={25} />}
            colorScheme="blue"
            variant="outline"
          ></Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};
