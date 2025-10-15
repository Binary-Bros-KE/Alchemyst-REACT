"use client"

import { FiHeart, FiUser, FiCamera, FiHome } from "react-icons/fi"

const categories = [
  {
    id: "escort",
    name: "Escorts",
    icon: FiHeart,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "masseuse",
    name: "Masseuse",
    icon: FiUser,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "of-model",
    name: "OF Models",
    icon: FiCamera,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "spa",
    name: "Spas",
    icon: FiHome,
    color: "from-teal-500 to-blue-500",
  },
]

export default function CategoryButtons({ onCategorySelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="group relative overflow-hidden bg-card rounded-2xl px-6 py-2 border-2 border-border hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                <Icon className="text-foreground group-hover:text-white transition-colors duration-300" size={28} />
              </div>
              <span className="font-bold text-lg text-foreground group-hover:text-white transition-colors duration-300">
                {category.name}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
