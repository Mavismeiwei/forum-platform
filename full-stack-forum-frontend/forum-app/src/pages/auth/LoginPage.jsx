import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";

const LoginPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [banned, setBanned] = useState(false); // Track banned status
  const [showEmailPopup, setEmailPopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // if user visit from register page, it will fill out the email and password automatically
  useEffect(() => {
    if (location.state?.email && location.state?.password) {
      setFormData({
        email: location.state.email,
        password: location.state.password,
      });
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5009/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === "User is banned") {
          setBanned(true);
          setError("Your account has been banned. Contact support for help.");
          return;
        }
        throw new Error(data.error || "Login failed");
      }

      const { token, user } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(login({ user, token, role: user.role }));

      if (!user.verified) {
        setEmailPopup(true);
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("❌ Login Error:", err.message);
      setError(err.message);
    }
  };

  const handleVerifyEmail = () => {
    navigate("/verify-email", { state: { email: formData.email } });
  };

  const closePopupAndGoHome = () => {
    setEmailPopup(false);
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Login
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {banned && (
          <p className="text-center text-gray-600 mt-2">
            Need help?{" "}
            <Link to="/contactus" className="text-red-500 hover:underline">
              Contact Support
            </Link>
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/users/register" className="text-blue-500 hover:underline">
            Sign Up Here
          </Link>
        </p>

        <p className="text-center text-gray-600 mt-2">
          Need assistance?{" "}
          <Link to="/contactus" className="text-red-500 hover:underline">
            Contact Us
          </Link>
        </p>
      </div>

      {showEmailPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-xl font-bold text-gray-800">
              Verify Your Email
            </h3>
            <p className="text-gray-600 mt-2 mb-4">
              You haven't verified your email yet. Would you like to verify it
              now?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleVerifyEmail}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Verify Now
              </button>
              <button
                onClick={closePopupAndGoHome}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
