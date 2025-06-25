import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link
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
  useToast, // Import useToast hook from Chakra UI
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"; // Import Chakra UI icons
import axios from "axios"; // For making HTTP requests

// Main UserCreation functional component
const UserCreation = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const toast = useToast(); // Hook for displaying Chakra UI toasts

  // State for toggling password visibility for the main password input
  const [showPassword, setShowPassword] = useState(false);
  // State for toggling password visibility for the confirm password input
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for the first name input
  const [firstName, setFirstName] = useState("");
  // State for the last name input
  const [lastName, setLastName] = useState("");
  // State for the username input (formerly 'identifier')
  const [username, setUsername] = useState(""); // Renamed identifier to username
  // State for the new email input
  const [email, setEmail] = useState(""); // New state for email
  // State for the password input
  const [password, setPassword] = useState("");
  // State for the confirm password input
  const [confirmPassword, setConfirmPassword] = useState("");
  // State for loading indicator on button
  const [loading, setLoading] = useState(false);

  /**
   * handleSignUp function handles the user registration process.
   * It performs client-side validation and then sends a POST request
   * to the backend API for user creation.
   */
  const handleSignUp = async () => {
    // --- DEBUGGING LOGS ---
    console.log("--- handleSignUp called ---");
    console.log("firstName:", firstName);
    console.log("lastName:", lastName);
    console.log("username:", username);
    console.log("email:", email);
    console.log("password:", password ? "******" : "EMPTY"); // Mask password for security in logs
    console.log("confirmPassword:", confirmPassword ? "******" : "EMPTY"); // Mask confirmPassword
    console.log("-------------------------");
    // --- END DEBUGGING LOGS ---

    // --- Frontend Validation ---
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast({
        title: "Missing Information.",
        description: "Please fill in all fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Email format validation for the dedicated email input
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email.",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Password length validation
    if (password.length < 8) {
      toast({
        title: "Password Too Short.",
        description: "Password must be at least 8 characters long.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Password strength validation (at least one uppercase, one lowercase, one number, one special character)
    const passwordStrengthRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      toast({
        title: "Weak Password.",
        description:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch.",
        description: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    // --- End Frontend Validation ---

    setLoading(true); // Set loading state to true while the request is in progress

    try {
      // Proceed directly with user creation.
      // The backend's /api/user/usercreate endpoint is expected to handle
      // the uniqueness check for the username and email.
      // From UserCreation component
      const response = await axios.post(
        "http://localhost:5000/api/user/usercreate",
        {
          firstName, // Sends 'firstName'
          lastName, // Sends 'lastName'
          username,
          email,
          password,
        }
      );

      const data = response.data; // Get response data from the server

      // Display a success toast message
      toast({
        title: "Registration Successful!",
        description: data.message || "Your account has been created.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Clear the form fields after successful registration
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect the user to the login page after successful registration
      navigate("/login"); // Use navigate for programmatic redirection within React Router
    } catch (error) {
      // General error handling for the user creation request
      if (error.response) {
        console.error("Registration error response data:", error.response.data);
        console.error("Registration error status:", error.response.status);
        toast({
          title: "Registration Failed.",
          description:
            error.response.data.message ||
            "An unexpected error occurred during registration. Please check if the username or email is already taken.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else if (error.request) {
        console.error("Registration error request:", error.request);
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
        console.error("Error setting up registration request:", error.message);
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
      setLoading(false); // Always set loading state to false after the request completes (success or error)
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.100", "gray.900")}
    >
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
            Create Your Account 🚀
          </Heading>

          <Input
            placeholder="First Name"
            type="text"
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Input
            placeholder="Last Name"
            type="text"
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {/* Updated to be Username input */}
          <Input
            placeholder="Username"
            type="text"
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={username} // Bind to username state
            onChange={(e) => setUsername(e.target.value)} // Update username state
          />

          {/* New Email input */}
          <Input
            placeholder="Email Address"
            type="email" // Use type="email" for better browser validation
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={email} // Bind to email state
            onChange={(e) => setEmail(e.target.value)} // Update email state
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
            />
            <InputRightElement h="full">
              <IconButton
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                onClick={() => setShowPassword((show) => !show)} // Controls only 'showPassword'
                aria-label="Toggle password visibility"
              />
            </InputRightElement>
          </InputGroup>

          <InputGroup>
            <Input
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"} // Uses 'showConfirmPassword'
              variant="filled"
              size="lg"
              bg={useColorModeValue("gray.100", "gray.700")}
              _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSignUp();
                }
              }}
            />
            <InputRightElement h="full">
              <IconButton
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />} // Controls only 'showConfirmPassword'
                variant="ghost"
                onClick={() => setShowConfirmPassword((show) => !show)} // Toggles 'showConfirmPassword'
                aria-label="Toggle confirm password visibility"
              />
            </InputRightElement>
          </InputGroup>

          <Stack spacing={4} pt={2}>
            <Button
              colorScheme="teal"
              size="lg"
              fontSize="md"
              _hover={{ transform: "scale(1.02)" }}
              onClick={handleSignUp}
              isLoading={loading}
              loadingText="Creating Account..."
            >
              Sign Up
            </Button>
          </Stack>

          <Text align="center" fontSize="sm">
            Already have an account?{" "}
            <Link to="/login">
              {" "}
              {/* Wrapped with Link to navigate to /login */}
              <Text
                as="span"
                color="teal.400"
                fontWeight="bold"
                cursor="pointer"
              >
                Login
              </Text>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default UserCreation;
