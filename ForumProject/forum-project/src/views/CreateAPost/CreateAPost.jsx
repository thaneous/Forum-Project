import {
  Container,
  Text,
  Button,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Box,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import { createpost } from "../../services/post.service";
import { AppContext } from "../../store/app.context";
import { useNavigate } from "react-router-dom";
import { isUserBlocked } from "../../services/users.service";

function CreateAPost() {
  const { userData } = useContext(AppContext);
  const [post, setPost] = useState({ title: "", content: "" });
  const [errors, setErrors] = useState({ title: "", content: "" });
  const [alertInfo, setAlertInfo] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfBlocked = async () => {
      const blocked = await isUserBlocked(userData.handle);
      setIsBlocked(blocked);
    };
    checkIfBlocked();
  }, [userData.handle]);

  const validateFields = () => {
    let valid = true;
    let newErrors = { title: "", content: "" };

    if (post.title.length < 16 || post.title.length > 64) {
      newErrors.title = "Title must be between 16 and 64 characters.";
      valid = false;
    }
    if (post.content.length < 32 || post.content.length > 8192) {
      newErrors.content = "Content must be between 32 and 8192 characters.";
      valid = false;
    }
    if (isBlocked) {
      setAlertInfo({
        message: "You are blocked from creating posts",
        type: "error",
        show: true,
      });
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleUpdateValue = (key, value) => {
    setPost({ ...post, [key]: value });
  };

  const handleCreatePost = async () => {
    if (!validateFields()) return;

    try {
      await createpost(
        userData.handle,
        post.title,
        post.content,
        userData.uid,
        userData.handle
      );
      setPost({ title: "", content: "" });
      navigate(`/profile/${userData.handle}/posts`);
    } catch (error) {
      console.error(error);
      setAlertInfo({
        message: "Failed to create post",
        type: "error",
        show: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="3xl" fontWeight="bold" textAlign="center">
          Create A Post
        </Text>

        {alertInfo.show && (
          <Alert status={alertInfo.type} borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>
                {alertInfo.type === "error" ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
            </Box>
          </Alert>
        )}

        <FormControl isInvalid={!!errors.title}>
          <FormLabel>
            Title <span style={{ color: "red" }}>*</span>
          </FormLabel>
          <Textarea
            value={post.title}
            placeholder="Enter a catchy title..."
            onChange={(e) => handleUpdateValue("title", e.target.value)}
            size="md"
            resize="none"
            color="white"
            borderColor="gray.600"
            maxLength={64}
          />
          <FormErrorMessage>{errors.title}</FormErrorMessage>
          <Text textAlign="right">{post.title.length}/64</Text>
        </FormControl>

        <FormControl isInvalid={!!errors.content}>
          <FormLabel>
            Content <span style={{ color: "red" }}>*</span>
          </FormLabel>
          <Textarea
            value={post.content}
            placeholder="Write something interesting..."
            onChange={(e) => handleUpdateValue("content", e.target.value)}
            size="md"
            resize="vertical"
            minH="150px"
            color="white"
            borderColor="gray.600"
            maxLength={8192}
          />
          <FormErrorMessage>{errors.content}</FormErrorMessage>
          <Text textAlign="right">{post.content.length}/8192</Text>
        </FormControl>

        <Button
          onClick={handleCreatePost}
          size="lg"
          colorScheme="blue"
          width="100%"
        >
          Post
        </Button>
      </VStack>
    </Container>
  );
}

export default CreateAPost;
