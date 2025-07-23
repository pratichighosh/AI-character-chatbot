// App.jsx - Updated with Character Support
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import { UserData } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import { LoadingBig } from "./components/Loading";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, isAuth, loading } = UserData();

  return (
    <>
      {loading ? (
        <LoadingBig />
      ) : (
        <BrowserRouter>
          {/* Wrap authenticated routes with ChatProvider */}
          {isAuth ? (
            <ChatProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Home />} />
                <Route path="/verify" element={<Home />} />
                {/* Add any other authenticated routes here */}
              </Routes>
            </ChatProvider>
          ) : (
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<Verify />} />
            </Routes>
          )}
        </BrowserRouter>
      )}
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#4CAF50',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#f44336',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;