import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../store/app.context";
import {
  searchUsers as searchUsersApi,
  getAllUsers,
  assignAdminRole,
  removeAdminRole,
  isAdmin,
  blockUser,
  unblockUser,
} from "../../services/users.service";
import { getAllPosts, deletePost } from "../../services/post.service";
import {
  Box,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Select,
  Spinner,
} from "@chakra-ui/react";

/**
 * AdminPanel component for managing users and their roles
 * @component
 * @author Atanas Zaykov
 */
function AdminPanel() {
  const { user } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("users"); // New state for search type
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [postSearchTerm, setPostSearchTerm] = useState("");
  const [postSort, setPostSort] = useState({
    field: "createdOn",
    order: "desc",
  });

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      try {
        const adminStatus = await isAdmin(user.uid);
        if (!adminStatus) {
          toast({
            title: "Access Denied",
            description: "You do not have admin privileges",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        const allUsers = await getAllUsers(user.uid);
        setUsers(allUsers);
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    checkAdminAndLoadUsers();
  }, [user.uid, toast]);

  useEffect(() => {
    const performSearch = async () => {
      if (!loading) {
        try {
          if (!searchTerm.trim()) {
            if (searchType === "users") {
              const allUsers = await getAllUsers(user.uid);
              setUsers(allUsers);
            } else {
              const allPosts = await getAllPosts();
              setPosts(allPosts);
            }
            return;
          }
          if (searchType === "users") {
            const results = await searchUsersApi(user.uid, searchTerm);
            setUsers(results);
          } else {
            const allPosts = await getAllPosts();
            const filteredPosts = allPosts.filter(
              (post) =>
                post.title.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
                post.author.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(postSearchTerm.toLowerCase())
            );
            setPosts(filteredPosts);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, postSearchTerm, searchType, user.uid, loading, toast]);

  const handleRoleToggle = async (targetHandle, currentRole) => {
    try {
      if (currentRole === "admin") {
        await removeAdminRole(user.uid, targetHandle);
      } else {
        await assignAdminRole(user.uid, targetHandle);
      }
      const updatedUsers = await getAllUsers(user.uid);
      setUsers(updatedUsers);
      toast({
        title: "Success",
        description: `Role updated for user ${targetHandle}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBlockToggle = async (userData) => {
    if (userData.status === "blocked") {
      try {
        await unblockUser(user.uid, userData.handle);
        const updatedUsers = await getAllUsers(user.uid);
        setUsers(updatedUsers);
        toast({
          title: "Success",
          description: `User ${userData.handle} has been unblocked`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      setSelectedUser(userData);
      onOpen();
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(user.uid, postId);
      setPosts(posts.filter((post) => post.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBlockConfirm = async () => {
    try {
      await blockUser(user.uid, selectedUser.handle, blockReason);
      const updatedUsers = await getAllUsers(user.uid);
      setUsers(updatedUsers);
      toast({
        title: "Success",
        description: `User ${selectedUser.handle} has been blocked`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setBlockReason("");
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getFilteredAndSortedPosts = () => {
    let filteredPosts = [...posts];

    // Apply search filter
    if (postSearchTerm) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(postSearchTerm.toLowerCase())
      );
    }
    // Apply sorting
    filteredPosts.sort((a, b) => {
      let aValue = a[postSort.field];
      let bValue = b[postSort.field];

      if (postSort.order === "desc") {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filteredPosts;
  };

  if (loading) {
    return <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="50vh"
        >
          <Spinner size="xl" color="blue.500" />
        </Box>
  }

  return (
    <Box p={5}>
      <Heading mb={4} textAlign="center" color="white">
        Admin Dashboard
      </Heading>
      <Tabs isFitted variant="enclosed" onChange={(index) => setSearchType(index === 0 ? "users" : "posts")}>
        <TabList mb="1em">
          <Tab
            color="white"
            _selected={{ color: "teal.500", bg: "whiteAlpha.200" }}
          >
            Users
          </Tab>
          <Tab
            color="white"
            _selected={{ color: "teal.500", bg: "whiteAlpha.200" }}
          >
            Posts
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex mb={5}>
              <Input
                placeholder="Search users by handle, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                color="white"
                bg="whiteAlpha.100"
                _placeholder={{ color: "whiteAlpha.700" }}
                _hover={{ bg: "whiteAlpha.200" }}
                _focus={{ bg: "whiteAlpha.200", borderColor: "teal.500" }}
              />
            </Flex>
            {users.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="teal.300">Handle</Th>
                    <Th color="teal.300">Email</Th>
                    <Th color="teal.300">Name</Th>
                    <Th color="teal.300">Status</Th>
                    <Th color="teal.300">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((userData) => (
                    <Tr key={userData.handle} _hover={{ bg: "whiteAlpha.100" }}>
                      <Td color="white">{userData.handle}</Td>
                      <Td color="white">{userData.email}</Td>
                      <Td color="white">
                        {`${userData.firstName || ""} ${
                          userData.lastName || ""
                        }`}
                      </Td>
                      <Td>
                        <Text
                          color={
                            userData.status === "blocked"
                              ? "red.300"
                              : userData.role === "admin"
                              ? "teal.300"
                              : "white"
                          }
                          fontWeight={
                            userData.role === "admin" ? "bold" : "normal"
                          }
                        >
                          {userData.status === "blocked"
                            ? "Blocked"
                            : userData.role === "admin"
                            ? "Admin"
                            : "User"}
                        </Text>
                      </Td>
                      <Td>
                        <Flex gap={2}>
                          <Button
                            onClick={() =>
                              handleRoleToggle(userData.handle, userData.role)
                            }
                            colorScheme={
                              userData.role === "admin" ? "red" : "teal"
                            }
                            size="sm"
                            _hover={{
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }}
                            transition="all 0.2s"
                          >
                            {userData.role === "admin"
                              ? "Remove Admin"
                              : "Make Admin"}
                          </Button>
                          <Button
                            onClick={() => handleBlockToggle(userData)}
                            colorScheme={
                              userData.status === "blocked" ? "green" : "red"
                            }
                            size="sm"
                            _hover={{
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }}
                            transition="all 0.2s"
                          >
                            {userData.status === "blocked"
                              ? "Unblock"
                              : "Block"}
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text color="white" fontSize="lg" textAlign="center">
                No users found matching your search
              </Text>
            )}
          </TabPanel>
          <TabPanel>
            <Flex mb={5} gap={4}>
              <Input
                placeholder="Search posts by title, author or content..."
                value={postSearchTerm}
                onChange={(e) => setPostSearchTerm(e.target.value)}
                color="white"
                bg="whiteAlpha.100"
                _placeholder={{ color: "whiteAlpha.700" }}
                _hover={{ bg: "whiteAlpha.200" }}
                _focus={{ bg: "whiteAlpha.200", borderColor: "teal.500" }}
                flex="2"
              />
              <Select
                value={`${postSort.field}-${postSort.order}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setPostSort({ field, order });
                }}
                color="white"
                bg="whiteAlpha.100"
                _hover={{ bg: "whiteAlpha.200" }}
                flex="1"
              >
                <option value="createdOn-desc">Newest First</option>
                <option value="createdOn-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author-asc">Author (A-Z)</option>
                <option value="author-desc">Author (Z-A)</option>
              </Select>
            </Flex>

            {getFilteredAndSortedPosts().length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="teal.300">Title</Th>
                    <Th color="teal.300">Author</Th>
                    <Th color="teal.300">Created On</Th>
                    <Th color="teal.300">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {getFilteredAndSortedPosts().map((post) => (
                    <Tr key={post.id} _hover={{ bg: "whiteAlpha.100" }}>
                      <Td color="white">{post.title}</Td>
                      <Td color="white">{post.author}</Td>
                      <Td color="white">
                        {new Date(post.createdOn).toLocaleDateString()}
                      </Td>
                      <Td>
                        <Button
                          onClick={() => handleDeletePost(post.id)}
                          colorScheme="red"
                          size="sm"
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          transition="all 0.2s"
                        >
                          Delete Post
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text color="white" fontSize="lg" textAlign="center">
                No posts found matching your search
              </Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Block User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to block {selectedUser?.handle}?
            </Text>
            <Textarea
              placeholder="Enter reason for blocking..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleBlockConfirm}
              isDisabled={!blockReason.trim()}
            >
              Block User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AdminPanel;
