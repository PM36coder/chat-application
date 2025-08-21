
import { useState } from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "./LoadingButton";
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from "../store/AuthContext.jsx";
import API from "../utils/Axios.jsx";
export default function Register() {
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword:""
  });
  const {setUser} = useAuth()
const navigate = useNavigate()
  // const [profile, setProfile] = useState(null); // 🖼️ File input
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e) => {
  //   setProfile(e.target.files[0]);
  // };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
if(form.password !== form.confirmPassword){
  return toast.error("Password doesn't match")
}
    console.log("📦 Submitting form:", form);
setLoading(true)
    try {
      const res = await API.post("/user/register",form, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // for httpOnly cookies
        withCredentials: true
      });

      const data =  res.data;

      
toast.success(data.msg || "Registration Successful")
      setSuccess(data.msg || "Registration successful");
      setForm({
        fullname: "",
        username: "",
        email: "",
        gender: "male",
        password: "",
      });
      setUser(data)
      setLoading(false)
      navigate('/login')
      // setProfile(null);
    } catch (err) {
      const message = err.response?.data?.msg || "Something went wrong. Try again.";
  setError(message);
  toast.error( message)
  setLoading(false)
  setSuccess("");
    }
  };


  return (
    <div
  id="register"
  className="min-h-screen [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] flex items-center justify-center px-4"
>
  <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/10 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-white/20">
    <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6">
      Create Account 📝 On <b className="text-blue-600">ChatGram</b>
    </h2>

    {error && (
      <div className="text-red-400 text-sm text-center mb-2">{error}</div>
    )}
    {success && (
      <div className="text-green-400 text-sm text-center mb-2">
        {success}
      </div>
    )}

    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      encType="multipart/form-data"
    >
      <input
        type="text"
        name="fullname"
        placeholder="Full Name"
        value={form.fullname}
        onChange={handleChange}
        required
        className="rounded-lg p-2 border border-white/30 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
        className="rounded-lg p-2 border border-white/30 text-white  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="rounded-lg p-2 border border-white/30 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        className="rounded-lg p-2 border border-white/30 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      />
    {/* password confirmation */}
       <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
       className="rounded-lg p-2 border border-white/30 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      />

      {/* Gender */}
<div className="text-white text-sm font-medium mb-1">Gender:</div>
<div className="flex gap-6 mb-4">
  {/* Male */}
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="radio"
      name="gender"
      value="male"
      checked={form.gender === "male"}
      onChange={handleChange}
      className="hidden peer"
    />
    <div className="px-4 py-2 rounded-full border border-white/30 text-white peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition-all duration-200">
      Male
    </div>
  </label>

  {/* Female */}
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="radio"
      name="gender"
      value="female"
      checked={form.gender === "female"}
      onChange={handleChange}
      className="hidden peer"
    />
    <div className="px-4 py-2 rounded-full border border-white/30 text-white peer-checked:bg-pink-500 peer-checked:text-white peer-checked:border-pink-500 transition-all duration-200">
      Female
    </div>
  </label>
</div>
      <LoadingButton loading={loading}>
    Register
  </LoadingButton>
    </form>

    <p className="text-center text-white/70 mt-4 text-sm">
      Already have an account?{" "}
      <Link to="/login" className="underline cursor-pointer">
        Login
      </Link>
    </p>
  </div>
</div>

  );
}
