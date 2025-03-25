import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";
import axios from "axios";

const VERIFY_REQUEST_URL = "http://127.0.0.1:5009/users/verify_email/request";
const VERIFY_URL = "http://127.0.0.1:5009/users/verify_email";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const email = location.state?.email;
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [isFirstRequest, setIsFirstRequest] = useState(true); // Track first-time request

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.verified) {
      navigate("/home");
    }
  }, [navigate]);

  // Countdown logic (only starts after clicking the button)
  useEffect(() => {
    if (timer > 0) {
      setIsResendDisabled(true);
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  // Send or Resend Verification Code
  const requestVerificationCode = async () => {
    try {
      setIsFirstRequest(false); // After first request, always show "Resend Verification Code"
      setIsResendDisabled(true);
      setTimer(60);

      const response = await axios.post(VERIFY_REQUEST_URL, { email }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setMessage(response.data.message || "A new verification code has been sent.");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request verification code.");
      setIsResendDisabled(false);
    }
  };

  // Verify Email
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(VERIFY_URL, { email, code: verificationCode }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert(response.data.message);

      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), verified: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      dispatch(login({ user: updatedUser, token: localStorage.getItem("token") }));

      setTimeout(() => {
        navigate("/home");
      }, 200);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid verification code.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="text-gray-600 text-center mb-4">
          A verification code has been sent to <strong>{email}</strong>
        </p>

        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            name="verificationCode"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="border p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-500"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-300"
          >
            Verify Email
          </button>
        </form>

        {/* Send/Resend Verification Code Button */}
        <button 
          onClick={requestVerificationCode} 
          className={`mt-4 p-2 w-full rounded-md transition duration-300 ${
            isResendDisabled 
              ? "bg-gray-400 text-white cursor-not-allowed" 
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
          disabled={isResendDisabled}
        >
          {isFirstRequest ? "Send Verification Code" : (isResendDisabled ? `Resend Code in ${timer}s` : "Resend Verification Code")}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
