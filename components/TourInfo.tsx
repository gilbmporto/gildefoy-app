import { TourJSON } from "@/utils/actions"
import React from "react"

export default function TourInfo({ tour }: { tour: TourJSON }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-5xl font-semibold mb-4">{tour.title}</h1>
      <p className="leading-relaxed mb-4">{tour.description}</p>
      <div className="join join-vertical sm:join-horizontal w-full">
        <div className="join-item w-full flex items-center gap-2">
          <h3 className="mb-4 text-xl ">City:</h3>
          <p className="mb-4 text-lg mt-0.5 capitalize">{tour.city}</p>
        </div>
        <div className="join-item w-full flex items-center gap-2 py-2">
          <h3 className="mb-4 text-xl">Country:</h3>
          <p className="mb-4 text-lg mt-0.5 capitalize">{tour.country}</p>
        </div>
      </div>
      <h2 className="mb-4 text-4xl">Tour info:</h2>
      <ul>
        {tour.stops.map((stop, index) => (
          <li key={index} className="mb-4 bg-base-100 p-4 rounded-2xl">
            <p>{stop}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
