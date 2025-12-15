import { AppContext } from "../../store/app.context";
import { useContext } from "react";
import AllPosts from "../AllPosts/AllPosts";
import HomeAnonymous from "../../components/HomeAnonymous/HomeAnonymous";
export default function Home() {
  const { userData } = useContext(AppContext);

  return (
    <>
      <h1
        style={{
          margin: "20px", // Corrected marginTop
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#38B2AC", // Teal color
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "2px",
          padding: "10px",
          borderBottom: "2px solid #2D3748", // Dark gray border
        }}
      >
        Hooked on React
      </h1>
      {userData ? (
        <>
          <h2 style={{ color: "white" }}>Welcome, {userData.handle} </h2>
          <AllPosts />
        </>
      ) : (
        <HomeAnonymous />
      )}
    </>
  );
}
