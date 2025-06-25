import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
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
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "axios";
// import UserCreation from "../routes/UserCreation"; // No need to import here if it's a route

const UserLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/userlogin", // Ensure this matches your backend login route
        {
          identifier,
          password,
        }
      );
      navigate("/dashboard"); // Redirect to the home page or dashboard after successful login
      const data = response.data;

      toast({
        title: "Login Successful!",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // --- CRUCIAL ADDITION FOR JWT PERSISTENCE ---
      // 1. Store the JWT token in localStorage
      if (data.token) {
        localStorage.setItem("jwtToken", data.token);
      }
      // 2. Store a flag in localStorage
      localStorage.setItem("isLoggedIn", "true");
      // 3. Store the user object in localStorage (as a string)
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      // --- END CRUCIAL ADDITION ---

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (error) {
      if (error.response) {
        console.error("Login error response data:", error.response.data);
        console.error("Login error status:", error.response.status);
        toast({
          title: "Login Failed.",
          description:
            error.response.data.message || "An unexpected error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else if (error.request) {
        console.error("Login error request:", error.request);
        toast({
          title: "Network Error.",
          description:
            "No response from server. Please check your connection or server status.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        console.error("Error setting up login request:", error.message);
        toast({
          title: "Error.",
          description: "An unexpected client-side error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } finally {
      setLoading(false);
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
            placeholder="Email address or Username"
            type="text"
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
              onChange={(e) => setPassword(e.target.value)}
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
              isLoading={loading}
              loadingText="Signing In..."
            >
              Sign In
            </Button>
          </Stack>

          <Text align="center" fontSize="sm">
            Don’t have an account?{" "}
            <Link to="/signup">
              <Text
                as="span"
                color="teal.400"
                fontWeight="bold"
                cursor="pointer"
              >
                sign up
              </Text>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default UserLogin;
