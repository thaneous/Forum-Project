import { Tabs, TabList, Tab } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

const ProfileTabs = ({ userData }) => {
  const location = useLocation();

  if (!userData) {
    return null; // or a loading spinner
  }

  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="green"
      index={getTabIndex(location.pathname, userData.handle)}
    >
      <TabList>
        <Tab as={Link} to={`/profile/${userData.handle}/posts`}>
          Posts
        </Tab>
        <Tab as={Link} to={`/profile/${userData.handle}/comments`}>
          Comments
        </Tab>
        <Tab as={Link} to={`/profile/${userData.handle}/bookmarks`}>
          Bookmarks
        </Tab>
        <Tab as={Link} to={`/profile/${userData.handle}/upvotes`}>
          Upvoted
        </Tab>
        <Tab as={Link} to={`/profile/${userData.handle}/downvotes`}>
          Downvoted
        </Tab>
      </TabList>
    </Tabs>
  );
};

const getTabIndex = (pathname, handle) => {
  const routes = [
    `/profile/${handle}/posts`,
    `/profile/${handle}/comments`,
    `/profile/${handle}/bookmarks`,
    `/profile/${handle}/upvotes`,
    `/profile/${handle}/downvotes`,
  ];

  const index = routes.findIndex((route) => pathname.startsWith(route));
  return index !== -1 ? index : 0;
};

export default ProfileTabs;
