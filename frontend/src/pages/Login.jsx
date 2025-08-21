import axios from "axios";
import { useState } from "react";
import { Link , useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../store/AuthContext.jsx";
export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const { setUser} = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(""); //! clear error on input Change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);
    try {
      const res = await axios.post("/api/user/login", form, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        withCredentials: true,
      });

      const data = res.data;

      localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user)
      console.log("User logged in:", data.user);
      toast.success(data.msg || "Login Ho gya hai");
      setError("");
      
      setLoading(false);
      setSuccess(data.msg);
      navigate("/home")
    } catch (err) {
      const msg = err.response?.data?.msg || "Server error. Try again.";
      toast.error(msg);
      setSuccess("");
      setLoading(false);
    }
  };

  return (
    <div id="login" className="min-h-screen [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-white/20">

        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6">
          <p>Welcome back 👋</p>
          <span className="text-blue-500">
            Login  to <b>ChatGram</b>
          </span>
        </h2>

        {error && (
          <div className="text-red-400 text-sm text-center mb-2">{error}</div>
        )}
        {success && (
          <div className="text-green-400 text-sm text-center mb-2">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/80 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 rounded-lg bg-white/20 text-white placeholder-white/80 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-white/70 mt-4 text-sm">
          Don’t have an account? {""}
          <Link to="/register" className="underline cursor-pointer">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
