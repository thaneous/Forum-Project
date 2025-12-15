import "./NavBar.css";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { useContext } from "react";
import { AppContext } from "../../store/app.context";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Spacer,
  Image,
} from "@chakra-ui/react";
import KokoLogo from "../../../public/logo-nav.png";
import { isAdmin } from "../../services/users.service";
import SearchBar from "../Searchbar/Searchbar";

/**
 * Component for the navigation bar.
 * @component
 * @example
 * return (
 *   <Navbar />
 * )
 * @author Nikolay Kodzheykov
 */
export default function Navbar() {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  /**
   * Logs out the current user and updates the app state.
   */
  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return (
    <>
      <Flex p={6} bg="#0d0f12" position="sticky" top={0} zIndex={100}>
        <Link size="md" to="/" colorScheme="teal">
          <Image src={KokoLogo} alt="Logo" w="100%" />
        </Link>
        <Spacer />
        {user ? (
          <>
            <SearchBar />
            <Button mr="5" as={Link} to="/profile/create-a-post">
              Create Post
            </Button>

            {user && isAdmin(user.uid) && (
              <Button mr="5" as={Link} to="/admin" colorScheme="teal">
                Admin Panel
              </Button>
            )}

            <Menu>
              <MenuButton as={Button} size="md" colorScheme="teal">
                Profile
              </MenuButton>
              <MenuList>
                {userData && (
                  <>
                    <MenuItem
                      as={Link}
                      to={`/profile/${userData.handle}/posts`}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem as={Link} to="/profile/details">
                      Account Details
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={logout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </>
        ) : (
          <>
            <Button mx={5} size="md" as={Link} to="/login" colorScheme="teal">
              Login
            </Button>
            <Button size="md" as={Link} to="/signup" colorScheme="teal">
              Register
            </Button>
          </>
        )}
      </Flex>
    </>
  );
}
