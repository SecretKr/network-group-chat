import { useState } from "react";
import { postApiV1AuthLogin, postApiV1AuthRegister } from "../generated/api";
import { toast } from "react-toastify";
import { UserData } from "../auth/auth";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const [mode, setMode] = useState("login");
  const [inputName, setInputName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleButtonClick = async () => {
    if (mode === "login") {
      const { response, data } = await postApiV1AuthLogin({
        body: {
          username: username,
          password: password,
        } as any,
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Invalid username or password");
          return;
        }
        toast.error("Something went wrong");
        return;
      }

      login(data as UserData);
      toast.success("Login successful!");
    } else {
      const { response, data } = await postApiV1AuthRegister({
        body: {
          nickname: inputName,
          username: username,
          password: password,
        } as any,
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Invalid username or password");
          return;
        }
        toast.error("Something went wrong");
        return;
      }

      login(data as UserData);
      toast.success("Registration successful!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 flex flex-col gap-2 w-80">
      <h2 className="text-2xl font-bold text-center mb-2">
        {mode === "login" ? "Login" : "Register"}
      </h2>
      {mode === "register" && (
        <input
          type="text"
          placeholder="Enter nickname"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      )}
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      <button
        onClick={handleButtonClick}
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary-dark transition"
      >
        {mode === "login" ? "Login" : "Register"}
      </button>
      <p
        className="text-center text-sm text-gray-500 cursor-pointer"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login"
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </p>
    </div>
  );
}
