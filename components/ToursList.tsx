import { AllToursJSON } from "@/utils/actions"
import React from "react"
import TourCard from "./TourCard"

export default function ToursList({ data }: { data: AllToursJSON[] }) {
  if (typeof data === "undefined" || data.length === 0) {
    return <h3 className="text-xl">No tours found...</h3>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((tour) => (
        <TourCard key={tour.id!} tour={tour} />
      ))}
    </div>
  )
}
