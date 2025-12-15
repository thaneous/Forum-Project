import { useState, useEffect } from "react";
import { getUserData, updateUserProfile } from "../../services/users.service";
import { auth } from "../../config/firebase-config"; // Fixed import path
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"; // Added Chakra UI components

function Details() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userData = await getUserData(auth.currentUser.uid);
          if (userData) {
            const userKey = Object.keys(userData)[0];
            setUser({ ...userData[userKey], handle: userKey });
            setFirstName(userData[userKey].firstName || "");
            setLastName(userData[userKey].lastName || "");
            setProfilePhoto(userData[userKey].profilePhoto || "");
          }
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) return;

    if (firstName.length < 4 || firstName.length > 32) {
      setError("First name must be between 4 and 32 characters.");
      return;
    }
    if (lastName.length < 4 || lastName.length > 32) {
      setError("Last name must be between 4 and 32 characters.");
      return;
    }

    try {
      await updateUserProfile(user.handle, {
        firstName,
        lastName,
        profilePhoto,
      });
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading)
    return (
      <Box p={4}>
        <Text>Loading...</Text>
      </Box>
    );

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <Heading mb={6}>Profile Details</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4} isReadOnly>
          <FormLabel>Username (Cannot be changed)</FormLabel>
          <Input value={user?.handle || ""} disabled />
        </FormControl>{" "}
        <FormControl mb={4} isReadOnly>
          <FormLabel>Email (Cannot be changed)</FormLabel>
          <Input value={user?.email || ""} disabled />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>First Name</FormLabel>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Last Name</FormLabel>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
          />
        </FormControl>
        {error && (
          <Text color="red.500" mb={4}>
            {error}
          </Text>
        )}
        {success && (
          <Text color="green.500" mb={4}>
            {success}
          </Text>
        )}
        <Button type="submit" colorScheme="teal" w="full">
          Update Profile
        </Button>
      </form>

      {profilePhoto && (
        <Box mt={4} textAlign="center">
          <img
            src={profilePhoto}
            alt="Profile Preview"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              margin: "0 auto",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default Details;
