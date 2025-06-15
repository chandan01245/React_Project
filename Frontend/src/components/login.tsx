import axios, { AxiosError } from "axios";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaFingerprint } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import logo from "./../assets/logo.png";
import wallpaper from "./../assets/Wallpaper.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateForm = (): boolean => {
    console.log("Validating form...");
    if (!email || !password) {
      console.warn("Validation failed: Missing email or password");
      setError("Please fill in all fields");
      return false;
    }
    if (!email.includes("@")) {
      console.warn("Validation failed: Invalid email format");
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      console.warn("Validation failed: Password too short");
      setError("Password must be at least 6 characters long");
      return false;
    }
    console.log("Form is valid.");
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/app/login", {
        email,
        password
      },
      { 
        withCredentials: true 
      });

  

      const user_group = response.data.user_group;
      const twofa_required = response.data["2fa_required"];
  

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_group", user_group);

      if (twofa_required) {
      
        navigate("/2fa", { state: { email } });
      } else {
   
        navigate("/dashboard");
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error("Login request failed:", error.message);
      console.error("Full error object:", error);

      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Status:", error.response.status);
        if (error.response.status === 401) {
          setError("Invalid credentials");
        } else if (error.response.status === 403) {
          setError("CORS issue or forbidden access");
        } else {
          setError("An error occurred. Please try again later.");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response from server. Is Flask running?");
      } else {
        console.error("Error setting up request:", error.message);
        setError("Could not initiate request. Check network or config.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-white bg-opacity-90 rounded-lg shadow-lg p-10 flex flex-col items-center"
      >
        <div className="flex items-center gap-4 mb-8 w-full justify-center">
          <img src={logo} alt="logo" className="w-20" />
          <span
            className="text-2xl font-bold text-[#2b3a4a] tracking-wide"
            style={{ letterSpacing: "1px" }}
          >
            Acceleron <span className="text-[#6fa3c7] font-semibold">HCI</span>
          </span>
        </div>
        {error && (
          <div className="w-full p-2 mb-2 bg-red-100 text-red-600 text-sm rounded text-center">
            {error}
          </div>
        )}
        <div className="w-full flex flex-col gap-4 mb-6">
          <div className="w-full flex items-center bg-gray-100 text-gray-700 p-2 rounded-xl">
            <MdAlternateEmail className="text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Email account"
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base px-2"
              disabled={isLoading}
            />
          </div>
          <div className="w-full relative flex items-center bg-gray-100 text-gray-700 p-2 rounded-xl">
            <FaFingerprint className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base px-2"
              disabled={isLoading}
            />
            {showPassword ? (
              <FaEyeSlash
                className="absolute right-5 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <FaEye
                className="absolute right-5 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-[#6fa3c7] text-white rounded hover:bg-[#5b8bb2] transition-colors font-semibold text-lg disabled:opacity-60"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;
