import { AppContext } from "../../store/app.context";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  FormErrorMessage,
  Alert,
  AlertDescription,
  AlertIcon,
} from "@chakra-ui/react";

export default function Login() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const validateFields = () => {
    let valid = true;
    let newErrors = { email: "", password: "" };

    if (!user.email) {
      newErrors.email = "Please enter an email";
      valid = false;
    }

    if (!user.password) {
      newErrors.password = "Please enter a password";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const login = () => {
    if (!validateFields()) {
      return;
    }

    loginUser(user.email, user.password)
      .then((userCredential) => {
        setAppState({
          user: userCredential.user,
          userData: null,
        });
        navigate(location.state?.from.pathname ?? "/");
      })
      .catch((error) => {
        //authentication errors
        let message = "Something went wrong. Please try again.";

        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential"
        ) {
          message = "Invalid email or password";
        } else if (error.code === "auth/too-many-requests") {
          message = "Too many failed attempts. Try again later.";
        }

        setErrorMessage(message);
      });
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  return (
    <>
      {errorMessage && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Box display="flex" justifyContent="center" alignItems="center">
        <Box w="md" p={50} borderWidth={1} borderRadius="lg" bg="white">
          <Heading as="h3" size="lg" mb={6}>
            Login
          </Heading>
          <FormControl id="email" mb={4} isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Enter your email"
              value={user.email}
              onChange={updateUser("email")}
              type="email"
            />
            {errors.email && (
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="password" mb={6} isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Enter your password"
              value={user.password}
              onChange={updateUser("password")}
              type="password"
            />
            {errors.password && (
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            )}
          </FormControl>
          <Button colorScheme="teal" m="5" onClick={login}>
            Login
          </Button>
          <Text>
            Don`t have an account?
            <Text color="purple">
              <Link to="/signup"> Sign up</Link>
            </Text>
          </Text>
        </Box>
      </Box>
    </>
  );
}
