import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from '../../../components/common/ErrorContext.js';
import { useToast } from '@chakra-ui/react'

// Lazy-loaded components
const XSvg = lazy(() => import("../../../components/svgs/EdLive"));
const MdPassword = lazy(() => import("react-icons/md").then(module => ({ default: module.MdPassword })));
const FaUser = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaUser })));

// Animation styles as CSS classes
const styles = `
  .animate-shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LoginPage = () => {
    const { showError } = useError();
    const toast = useToast()
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });
    const [isFocused, setIsFocused] = useState({
        username: false,
        password: false,
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const {
        mutate: loginMutation,
        isPending,
    } = useMutation({
  mutationFn: async ({ username, password }) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }
    return data;
  },
  onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      localStorage.setItem("academicYear", data.academicYear);
    navigate("/");
  },
});

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "username":
                if (!value.trim()) error = "Username is required";
                break;
            case "password":
                if (!value) error = "Password is required";
                else if (value.length < 6) error = "Password must be at least 6 characters";
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let isValid = true;
        const newErrors = { ...errors };

        // Validate all fields
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
            isValid = false;
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
           toast.promise(
      new Promise((resolve, reject) => {
        loginMutation(formData, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        });
      }),
      {
        loading: {
          title: 'Logging in',
          description: 'Please wait while we sign you in',
          position: 'top',
        },
        success: {
          title: 'Login Successful',
          description: 'You have been signed in successfully',
          position: 'top',
          duration: 3000,
          isClosable: true,
        },
        error: (err) => ({
          title: 'Login Failed',
          description: err.message || 'Failed to sign in',
          position: 'top',
          duration: 5000,
          isClosable: true,
        })
      }
    );
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleFocus = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field, value) => {
        setIsFocused(prev => ({ ...prev, [field]: false }));
        validateField(field, value);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            {/* Add the styles to a style element */}
            <style>{styles}</style>
            
            <div className="card w-full max-w-md bg-base-100 shadow-2xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
                <div className="card-body p-8">
                    <div className="mb-8 flex justify-center transform hover:scale-105 transition-transform duration-300">
                        <Suspense fallback={<div className="w-1/2 h-10 bg-gray-200 rounded animate-pulse"></div>}>
                            <XSvg className="w-1/2 fill-current text-primary" />
                        </Suspense>
                    </div>

                    <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Welcome Back
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <div className={`relative ${errors.username ? "animate-shake" : ""}`}>
                                <label 
                                    className={`absolute left-4 transition-all duration-300 ${
                                        isFocused.username || formData.username 
                                            ? "top-0 text-xs text-primary" 
                                            : "top-4 text-sm text-gray-400"
                                    }`}
                                >
                                    Username
                                </label>
                                <div className={`input input-lg flex items-center gap-3 rounded-xl border-2 ${
                                    errors.username 
                                        ? "border-error" 
                                        : isFocused.username 
                                            ? "border-primary" 
                                            : "border-gray-200"
                                }`}>
                                    <Suspense fallback={<div className="w-5 h-5 bg-gray-200 rounded-full"></div>}>
                                        <FaUser className={`w-5 h-5 transition-colors ${
                                            errors.username 
                                                ? "text-error" 
                                                : isFocused.username 
                                                    ? "text-primary" 
                                                    : "text-gray-400"
                                        }`} />
                                    </Suspense>
                                    <input
                                        type="text"
                                        className="grow pt-5 pb-1 focus:outline-none"
                                        name="username"
                                        onChange={handleInputChange}
                                        onFocus={() => handleFocus("username")}
                                        onBlur={(e) => handleBlur("username", e.target.value)}
                                        value={formData.username}
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.username && (
                                    <div className="mt-1 text-error text-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.username}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-control">
                            <div className={`relative ${errors.password ? "animate-shake" : ""}`}>
                                <label 
                                    className={`absolute left-4 transition-all duration-300 ${
                                        isFocused.password || formData.password 
                                            ? "top-0 text-xs text-primary" 
                                            : "top-4 text-sm text-gray-400"
                                    }`}
                                >
                                    Password
                                </label>
                                <div className={`input input-lg flex items-center gap-3 rounded-xl border-2 ${
                                    errors.password 
                                        ? "border-error" 
                                        : isFocused.password 
                                            ? "border-primary" 
                                            : "border-gray-200"
                                }`}>
                                    <Suspense fallback={<div className="w-5 h-5 bg-gray-200 rounded-full"></div>}>
                                        <MdPassword className={`w-5 h-5 transition-colors ${
                                            errors.password 
                                                ? "text-error" 
                                                : isFocused.password 
                                                    ? "text-primary" 
                                                    : "text-gray-400"
                                        }`} />
                                    </Suspense>
                                    <input
                                        type="password"
                                        className="grow pt-5 pb-1 focus:outline-none"
                                        placeholder=""
                                        name="password"
                                        onChange={handleInputChange}
                                        onFocus={() => handleFocus("password")}
                                        onBlur={(e) => handleBlur("password", e.target.value)}
                                        value={formData.password}
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && (
                                    <div className="mt-1 text-error text-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.password}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* <div className="flex justify-end">
                            <button 
                                type="button" 
                                className="text-sm text-primary hover:text-primary-focus transition-colors"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Forgot password?
                            </button>
                        </div> */}

                        <div className="form-control mt-8">
                            <button 
                                className={`w-fit rounded-xl flex items-center justify-center gap-2 bg-[#00a9ec] text-white font-medium hover:bg-[#0090c7] transition-colors p-2 ${
                                    isPending ? "opacity-80" : "hover:opacity-90"
                                }`}
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="font-medium">Sign In</span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* {isError && (
                        <div className="alert alert-error mt-6 rounded-lg animate-fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error.message}</span>
                        </div>
                    )} */}

                    {/* <div className="divider my-6">OR</div>

                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <button 
                                className="text-primary hover:text-primary-focus font-medium transition-colors"
                                onClick={() => navigate("/register")}
                            >
                                Sign up
                            </button>
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;