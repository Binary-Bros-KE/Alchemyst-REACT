"use client"

import { FiHeart, FiUser, FiCamera, FiHome } from "react-icons/fi"

const categories = [
  {
    id: "all",
    name: "All",
    icon: FiUser,
    color: "from-gray-500 to-gray-700",
  },
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

export default function CategoryButtons({ onCategorySelect, selectedCategory = "all" }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5 max-md:gap-1">
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = selectedCategory === category.id
        
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`group relative overflow-hidden rounded-2xl px-6 max-md:px-2 max-md:py-1 py-2 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer max-md:text-sm ${
              isActive 
                ? `border-transparent bg-gradient-to-br ${category.color} shadow-lg scale-105`
                : 'border-border hover:border-transparent bg-card'
            }`}
          >
            {!isActive && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
            )}

            <div className="relative z-10 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-muted group-hover:bg-white/20'
              }`}>
                <Icon className={`transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-foreground group-hover:text-white'
                }`} size={15} />
              </div>
              <span className={`font-bold text-lg transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-foreground group-hover:text-white'
              }`}>
                {category.name}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}