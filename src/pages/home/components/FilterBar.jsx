"use client"

import { useState } from "react"
import { FiFilter } from "react-icons/fi"

export default function FilterBar({ filters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-all"
      >
        <FiFilter />
        Filters
        {Object.values(filters).filter((v) => v !== "all").length > 0 && (
          <span className="px-2 py-0.5 bg-primary text-white rounded-full text-xs">
            {Object.values(filters).filter((v) => v !== "all").length}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="mt-4 p-4 bg-card border border-border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="female">Female</option>
              <option value="trans">Trans</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Body Type</label>
            <select
              value={filters.bodyType}
              onChange={(e) => handleFilterChange("bodyType", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="slim">Slim</option>
              <option value="athletic">Athletic</option>
              <option value="curvy">Curvy</option>
              <option value="plus-size">Plus Size</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Breast Size</label>
            <select
              value={filters.breastSize}
              onChange={(e) => handleFilterChange("breastSize", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => onFilterChange({ userType: "all", gender: "all", bodyType: "all", breastSize: "all" })}
              className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
