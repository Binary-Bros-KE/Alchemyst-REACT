"use client"

import { useNavigate } from "react-router-dom"
import locationsData from "../../../data/counties.json"
import { generateSeoPath } from "../../../utils/urlHelpers"

export default function PopularAreas({ county }) {
  const navigate = useNavigate()

  const handleAreaClick = (county, area) => {
    const path = generateSeoPath({ county, area })
    navigate(path)
  }

  // ✅ Handle "no county selected" case
  if (!county || county === "all") {
    // Pick top/popular counties (customize this list as you wish)
    const popularCounties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Eldoret", "Nanyuki", "Narok", "Limuru"]

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Popular Counties</h2>
        <div className="flex flex-wrap gap-2">
          {popularCounties.map((countyName, index) => (
            <button
              key={index}
              onClick={() => handleAreaClick(countyName)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all text-sm cursor-pointer"
            >
              {countyName}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ✅ Otherwise, show areas for that county
  const countyData = locationsData.find((c) => c.name === county)
  if (!countyData) return null

  const areas = countyData.sub_counties || []

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Popular Areas in {county}</h2>
      <div className="flex flex-wrap gap-2">
        {areas.map((area, index) => (
          <button
            key={index}
            onClick={() => handleAreaClick(county, area)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all text-sm"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  )
}
