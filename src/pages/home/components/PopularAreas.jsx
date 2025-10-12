"use client"

import { useNavigate } from "react-router-dom"
import locationsData from "../../../data/counties.json"

export default function PopularAreas({ county }) {
 const navigate = useNavigate()

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
            onClick={() => navigate(`/location/${county}/${area}`)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all text-sm"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  )
}
