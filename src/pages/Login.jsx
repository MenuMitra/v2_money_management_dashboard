import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MenuMitra company info and social links
const menuMitraCompanyInfo = {
  name: "MenusMitra Technologies Pvt. Ltd.",
  website: "https://menusmitra.com",
  version: "1.0.0"
};

const menuMitraAppInfo = {
  name: "MenusMitra",
  title: "Outlet Dashboard",
  logo: {
    width: "100px",
    height: "auto"
  }
};

const menuMitraSocialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/menumitra/",
    icon: "fab fa-facebook-f"
  },
  {
    name: "Twitter",
    url: "https://twitter.com/MenuMitra",
    icon: "fab fa-twitter"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/menumitra/",
    icon: "fab fa-instagram"
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/919527279639",
    icon: "fab fa-whatsapp"
  }
];

const menuMitraContactInfo = {
  phone: "+91 95272 79639",
  email: "menumitra.info@gmail.com"
};

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp, loading, error: authError, isAuthenticated, getOrGenerateDeviceId, getDeviceInfo } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const mobileInputRef = useRef(null);

  // Handle authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('mobile_number');
    localStorage.removeItem('role');
    
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
    setError('');

    if (!mobileNumber || mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
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
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value === '' || /^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if current one is filled
      if (value !== '' && index < 3) {
        otpRefs[index + 1].current.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        otpRefs[index - 1].current.focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    // Check if OTP is complete
    if (otp.some(digit => !digit)) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    // Get device information
    const deviceId = getOrGenerateDeviceId();
    const deviceModel = getDeviceInfo();
    const enteredOtp = otp.join('');
    
    // Get FCM token if available (implement this later if needed)
    const fcmToken = localStorage.getItem('fcm_token') || null;

    try {
      // Call the verifyOtp function from auth context
      const verificationData = {
        mobile: mobileNumber,
        otp: enteredOtp,
        device_id: deviceId,
        device_model: deviceModel,
        fcm_token: fcmToken
      };
      
      const response = await verifyOtp(verificationData);
      
      if (response.success) {
        // Login successful - navigation will happen through the auth context
        navigate('/', { replace: true });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    }
  };

  const handleBack = () => {
    setShowOtpForm(false);
    setOtp(['', '', '', '']);
    setError('');
    
    // Focus the mobile input field after going back
    setTimeout(() => {
      if (mobileInputRef.current) {
        mobileInputRef.current.focus();
      }
    }, 100);
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    
    setError('');
    setOtp(['', '', '', '']);
    
    try {
      const response = await resendOtp(mobileNumber);
      
      if (response.success) {
        setCountdown(15);
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
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {/* Logo and Header */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-3">
            <img 
              src="/MenuMitra_logo.png" 
              alt="MenuMitra Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-center text-2xl font-extrabold text-gray-900">
            {showOtpForm ? 'Verify OTP' : 'Welcome to Outlet Dashboard'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showOtpForm 
              ? `We've sent a verification code to ${mobileNumber}` 
              : 'Please enter your mobile number to login'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {!showOtpForm ? (
          // Mobile Number Form
          <form className="mt-6 space-y-5" onSubmit={handleMobileSubmit}>
            <div>
              <label htmlFor="mobile-number" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                id="mobile-number"
                type="tel"
                name="mobile"
                autoComplete="tel"
                ref={mobileInputRef}
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-lg"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setMobileNumber(value.slice(0, 10));
                  }
                }}
                disabled={loading}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white ${
                  loading || mobileNumber.length !== 10
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          // OTP Verification Form
          <form className="mt-6 space-y-5" onSubmit={handleVerifyOtp}>
            <div>
              <div className="flex items-center justify-center mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center text-primary-600 hover:text-primary-500 text-sm font-medium focus:outline-none"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Change number
                </button>
              </div>
            
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter 4-digit verification code
              </label>
              <div className="flex justify-center space-x-3">
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
                    className="w-14 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                className={`text-sm font-medium focus:outline-none focus:underline ${
                  resendDisabled || loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-primary-600 hover:text-primary-500'
                }`}
              >
                {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading || otp.some(digit => !digit)}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white ${
                  loading || otp.some(digit => !digit)
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}
        
        {/* Footer with company info and social links */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                <svg className="w-4 h-4 inline-block mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Powered by
              </span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <a 
              href={menuMitraCompanyInfo.website}
              target="_blank" 
              rel="noreferrer"
              className="text-primary-600 font-medium hover:text-primary-500"
            >
              {menuMitraCompanyInfo.name}
            </a>
          </div>
          
          <div className="mt-4 flex justify-center space-x-4">
            {menuMitraSocialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-primary-600 hover:bg-primary-50 hover:border-primary-500 transition-colors"
              >
                <span className="sr-only">{social.name}</span>
                <i className={`${social.icon} text-lg`}></i>
              </a>
            ))}
          </div>
          
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
        </div>
      </div>
    </div>
  );
} 