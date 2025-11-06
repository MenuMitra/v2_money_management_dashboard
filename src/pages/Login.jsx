import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_VERSION } from "../api/axios";

// MenuMitra company info and social links
const menuMitraCompanyInfo = {};

const menuMitraAppInfo = {
  name: "MenusMitra",
  title: "Outlet Dashboard",
  logo: {
    width: "100px",
    height: "auto",
  },
};

const menuMitraSocialLinks = [
  {
    name: "Google",
    url: "https://menumitra.com/",
    icon: "ri-google-fill",
    color: "text-green-700 hover:bg-blue-50 hover:border-blue-600",
  },
  {
    name: "Facebook",
    url: " https://www.facebook.com/share/x5wymXr6w7W49vaQ/?mibextid=qi2Omg",
    icon: "ri-facebook-fill",
    color: "text-blue-600 hover:bg-blue-50 hover:border-blue-500",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/menumitra/",
    icon: "ri-instagram-fill",
    color: "text-pink-600 hover:bg-pink-50 hover:border-pink-500",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@menumitra",
    icon: "fab fa-youtube",
    color: "text-red-600 hover:bg-red-50 hover:border-red-500",
  },
];

// Comment out the contact info as requested
/*
const menuMitraContactInfo = {
  phone: "+91 95272 79639",
  email: "menumitra.info@gmail.com"
};
*/

export default function Login() {
  const navigate = useNavigate();
  const {
    login,
    verifyOtp,
    resendOtp,
    loading,
    error: authError,
    isAuthenticated,
    getOrGenerateDeviceId,
    getDeviceInfo,
  } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [error, setError] = useState("");
  const [invalidOtp, setInvalidOtp] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const mobileInputRef = useRef(null);

  // Handle authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Display auth error if there is one
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Clear any existing auth data on component mount
  useEffect(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("mobile_number");
    localStorage.removeItem("role");

    // Focus the mobile input field on component mount
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !mobileNumber ||
      mobileNumber.length !== 10 ||
      !/^\d+$/.test(mobileNumber)
    ) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const response = await login(mobileNumber);

      if (response.success) {
        setShowOtpForm(true);
        setCountdown(15);
        setResendDisabled(true);

        // Focus the first OTP input after showing OTP form
        setTimeout(() => {
          if (otpRefs[0].current) {
            otpRefs[0].current.focus();
          }
        }, 100);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpChange = (index, value) => {
    if (value === "" || /^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Clear invalid OTP error when user starts typing
      if (invalidOtp) {
        setInvalidOtp(false);
        setError("");
      }

      // Auto-focus next input if current one is filled
      if (value !== "" && index < 3) {
        otpRefs[index + 1].current.focus();
      }

      // If all 4 digits are filled, auto verify with the latest array
      if (value !== "" && newOtp.every((digit) => digit !== "")) {
        // Allow state to update before verifying
        setTimeout(() => {
          handleVerifyOtp(undefined, newOtp);
        }, 0);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        otpRefs[index - 1].current.focus();
      }
    }
  };

  const handleVerifyOtp = async (e, providedOtpArray) => {
    if (e) e.preventDefault();
    setError("");

    const otpArray = providedOtpArray ?? otp;

    // Check if OTP is complete
    if (otpArray.some((digit) => !digit)) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    // Get device information
    const deviceId = getOrGenerateDeviceId();
    const deviceModel = getDeviceInfo();
    const enteredOtp = otpArray.join("");

    // Get FCM token if available (implement this later if needed)
    const fcmToken = localStorage.getItem("fcm_token") || null;

    try {
      // Call the verifyOtp function from auth context
      const verificationData = {
        mobile: mobileNumber,
        otp: enteredOtp,
        device_id: deviceId,
        device_model: deviceModel,
        fcm_token: fcmToken,
      };

      const response = await verifyOtp(verificationData);

      if (response.success) {
        // Login successful - navigation will happen through the auth context
        setInvalidOtp(false);
        navigate("/", { replace: true });
      } else {
        // Check if error is related to invalid OTP
        const errorMessage = response.error || "";
        const isInvalidOtpError =
          errorMessage.toLowerCase().includes("otp") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("incorrect") ||
          errorMessage.toLowerCase().includes("wrong");

        if (isInvalidOtpError) {
          setInvalidOtp(true);
        }
        setError(errorMessage);
      }
    } catch (err) {
      setInvalidOtp(true);
      setError("Failed to verify OTP. Please try again.");
    }
  };

  const handleBack = () => {
    setShowOtpForm(false);
    setOtp(["", "", "", ""]);
    setError("");
    setInvalidOtp(false);

    // Focus the mobile input field after going back
    setTimeout(() => {
      if (mobileInputRef.current) {
        mobileInputRef.current.focus();
      }
    }, 100);
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setError("");
    setOtp(["", "", "", ""]);
    setInvalidOtp(false);

    try {
      const response = await resendOtp(mobileNumber);

      if (response.success) {
        setCountdown(20);
        setResendDisabled(true);

        // Focus the first OTP input after resending
        setTimeout(() => {
          if (otpRefs[0].current) {
            otpRefs[0].current.focus();
          }
        }, 100);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <>
      {/* Testing Environment Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-white text-center py-1 px-2 font-medium w-full flex items-center justify-center"
        style={{ height: "28px" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Testing Environment</span>
      </div>

      <div
        className="min-h-screen flex items-center justify-center bg-white py-16 px-6 lg:px-12"
        style={{ paddingTop: "calc(28px + 4rem)" }}
      >
        <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          {/* Login Testing Badge */}

          {/* Logo and Header */}
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4">
              <img
                src="/assets/MenuMitra_logo.png"
                alt="MenuMitra Logo"
                className="h-20 w-auto"
              />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              {showOtpForm ? "Verify OTP" : "Outlet Dashboard"}
            </h2>
            <p className="mt-3 text-center text-base text-gray-600">
              {showOtpForm
                ? `We've sent a verification code to ${mobileNumber}`
                : "Please enter your mobile number to login"}
            </p>
          </div>

          {error && (
            <div
              className={`bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded relative ${showOtpForm ? "text-center" : ""
                }`}
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!showOtpForm ? (
            // Mobile Number Form
            <form className="mt-8 space-y-6" onSubmit={handleMobileSubmit}>
              <div>
                <label
                  htmlFor="mobile-number"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Mobile Number
                </label>
                <input
                  id="mobile-number"
                  type="tel"
                  name="mobile"
                  autoComplete="tel"
                  ref={mobileInputRef}
                  required
                  className="appearance-none block w-full px-4 py-4 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-xl"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => {
                    // Allow only digits, ensure first digit is 6-9, max length 10
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 0 && !/^[6-9]/.test(value)) {
                      value = value.replace(/^[0-5]+/, "");
                    }
                    setMobileNumber(value.slice(0, 10));
                  }}
                  onKeyDown={(e) => {
                    const key = e.key;
                    const controlKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                      "Home",
                      "End",
                      "Enter",
                      "NumpadEnter",
                    ];
                    if (!/^\d$/.test(key) && !controlKeys.includes(key)) {
                      e.preventDefault();
                      return;
                    }
                    // Prevent 0-5 as the first digit
                    if (mobileNumber.length === 0 && /^[0-5]$/.test(key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text") || "";
                    let value = pasted.replace(/\D/g, "");
                    if (value.length > 0 && !/^[6-9]/.test(value)) {
                      value = value.replace(/^[0-5]+/, "");
                    }
                    setMobileNumber(value.slice(0, 10));
                    e.preventDefault();
                  }}
                  disabled={loading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || mobileNumber.length !== 10}
                  className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-xl font-medium rounded-md text-white ${loading || mobileNumber.length !== 10
                      ? "bg-primary-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </form>
          ) : (
            // OTP Verification Form
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <div className="flex items-center justify-center mb-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center text-primary-600 hover:text-primary-500 text-base font-medium focus:outline-none"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Change number
                  </button>
                </div>

                <label
                  htmlFor="otp"
                  className="block text-base font-medium text-gray-700 mb-4 text-center"
                >
                  Enter 4-digit verification code
                </label>
                <div className="flex justify-center space-x-4">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-16 h-16 text-center text-3xl font-semibold border rounded-md shadow-sm focus:outline-none ${invalidOtp
                          ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled || loading}
                  className={`text-base font-medium focus:outline-none focus:underline ${resendDisabled || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary-600 hover:text-primary-500"
                    }`}
                >
                  {resendDisabled
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.some((digit) => !digit)}
                  className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-xl font-medium rounded-md text-white ${loading || otp.some((digit) => !digit)
                      ? "bg-primary-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer with company info and social links */}
          <div className="mt-10">
            <div className="mt-4 text-center">
              <a
                href={menuMitraCompanyInfo.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 font-medium hover:text-primary-500 text-lg"
              >
                {menuMitraCompanyInfo.name}
              </a>
            </div>
            {/* Footer Links (Home, Book a Demo, Contact, Support) */}
            <div className="mt-8 flex justify-center space-x-6">
              <a
                href="https://menumitra.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[#2a6db0]  hover:text-primary-600 font-medium text-base"
              >
                Home
              </a>
              <a
                href="https://menumitra.com/book-demo"
                target="_blank"
                rel="noreferrer"
                className="text-[#2a6db0] hover:text-[#1f4e7d] font-medium text-base"
              >
                Book a Demo
              </a>
              <a
                href="https://menumitra.com/contact"
                target="_blank"
                rel="noreferrer"
                className="text-[#2a6db0]  hover:text-primary-600 font-medium text-base"
              >
                Contact
              </a>
              <a
                href="https://menumitra.com/customer-care"
                target="_blank"
                rel="noreferrer"
                className="text-[#2a6db0]  hover:text-primary-600 font-medium text-base"
              >
                Support
              </a>
            </div>

            <div className="mt-6 flex justify-center space-x-6">
              {menuMitraSocialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-12 h-12 flex items-center justify-center rounded-full border border-white-300 ${social.color} transition-colors text-xl shadow-lg hover:shadow-2xl`}
                >
                  <span className="sr-only">{social.name}</span>
                  <i className={`${social.icon}`}></i>
                </a>
              ))}
            </div>

            <div className="flex justify-center items-center gap-3 mt-4 text-base text-gray-500 dark:text-gray-400">
              <span className="font-medium">Version {APP_VERSION}</span>
              <span>|</span>
              <span>04-Nov-2025</span>
            </div>

            {/* Contact info commented out as requested */}
            {/*
            <div className="mt-4 text-center text-xs text-gray-500">
              <div className="mb-2">
                <a href={`tel:${menuMitraContactInfo.phone.replace(/\s+/g, '')}`} className="text-primary-600 hover:text-primary-500 font-medium">
                  <i className="fas fa-phone-alt mr-1"></i> {menuMitraContactInfo.phone}
                </a>
              </div>
              <div>
                <a href={`mailto:${menuMitraContactInfo.email}`} className="text-primary-600 hover:text-primary-500 font-medium">
                  <i className="fas fa-envelope mr-1"></i> {menuMitraContactInfo.email}
                </a>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </>
  );
}
