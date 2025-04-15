import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getUserFromCookie,
  removeUserCookie,
  saveUserToCookie,
  UserData,
} from "./auth";

interface AuthContextType {
  uid: string;
  setUid: (uid: string) => void;
  name: string;
  setName: (name: string) => void;
  token: string;
  loggedIn: boolean;
  login: (user: UserData) => void;
  logout: () => void;
  getUserFromCookies: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [uid, setUid] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const getUserFromCookies = useCallback(() => {
    const user = getUserFromCookie();
    if (user?.id) {
      setUid(user.id);
      setName(user.nickname);
      setLoggedIn(true);
      //socket.emit("setUsername", user._id); TODO -------------------------------------------------------------------------
    }
  }, []);

  useEffect(() => {
    getUserFromCookies();
  }, [getUserFromCookies]);

  const login = (user: UserData) => {
    setUid(user.id);
    setName(user.nickname);
    setToken(user.token);
    setLoggedIn(true);
    saveUserToCookie(user);

    //
    console.log("from AuthContext, in login function, name: " + user.nickname);
    //
  };

  const logout = () => {
    setUid("");
    setName("");
    setLoggedIn(false);
    removeUserCookie();
  };

  return (
    <AuthContext.Provider
      value={{
        uid,
        setUid,
        name,
        setName,
        token,
        loggedIn,
        login,
        logout,
        getUserFromCookies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
