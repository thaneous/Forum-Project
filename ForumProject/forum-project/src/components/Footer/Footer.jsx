import { useEffect, useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/firebase-config";

export default function Footer() {
  const [usersCount, setUsersCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const unsubscribeUsers = onValue(ref(db, "users"), (snapshot) => {
      const users = snapshot.val();
      setUsersCount(Object.keys(users).length);
    });

    const unsubscribePosts = onValue(ref(db, "posts"), (snapshot) => {
      const posts = snapshot.val();
      setPostsCount(Object.keys(posts).length);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
    };
  }, []);

  return (
    <>
      <Box display="grid" gridTemplateRows="1fr auto" minHeight="20vh">
        <Box as="footer" w="100%" bg="#0d0f12" color="white" py={4} px={6}>
          <Flex justify="center" align="center" direction="column">
            <Text fontSize="sm">
              © {new Date().getFullYear()} All rights reserved.
            </Text>
            <Text fontSize="sm" mt={1}>
              Registered Users: {usersCount}
              <br />
              Posts Count: {postsCount}
            </Text>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
