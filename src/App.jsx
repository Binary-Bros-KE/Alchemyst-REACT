import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from "./redux/index"
import Register from "./pages/auth/Register"
import SignUp from "./pages/auth/SignUp"
import Home from "./pages/home/Home"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Dashboard from "./pages/dashboard/Dashboard"
import Login from "./pages/auth/Login"
import BackToTop from "./components/BackToTop"
import ProfileDetailsPage from "./pages/profile/ProfileDetailsPage"
import LocationPage from "./pages/location/LocationPage"
import ScrollToTop from "./components/BackToTop";
// Add these imports
import BlogsPage from './pages/blog/BlogsPage';
import BlogDetailsPage from './pages/blog/BlogDetailsPage';
import SnapToTop from "./components/SnapToTop"
import { useEffect } from "react"
import { initAuthCheck } from "./utils/auth"



function App() {
  useEffect(() => {
    initAuthCheck(); // clears data + redirects if expired
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <Router>
          <Toaster position="top-right" />
          <Navbar />
          <ScrollToTop />
          <SnapToTop />
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/register" element={<Register />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/:county" element={<LocationPage />} />
            <Route path="/:county/:location" element={<LocationPage />} />
            <Route path="/:county/:location/:area" element={<LocationPage />} />

            <Route path="/profile/:userType/:userId" element={<ProfileDetailsPage />} />

            <Route path="/blog" element={<BlogsPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
          </Routes>
          <BackToTop />
          <Footer />
        </Router>
      </PersistGate>
    </Provider>
  )
}

export default App