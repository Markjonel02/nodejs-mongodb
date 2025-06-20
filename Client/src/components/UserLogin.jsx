import { useState } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Stack,
  Text,
  IconButton,
  useColorModeValue,
  useToast, // Import useToast for notifications
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

//accept on loggedin as props from the app
const UserLogin = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(""); //state for username and email input
  const [password, setPasword] = useState(""); //for password input
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async () => {
    setLoading(true); //loading when process start

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/userlogin",
        { identifier, password } //Axios automatically serializes this to JSON
      );
      // Axios wraps the response data in `response.data`
      const data = response.data;

      toast({
        title: "Login Successful!",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Call the onLoginSuccess prop from App.jsx to update the parent state
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Login error response data:", error.response.data);
        console.error("Login error status:", error.response.status);

        toast({
          title: "Login Failed",
          description:
            error.response.data.message || "An unexpected error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
        console.error("Login error request:", error.request);
        toast({
          title: "Network Error.",
          description:
            "No response from server. Please check your connection or server status.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up login request:", error.message);
        toast({
          title: "Error.",
          description: "An unexpected client-side error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false); //set loading off when the process finished
    }
  };
  return (
    <Flex minH="100vh" align="center" justify="center">
      <Box
        rounded="2xl"
        boxShadow="2xl"
        p={8}
        maxW="md"
        w="full"
        bg={useColorModeValue("white", "gray.800")}
      >
        <Stack spacing={4}>
          <Heading fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
            Welcome Back 👋
          </Heading>

          <Input
            placeholder="Email address"
            type="email"
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <InputGroup>
            <Input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              variant="filled"
              size="lg"
              bg={useColorModeValue("gray.100", "gray.700")}
              _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
              value={password}
              onChange={(e) => setPasword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
            <InputRightElement h="full">
              <IconButton
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                onClick={() => setShowPassword((show) => !show)}
                aria-label="Toggle password visibility"
              />
            </InputRightElement>
          </InputGroup>

          <Stack spacing={4} pt={2}>
            <Button
              colorScheme="teal"
              size="lg"
              fontSize="md"
              _hover={{ transform: "scale(1.02)" }}
              onClick={handleLogin}
              isLoading={isLoading}
              loadingText="Signing In..."
            >
              Sign In
            </Button>
          </Stack>

          <Text align="center" fontSize="sm">
            Don’t have an account?{" "}
            <Text as="span" color="teal.400" fontWeight="bold" cursor="pointer">
              Sign up
            </Text>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default UserLogin;
