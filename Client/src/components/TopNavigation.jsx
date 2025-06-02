import {
  Box,
  Flex,
  Text,
  Button,
  Spacer,
  Avatar,
  HStack,
} from "@chakra-ui/react";

const TopNav = () => {
  return (
    <Box px={6} py={4} color="black">
      <Flex align="center">
        {/* Navigation Buttons */}
        <Text fontSize="xl" fontWeight="bold">
          MINO
        </Text>
        <Spacer />
        <Button variant="ghost" colorScheme="blackAlpha.500" fontWeight={200}>
          Add New
        </Button>
        <Button variant="ghost" colorScheme="blackAlpha.500" fontWeight={200}>
          Calendar
        </Button>
        <Button variant="ghost" colorScheme="blackAlpha.500" fontWeight={200}>
          Archive
        </Button>
        <Button variant="ghost" colorScheme="blackAlpha.500" fontWeight={200}>
          Trash
        </Button>

        {/* Avatar and Name on the Right */}
        <HStack spacing={3} ml={20}>
          <Text fontSize="lg" fontWeight="bold">
            Mark
          </Text>
          <Avatar name="Mark" src="https://bit.ly/dan-abramov" />
        </HStack>
      </Flex>
    </Box>
  );
};

export default TopNav;
