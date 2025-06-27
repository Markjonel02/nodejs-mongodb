import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const UserCreation = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    console.log("--- handleSignUp called ---");
    console.log("firstName:", firstName);
    console.log("lastName:", lastName);
    console.log("username:", username);
    console.log("email:", email);
    console.log("password:", password ? "******" : "EMPTY");
    console.log("confirmPassword:", confirmPassword ? "******" : "EMPTY");
    console.log("-------------------------");

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

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/usercreate",
        {
          firstName,
          lastName,
          username,
          email,
          password,
        }
      );

      const data = response.data;

      // Assuming your backend's /api/user/usercreate now returns a 'token' field
      // upon successful registration, similar to a login endpoint.
      if (data.token) {
        localStorage.setItem("jwt_token", data.token); // Store the JWT in localStorage
        /*  console.log("JWT Token stored:", data.token); */
      }

      toast({
        title: "Registration Successful!",
        description:
          data.message ||
          "Your account has been created and you are now logged in.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Instead of navigating to login, navigate to a protected dashboard or home page
      navigate("/dashboard"); // Or wherever your protected route is
    } catch (error) {
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
      setLoading(false);
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

          <Input
            placeholder="Username"
            type="text"
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            placeholder="Email Address"
            type="email"
            variant="filled"
            size="lg"
            bg={useColorModeValue("gray.100", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                onClick={() => setShowPassword((show) => !show)}
                aria-label="Toggle password visibility"
              />
            </InputRightElement>
          </InputGroup>

          <InputGroup>
            <Input
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
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
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                onClick={() => setShowConfirmPassword((show) => !show)}
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
