import { useEffect, useState } from "react";
import MainPage from "./MainPage";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./auth/AuthContext";
import { ChatProvider } from "./utils/ChatContext";

const App = () => {
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BACKEND_URL + "/api/health"
        );
        if (response.ok) {
          setServerReady(true);
        } else {
          setTimeout(checkServer, 3000);
        }
      } catch (error) {
        setTimeout(checkServer, 3000);
      }
    };
    checkServer();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      {serverReady ? (
        <AuthProvider>
          <ChatProvider>
            <MainPage />
          </ChatProvider>
        </AuthProvider>
      ) : (
        <div className="flex flex-col items-center">
          <div className="loader mb-4" />
          <p className="text-gray-600 text-lg">
            Server is spinning up, please wait...
          </p>
        </div>
      )}
      <ToastContainer
        className="hidden md:block"
        position="bottom-right"
        hideProgressBar={true}
      />
    </div>
  );
};

export default App;
