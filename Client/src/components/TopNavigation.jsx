// TopNav.jsx
import {
  Box,
  Flex,
  Text,
  Spacer,
  Avatar,
  HStack,
  Button,
} from "@chakra-ui/react"; // Import Button

// Accept 'user' and 'onLogout' as props
const TopNav = ({ user, onLogout }) => {
  return (
    <Box px={6} py={4} color="black">
      <Flex align="center">

        <Spacer />
        {/* Avatar, Name, and Logout Button on the Right */}
        <HStack spacing={3} ml={20}>
          {user ? (
            <>
              <Text fontSize="lg" fontWeight="bold">
                {user.username}
              </Text>
              {/* Ensure user.firstname and user.lastname exist before using */}
              <Avatar
                name={
                  user.firstname
                    ? `${user.firstname} ${user.lastname}`
                    : user.username
                }
                src=""
              />
              <Button colorScheme="red" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            // This part should technically not be rendered if isLogedin is false,
            // but it's good for fallback.
            <Text fontSize="lg" fontWeight="bold">
              Guest
            </Text>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default TopNav;
