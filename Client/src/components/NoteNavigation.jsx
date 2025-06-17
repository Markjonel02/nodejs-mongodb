// components/NoteNavigation.js
import {
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Icon,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiSearch } from "react-icons/fi";
import React, { useState, useEffect } from "react";

// Helper function to get initial sort state from localStorage
const getInitialSortBy = () => {
  const storedSortBy = localStorage.getItem("noteSortBy");
  return storedSortBy ? storedSortBy : "dateDesc";
};

export const NoteNavigation = ({ onSearch, onSort }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(getInitialSortBy);

  // Debounce effect for search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Notify parent component about debounced search term
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  // Notify parent component about sort order and save to localStorage
  useEffect(() => {
    localStorage.setItem("noteSortBy", sortBy);
    onSort(sortBy);
  }, [sortBy, onSort]);

  return (
    <Flex width="100%" mb={4} px={4} alignItems="center" mt={4}>
      <InputGroup
        width={{ base: "100%", sm: "200px", md: "250px", lg: "300px" }}
        maxWidth={{ base: "100%", sm: "200px", md: "250px", lg: "300px" }}
        transition="all 0.3s ease-in-out"
        _focusWithin={{
          width: { base: "100%", sm: "250px", md: "350px", lg: "400px" },
          maxWidth: { base: "100%", sm: "250px", md: "350px", lg: "400px" },
          borderColor: "blue.400",
        }}
        mr={4}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        _hover={{
          boxShadow: "md",
        }}
      >
        <InputLeftElement pointerEvents="none" height="100%">
          <Icon as={FiSearch} color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="md"
          pl="3rem"
          border="1px solid"
          borderColor="gray.200"
          _placeholder={{ color: "gray.400" }}
          _focus={{
            borderColor: "blue.400",
            boxShadow: "none",
          }}
        />
      </InputGroup>
      <Spacer />
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          size="sm"
          bg={"transparent"}
        >
          Sort By:{" "}
          {sortBy === "az"
            ? "A-Z"
            : sortBy === "dateDesc"
            ? "Date (Newest)"
            : "Date (Oldest)"}
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => setSortBy("az")}>A-Z</MenuItem>
          <MenuItem onClick={() => setSortBy("dateDesc")}>
            Date (Newest First)
          </MenuItem>
          <MenuItem onClick={() => setSortBy("dateAsc")}>
            Date (Oldest First)
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};
