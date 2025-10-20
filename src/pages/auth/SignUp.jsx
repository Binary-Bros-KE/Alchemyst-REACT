"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import toast from "react-hot-toast"
import { saveAuthData } from "../../utils/auth"

const API_URL = import.meta.env.VITE_API_URL

function SignUpContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const userType = searchParams.get("type") // updated name

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToPolicies, setAgreedToPolicies] = useState(false)
  const [confirmedVoluntary, setConfirmedVoluntary] = useState(false)
  const [confirmedAdult, setConfirmedAdult] = useState(false)
  const [confirmedPhotosOwned, setConfirmedPhotosOwned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!userType) {
      navigate("/register")
    }
  }, [userType, navigate])

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      navigate("/dashboard");
    }
  }, [navigate]);


  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    // always require overall policies agreement
    if (!agreedToPolicies) {
      newErrors.policies = "You must agree to the platform policies"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

// In your Register component, update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) {
    toast.error("Please fix the errors in the form")
    return
  }

  setLoading(true)

  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      userType: userType,
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Registration failed")

    if (data.success) {
      // Save auth data with 24-hour expiration (default for register)
      saveAuthData(data.token, data.data, false) // false = 24 hours
      
      toast.success("Registration successful!")
      navigate("/dashboard")
    } else {
      throw new Error(data.message || "Registration failed")
    }
  } catch (error) {
    toast.error(error.message)
  } finally {
    setLoading(false)
  }
}

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  if (!userType) return null

  // 👇 Human-readable role name for titles
  const roleNames = {
    escort: "Escort",
    masseuse: "Masseuse",
    "of-model": "OF Model",
    spa: "Spa / Wellness",
  }

  const readableRole = roleNames[userType] || "Member"

  // Base/common policies
  const commonPolicies = [
    "You must adhere to your local laws and agree not to offer any services that are prohibited in that jurisdiction.",
    "We act only as an advertising and connection platform — we do not employ, supervise, or control providers.",
    "You must be creating an account of your own free will, free of any outside pressure, and that account must remain in your control only.",
    "We are not responsible for offline agreements, disputes, or incidents between users.",
  ]

  // Role-specific policy bullets
  const rolePolicyMap = {
    escort: [
      "You must be over the age of 18 and the age of majority in your jurisdiction to use Alchemyst!.",
      "You are responsible for your own safety and conduct when meeting clients.",
    ],
    masseuse: [
      "You must be at least 18 years old and the age of majority in your jurisdiction (where applicable).",
      "Make sure you hold any required local licenses or certifications for massage services.",
    ],
    "of-model": [
      "You must be at least 18 years old and the age of majority in your jurisdiction.",
      "All modeling content must be lawful and consensual.",
    ],
    spa: [
      "Spa providers must comply with local business and health regulations.",
      "Ensure client safety and proper hygiene standards in your services.",
    ],
  }

  const extraRolePolicies = rolePolicyMap[userType] || []

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 text-center">
            {readableRole} Sign Up
          </h1>

          {/* Policies Section */}
          <div className="bg-bg-secondary border border-border-light rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Policies</h2>
            <div className="space-y-4 text-text-secondary">
              <p>
                Welcome to Alchemyst! We're excited to have you join as a {readableRole}. Before continuing, please
                review and agree to the policies below:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                {commonPolicies.map((p, i) => (
                  <li key={`common-${i}`}>{p}</li>
                ))}

                {extraRolePolicies.map((p, i) => (
                  <li key={`role-${i}`} className="font-medium">
                    {p}
                  </li>
                ))}

                <li>All uploaded photos must be accurate and owned by you. Do not upload copyrighted or third-party images without permission.</li>
              </ul>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-6">
                <p className="text-primary font-medium">
                  By signing up to Alchemyst you agree to our Terms of Service, Code of Conduct, and Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="bg-bg-secondary border border-border-light rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-bg-primary border ${errors.username ? "border-error" : "border-border-light"
                    } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
                  placeholder="Enter your username"
                  disabled={loading}
                />
                {errors.username && <p className="text-error text-sm mt-1">{errors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-bg-primary border ${errors.email ? "border-error" : "border-border-light"
                    } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-bg-primary border ${errors.password ? "border-error" : "border-border-light"
                      } rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Policy confirmations */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToPolicies}
                    onChange={(e) => {
                      setAgreedToPolicies(e.target.checked)
                      if (errors.policies) setErrors((prev) => ({ ...prev, policies: "" }))
                    }}
                    className="mt-1 w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                    disabled={loading}
                  />
                  <span className="text-sm text-text-secondary">
                    I agree to the platform policies.
                  </span>
                </label>
                {errors.policies && <p className="text-error text-sm mt-1">{errors.policies}</p>}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full px-6 py-4 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </motion.button>

              <p className="text-center text-text-secondary text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
