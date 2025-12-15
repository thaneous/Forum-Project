import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home/Home";
import Login from "./views/Login/Login";
import Register from "./views/Register/Register";
import Profile from "./views/Profile/Profile";
import NotFound from "./components/NotFound/NotFound";
import Navbar from "./views/Navbar/Navbar";
import { AppContext } from "./store/app.context";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase-config";
import { getUserData, migrateExistingUsers } from "./services/users.service";
import Authenticated from "./hoc/Authenticated";
import Details from "./views/Details/Details";
import Bookmarks from "./views/Profile/Bookmarks";
import Upvotes from "./views/Profile/Upvotes";
import Downvotes from "./views/Profile/Downvotes";
import Comments from "./views/Profile/Comments";
import Posts from "./views/Profile/Post";
import CreateAPost from "./views/CreateAPost/CreateAPost";
import Footer from "./components/Footer/Footer";
import SinglePost from "./views/SinglePost/SinglePost";
import AdminPanel from "./views/AdminPanel/AdminPanel";
import SearchPage from "./views/Searchbar/SearchPage";

function App() {
  const [appState, setAppState] = useState({
    user: null,
    userData: null,
  });

  const [user] = useAuthState(auth);

  // Handle user migration
  useEffect(() => {
    migrateExistingUsers()
      .then(() => console.log("User migration completed"))
      .catch((error) => console.error("Migration failed:", error));
  }, []);

  // Sync Firebase user with app state
  useEffect(() => {
    if (user && appState.user !== user) {
      setAppState((prevState) => ({
        ...prevState,
        user,
      }));
    }
  }, [user, appState.user]);

  // Fetch user data when user logs in
  useEffect(() => {
    if (user && !appState.userData) {
      getUserData(user.uid)
        .then((data) => {
          if (data) {
            const userData = data[Object.keys(data)[0]];
            setAppState((prevState) => ({
              ...prevState,
              userData,
            }));
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [user, appState.userData]);

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...appState, setAppState }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route
            path="/post/:id"
            element={
              <Authenticated>
                <SinglePost />
              </Authenticated>
            }
          />
          <Route
            path="/profile/:handle/*"
            element={
              <Authenticated>
                <Profile />
              </Authenticated>
            }
          />
          <Route
            path="/search"
            element={
              <Authenticated>
                <SearchPage />
              </Authenticated>
            }
          />
          {appState.userData && (
            <>
              <Route
                path={`/profile/details`}
                element={
                  <Authenticated>
                    <Details />
                  </Authenticated>
                }
              />
              <Route path={`/user/:handle/posts`} element={<Posts />} />
              <Route path="/user/:handle/comments" element={<Comments />} />

              <Route path={`/user/:handle/bookmarks`} element={<Bookmarks />} />
              <Route path={`/user/:handle/upvotes`} element={<Upvotes />} />
              <Route path={`/user/:handle/downvotes`} element={<Downvotes />} />
              <Route
                path="/profile/create-a-post"
                element={
                  <Authenticated>
                    <CreateAPost />
                  </Authenticated>
                }
              />
              <Route
                path="/admin"
                element={
                  <Authenticated>
                    <AdminPanel />
                  </Authenticated>
                }
              />
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App;
