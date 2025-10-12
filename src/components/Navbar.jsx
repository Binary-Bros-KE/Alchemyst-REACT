"use client"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { HiMenu, HiX } from "react-icons/hi"
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && !user) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    }
  }, [token]);

  const isAuthPage = pathname === "/register" || pathname.startsWith("/sign-up") || pathname === "/login"

  const getAuthButton = () => {
    if (pathname === "/register" || pathname.startsWith("/sign-up")) {
      return {
        text: "Login",
        href: "/login",
      }
    }
    if (pathname === "/login") {
      return {
        text: "Sign Up",
        href: "/register",
      }
    }
    return null
  }

  const authButton = getAuthButton()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/escorts", label: "Escorts" },
    { href: "/massage", label: "Massage" },
    { href: "/spas", label: "Erotic Spas" },
  ]

  return (
    <nav className="border-b border-neutral-800 bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-text-inverse">

          <span className="text-primary">
            <img src="/primary-logo.png" alt="Alchemyst Logo" className="h-10" />
          </span>
          Alchemyst
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-text-inverse/80 hover:text-primary transition-colors ${pathname === link.href ? "text-primary font-medium" : ""
                }`}
            >
              {link.label}
            </Link>
          ))}

          {token && user ? (
            <div className="relative group">
              <button className={`flex items-center gap-3 text-text-inverse ${user.isActive ? "bg-green-600/20 border border-green-600" : "bg-red-600/20 border border-red-600"} px-4 py-1 rounded-md hover:opacity-90 transition-opacity cursor-pointer`}>
                <div className="flex flex-col items-start">
                  <span className="font-medium max-w-[150px] truncate block text-sm">{user.username || "User"}</span>
                  <span className="text-xs text-text-muted capitalize">{user.userType}</span>
                </div>
                <IoMdArrowDropdown className="text-lg" />
                {user?.profileImage?.url ? <img src={user?.profileImage?.url} className="h-10 w-10 rounded-full object-cover"/> : <FaUserCircle className="text-2xl text-primary" />}
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-52 bg-bg-secondary border border-border-light rounded-xl shadow-lg hidden group-hover:block">
                <div className="px-4 py-3 border-b border-border-light">
                  <span
                    className={`text-sm font-medium ${user.isActive ? "text-green-500" : "text-red-400"
                      }`}
                  >
                    {user.isActive ? "Active Profile" : "Inactive Profile"}
                  </span>
                </div>
                <div className="flex flex-col text-sm text-text-primary">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 text-left hover:bg-neutral-800"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="px-4 py-2 text-left hover:bg-neutral-800"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      setUser(null);
                      navigate("/");
                    }}
                    className="px-4 py-2 text-left text-red-400 hover:bg-neutral-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 text-text-inverse border border-primary rounded-lg font-medium hover:bg-primary/10 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-hover transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-text-inverse text-3xl z-50 relative"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center md:hidden"
          >
            <div className="flex flex-col items-center gap-8 w-full px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-4xl font-bold text-text-inverse hover:text-primary transition-colors ${pathname === link.href ? "text-primary" : ""
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-xs">
                {isAuthPage ? (
                  <Link
                    to={authButton.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-8 py-4 bg-primary text-text-inverse rounded-lg font-bold text-xl hover:bg-primary-hover transition-all text-center"
                  >
                    {authButton.text}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-8 py-4 text-text-inverse border-2 border-primary rounded-lg font-bold text-xl hover:bg-primary/10 transition-all text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-8 py-4 bg-primary text-text-inverse rounded-lg font-bold text-xl hover:bg-primary-hover transition-all text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
