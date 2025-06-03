import { Box, Flex, Text, Spacer, Avatar, HStack } from "@chakra-ui/react";

const TopNav = () => {
  return (
    <Box px={6} py={4} color="black">
      <Flex align="center">
        {/* Navigation Buttons */}

        <Spacer />

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
