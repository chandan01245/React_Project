import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import { FaEye, FaEyeSlash, FaFingerprint, FaGoogle } from "react-icons/fa";
import { FaMicrosoft } from "react-icons/fa6";
import { ImFacebook2 } from "react-icons/im";
import { MdAlternateEmail } from "react-icons/md";
import logo from "./../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/app/login", {
        email,
        password,
      });

      const { user_group } = response.data;
      localStorage.setItem("user_role", user_group);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed.");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-white/10 backdrop-blur-md text-white flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
        <img src={logo} alt="logo" className="w-12 md:w-14" />
        <h1 className="text-lg md:text-xl font-semibold">Welcome back</h1>

        <p className="text-xs md:text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <span className="text-blue-500 cursor-pointer">Sign up</span>
        </p>

        <div className="w-full flex flex-col gap-3">
          <div className="w-full flex items-center bg-gray-800 text-white p-2 rounded-xl">
            <MdAlternateEmail />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email account"
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base px-2"
            />
          </div>
          <div className="w-full relative flex items-center bg-gray-800 text-white p-2 rounded-xl">
            <FaFingerprint />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base px-2"
            />
            {showPassword ? (
              <FaEyeSlash
                className="absolute right-5 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <FaEye
                className="absolute right-5 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full p-2 bg-blue-500 rounded-xl mt-3 hover:bg-blue-600 text-white text-sm md:text-base"
        >
          Login
        </button>

        <div className="w-full text-center my-3 text-sm text-gray-400">
          or continue with
        </div>

        <div className="w-full flex justify-center items-center gap-4">
          <div className="p-2 bg-slate-700 text-white cursor-pointer rounded-xl hover:bg-slate-800">
            <FaGoogle className="text-lg md:text-xl" />
          </div>
          <div className="p-2 bg-slate-700 text-white cursor-pointer rounded-xl hover:bg-slate-800">
            <FaMicrosoft className="text-lg md:text-xl" />
          </div>
          <div className="p-2 bg-slate-700 text-white cursor-pointer rounded-xl hover:bg-slate-800">
            <ImFacebook2 className="text-lg md:text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
