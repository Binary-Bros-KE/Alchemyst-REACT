"use client"

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import toast from "react-hot-toast"
import { saveAuthData, isAuthenticated } from "../../utils/auth"

const API_URL = import.meta.env.VITE_API_URL

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    code: "",
    newPassword: "",
    step: 1 // 1: email, 2: code, 3: new password
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value,
    })
  }

useEffect(() => {
  try {
    if (isAuthenticated()) navigate("/dashboard");
  } catch (error) {
    console.error("Auth check failed:", error);
    localStorage.clear();
    navigate("/login");
  }
}, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rememberMe: rememberMe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      if (data.success) {
        // Save auth data with expiration management
        saveAuthData(data.token, data.data, rememberMe)
        
        toast.success("Login successful!")
        navigate("/dashboard")
      } else {
        throw new Error(data.message || "Login failed")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Functions
  const handleSendResetCode = async (e) => {
    e.preventDefault()
    
    if (!forgotPasswordData.email) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordData.email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset code")
      }

      if (data.success) {
        setForgotPasswordData(prev => ({ ...prev, step: 2 }))
        toast.success("Reset code sent to your email!")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyResetCode = async (e) => {
    e.preventDefault()
    
    if (!forgotPasswordData.code) {
      toast.error("Please enter the reset code")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          code: forgotPasswordData.code
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid reset code")
      }

      if (data.success) {
        setForgotPasswordData(prev => ({ ...prev, step: 3 }))
        toast.success("Code verified! Enter your new password")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!forgotPasswordData.newPassword) {
      toast.error("Please enter your new password")
      return
    }

    if (forgotPasswordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          code: forgotPasswordData.code,
          newPassword: forgotPasswordData.newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      if (data.success) {
        toast.success("Password reset successfully! You can now login with your new password")
        setForgotPasswordMode(false)
        setForgotPasswordData({
          email: "",
          code: "",
          newPassword: "",
          step: 1
        })
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setForgotPasswordMode(false)
    setForgotPasswordData({
      email: "",
      code: "",
      newPassword: "",
      step: 1
    })
  }

  return (
    <div className="bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-2">
            {forgotPasswordMode ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-secondary/70">
            {forgotPasswordMode 
              ? "Enter your email to reset your password" 
              : "Sign in to your Alchemyst account"
            }
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl">
          {/* Forgot Password Flow */}
          {forgotPasswordMode ? (
            <div className="space-y-6">
              {/* Step 1: Email */}
              {forgotPasswordData.step === 1 && (
                <form onSubmit={handleSendResetCode}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" />
                      <input
                        type="email"
                        name="email"
                        value={forgotPasswordData.email}
                        onChange={handleForgotPasswordChange}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-secondary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="your@email.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Code Verification */}
              {forgotPasswordData.step === 2 && (
                <form onSubmit={handleVerifyResetCode}>
                  <div className="mb-6">
                    <label htmlFor="code" className="block text-sm font-medium text-secondary mb-2">
                      Enter Reset Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={forgotPasswordData.code}
                      onChange={handleForgotPasswordChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-secondary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-center text-lg tracking-widest"
                      placeholder="0000"
                      maxLength="4"
                      disabled={loading}
                    />
                    <p className="text-sm text-secondary/70 mt-2 text-center">
                      Check your email for the 4-digit reset code
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotPasswordData.step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-6">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-secondary mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={forgotPasswordData.newPassword}
                        onChange={handleForgotPasswordChange}
                        className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-secondary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Enter new password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs text-secondary/70 mt-2">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button
                  onClick={resetForgotPassword}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            /* Normal Login Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-secondary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-secondary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Remember me for 7 days
                </label>

                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                  className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          {!forgotPasswordMode && (
            <div className="mt-6 text-center">
              <p className="text-secondary/70">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}