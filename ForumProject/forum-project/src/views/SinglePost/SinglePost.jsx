import { useState, useEffect, useContext } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  Divider,
  Input,
  Button,
  IconButton,
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Flex,
} from "@chakra-ui/react";
import { AppContext } from "../../store/app.context";
import {
  getPostData,
  updatePostData,
  deletePostForSinglePost,
} from "../../services/post.service";
import { createComment, getAllComments } from "../../services/comments.service";
import { usersBookmarks } from "../../services/users.service";
import Login from "../Login/Login";
import Vote from "../Vote/Vote";

function SinglePost() {
  const location = useLocation();
  const { idPost } = location.state || {};
  const [post, setPost] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [allComments, setAllComments] = useState([]);
  const { userData } = useContext(AppContext);
  const [comment, setComment] = useState({ content: "" });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedPost, setEditedPost] = useState({ title: "", content: "" });

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => setIsEditOpen(false);

  if (!idPost) return <Navigate to="/*" />;

  const isClickedBookmark = async () => {
    if (!userData) {
      openLogin();
      return;
    }
    try {
      const updatedBookmarks = await usersBookmarks(userData.handle, idPost);
      setIsBookmarked(updatedBookmarks.includes(idPost));
    } catch (error) {
      console.error("Failed to update bookmarks:", error);
    }
  };

  const handleUpdateValue = (key, value) => {
    setComment({ ...comment, [key]: value });
  };

  const handleCreateComment = async () => {
    if (!userData) {
      openLogin();
      return;
    }
    if (!comment.content) return alert("Please fill in all fields");
    try {
      const newComment = {
        author: userData.handle,
        content: comment.content,
        createdOn: new Date().toString(),
      };
      await createComment(
        userData.handle,
        comment.content,
        idPost,
        userData.uid
      );
      setComment({ content: "" });
      setAllComments([newComment, ...allComments]);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditPost = async () => {
    if (!userData) {
      openLogin();
      return;
    }
    try {
      await updatePostData(idPost, editedPost.title, editedPost.content);
      setPost({ ...post, ...editedPost });
      closeEdit();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPostData(idPost);
      setPost(data);
      setEditedPost({ title: data.title, content: data.content });
    };
    fetchPost();
  }, [idPost]);

  useEffect(() => {
    getAllComments(idPost)
      .then(setAllComments)
      .catch((error) => alert(error.message));
  }, [idPost]);

  if (!post) return <div>Loading...</div>;

  return (
    <>
      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={closeLogin} isCentered>
        <ModalContent bg="gray.900" color="white">
          <ModalCloseButton />
          <Login />
        </ModalContent>
      </Modal>

      {/* Edit Post Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEdit} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={editedPost.title}
              onChange={(e) =>
                setEditedPost({ ...editedPost, title: e.target.value })
              }
              placeholder="Title"
              mb={3}
            />
            <Input
              value={editedPost.content}
              onChange={(e) =>
                setEditedPost({ ...editedPost, content: e.target.value })
              }
              placeholder="Content"
              mb={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditPost}>
              Save
            </Button>
            <Button variant="ghost" onClick={closeEdit}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Post Container */}
      <Container
        display="flex"
        flexDirection="row"
        maxW="container.md"
        mt={10}
        py={5}
      >
        {/* Buttons (Vote, Comment, Bookmark) on the Left */}
        <Flex flexDirection="column" align="center" gap={4} mr={5}>
          <Vote idPost={idPost} openLogin={openLogin} />

          {/* Bookmark Button */}
          <IconButton
            size="sm"
            onClick={isClickedBookmark}
            colorScheme={isBookmarked ? "yellow" : "gray"}
            icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            aria-label="Bookmark"
            _hover={{ transform: "scale(1.1)" }}
          />
        </Flex>

        {/* Post Details on the Right */}
        <Box
          p={6}
          shadow="lg"
          borderWidth="1px"
          borderRadius="lg"
          bg="gray.800"
          color="white"
          flex="1"
          justifyContent="center"
        >
          <Flex display="flex" flexDirection="row" align="start" spacing={4}>
            <Box display="flex" flexDirection="column">
              <Heading size="md" color="teal.400">
                <Link to={`/profile/${post.author}/posts`}>{post.author}</Link>
              </Heading>
              <Heading size="lg">{post.title}</Heading>
              <Divider borderColor="gray.600" />
              <Text fontSize="md">{post.content}</Text>
              <Text fontSize="sm" color="gray.400">
                {new Date(post.createdOn).toLocaleString()}
              </Text>
            </Box>
          </Flex>

          {/* Comment Input */}
          <Flex mt={5} w="full">
            <Input
              value={comment.content}
              onChange={(e) => handleUpdateValue("content", e.target.value)}
              placeholder="Share your thoughts..."
              borderRightRadius="none"
              color="white"
              bg="gray.700"
              _placeholder={{ color: "gray.400" }}
              variant="outline"
              flex="1"
            />
            <Button
              borderLeftRadius="none"
              colorScheme="teal"
              onClick={handleCreateComment}
              isDisabled={!post}
            >
              Comment
            </Button>
          </Flex>

          {/* Comments Section */}
          <Box mt={5}>
            <Heading size="md" color="teal.400">
              Comments
            </Heading>
            {allComments.length > 0 ? (
              <VStack spacing={3} mt={3} align="stretch">
                {allComments
                  .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
                  .map((comment, index) => (
                    <Box
                      key={index}
                      p={3}
                      shadow="md"
                      borderWidth="1px"
                      borderRadius="lg"
                      bg="gray.700"
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="md" color="teal.400">
                          <Link to={`/profile/${comment.author}/posts`}>
                            {comment.author}
                          </Link>
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {new Date(comment.createdOn).toLocaleString()}
                        </Text>
                      </Flex>
                      <Text fontSize="md" mt={2}>
                        {comment.content}
                      </Text>
                    </Box>
                  ))}
              </VStack>
            ) : (
              <Text color="gray.400" mt={3}>
                No comments yet.
              </Text>
            )}
          </Box>
        </Box>
        <Flex flexDirection="column" align="right" gap={4} mr={5}>
          {/* Edit Post Button */}
          {userData && userData.handle === post.author && (
            <>
              <Button colorScheme="blue" mt={4} ml={4} onClick={openEdit}>
                Edit Post
              </Button>
              <Button
                colorScheme="red"
                mt={4}
                ml={4}
                onClick={async () => {
                  await deletePostForSinglePost(idPost, userData.handle);
                  window.location.reload();
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Flex>
      </Container>
    </>
  );
}

export default SinglePost;
