import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Register from "./pages/auth/Register"
import SignUp from "./pages/auth/SignUp"
import Home from "./pages/home/Home"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Dashboard from "./pages/dashboard/Dashboard"
import Login from "./pages/auth/Login"
import BackToTop from "./components/BackToTop"

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <BackToTop />
      <Footer />
    </Router>
  )
}

export default App
