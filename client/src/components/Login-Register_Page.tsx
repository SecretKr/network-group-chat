import React, { useState } from "react";
import axios from "axios";
import { AxiosError } from "axios";

interface LoginRegisterPageProps {
  setUsername: (username: string) => void;
  username: string;
  handleJoin: () => void;
}

type Mode = "Register" | "Login";

export function LoginRegisterPage({
  setUsername,
  username,
  handleJoin,
}: LoginRegisterPageProps) {
  const [mode, setMode] = useState<Mode>("Register");
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = (mode == "Register") ? "http://localhost:3000/api/v1/auth/register" : "http://localhost:3000/api/v1/auth/login";
    try {
      const response = await axios.post(url, formData);
      if (mode == "Register") {
        // Save token to localStorage
        localStorage.setItem("token", response.data.token);
        console.log("Login successful!");
      } else {
        console.log("Registered successfully! You can now log in.");
        setMode("Login");
      }
    } catch (err) {
      console.log("There is an error occured.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      
      {mode === 'Register' ? (
        <div>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleJoin}
            className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary-dark mt-2 transition"
          >
            Register
          </button>
        </div>
      ) : (
        <div>
        </div>
      )}
      
      <div className="text-center mt-4">
        <p>
          {mode === 'Register'
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            onClick={() => mode === 'Register' ? setMode('Login') : setMode('Register')}
            className="text-blue-500 underline"
          >
            {mode === 'Register' ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    
    </div>
  );
}
