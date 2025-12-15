import { AppContext } from "../../store/app.context";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth.service";
import {
  createUserHandle,
  getUserByHandle,
  getUserByEmail,
} from "../../services/users.service";
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

export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    handle: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({
    handle: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [DataCheck, setDataCheck] = useState("");
  const navigate = useNavigate();
  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;
    let newError = {
      handle: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    };

    if (!user.email) {
      newError.email = "Please enter an email address";
      valid = false;
    } else if (!emailRegex.test(user.email)) {
      newError.email = "Please enter a valid email address";
      valid = false;
    }

    if (!user.password) {
      newError.password = "Please enter a password";
      valid = false;
    }

    if (!user.firstName) {
      newError.firstName = "First name is required";
      valid = false;
    } else if (user.firstName.length < 4 || user.firstName.length > 32) {
      newError.firstName = "First name must be between 4 and 32 characters";
      valid = false;
    }

    if (!user.lastName) {
      newError.lastName = "Last name is required";
      valid = false;
    } else if (user.lastName.length < 4 || user.lastName.length > 32) {
      newError.lastName = "Last name must be between 4 and 32 characters";
      valid = false;
    }

    if (!user.handle) {
      newError.handle = "Username is required";
      valid = false;
    }

    setErrors(newError);
    return valid;
  };
  const register = () => {
    if (!validateFields()) {
      return;
    }

    Promise.all([getUserByEmail(user.email), getUserByHandle(user.handle)])
      .then(([emailUser, handleUser]) => {
        if (emailUser) {
          throw new Error(
            `Email ${user.email} already registered! Try logging in.`
          );
        }
        if (handleUser) {
          throw new Error(`Username with handle ${user.handle} already exists`);
        }
        return registerUser(user.email, user.password);
      })
      .then((userCredential) => {
        return createUserHandle(
          user.handle,
          userCredential.user.uid,
          user.email,
          user.firstName,
          user.lastName
        ).then(() => {
          setAppState({
            user: userCredential.user,
            userData: null,
          });
          navigate("/");
        });
      })
      .catch((error) => {
        setDataCheck(error.message);
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
      {DataCheck !== "" && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{DataCheck}</AlertDescription>
        </Alert>
      )}

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Box w="md" p={50} borderWidth={1} borderRadius="lg" bg="white">
          <Heading as="h3" size="lg" mb={6}>
            Register
          </Heading>
          <FormControl id="firstName" mb={4} isInvalid={errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input
              placeholder="Enter your first name"
              value={user.firstName}
              onChange={updateUser("firstName")}
              type="text"
              sx={{
                "::placeholder": {
                  color: "gray.500",
                },
              }}
            />
            {errors.firstName && (
              <FormErrorMessage>{errors.firstName}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="lastName" mb={4} isInvalid={errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder="Enter your last name"
              value={user.lastName}
              onChange={updateUser("lastName")}
              type="text"
              sx={{
                "::placeholder": {
                  color: "gray.500",
                },
              }}
            />
            {errors.lastName && (
              <FormErrorMessage>{errors.lastName}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="handle" mb={4} isInvalid={errors.handle}>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="Enter your username"
              value={user.handle}
              onChange={updateUser("handle")}
              type="text"
              sx={{
                "::placeholder": {
                  color: "gray.500",
                },
              }}
            />
            {errors.handle && (
              <FormErrorMessage>{errors.handle}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="email" mb={4} isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Enter your email address"
              value={user.email}
              onChange={updateUser("email")}
              type="email"
              sx={{
                "::placeholder": {
                  color: "gray.500",
                },
              }}
            />
            {errors.email && (
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="password" mb={4} isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Enter your password"
              value={user.password}
              onChange={updateUser("password")}
              type="password"
              sx={{
                "::placeholder": {
                  color: "gray.500",
                },
              }}
            />
            {errors.password && (
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            )}
          </FormControl>
          <Box textAlign="center">
            <Button colorScheme="teal" m="5" onClick={register}>
              Register
            </Button>
            <Text>
              Already have an account?
              <Text color="purple">
                <Link to="/login"> Login</Link>
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
}
