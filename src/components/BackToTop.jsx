"use client"

import { useState, useEffect } from "react"
import { BiChevronUp } from "react-icons/bi"

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 cursor-pointer z-50 bg-primary hover:bg-primary-hover text-white p-2 rounded-md shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Back to top"
        >
          <BiChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  )
}

export default BackToTop
