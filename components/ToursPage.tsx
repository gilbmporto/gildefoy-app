"use client"
import { getAllTours } from "@/utils/actions"
import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import ToursList from "./ToursList"
import { useUser } from "@clerk/nextjs"

export default function ToursPage() {
  const [searchCity, setSearchCity] = useState("")
  const [searchCountry, setSearchCountry] = useState("")
  const { user } = useUser()

  const { data, isPending } = useQuery({
    queryKey: ["tours", searchCity, searchCountry],
    queryFn: async () => {
      const searchObject = {
        userId: user?.id!,
        city: searchCity,
        country: searchCountry,
      }
      return await getAllTours(searchObject)
    },
  })

  console.log(data)
  return (
    <>
      <form className="max-w-xl mb-12">
        <div className="join join-vertical md:join-horizontal w-full">
          <input
            type="text"
            placeholder="Enter a city here... (Optional)"
            className="join-item input input-primary w-full"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter a country here... (Optional)"
            className="join-item input input-primary w-full"
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
          />
          <button
            className="btn btn-primary join-item"
            type="submit"
            disabled={isPending}
          >
            {isPending ? `Please wait...` : `Search`}
          </button>
        </div>
      </form>
      {isPending ? (
        <span className="loading loading-lg"></span>
      ) : (
        <ToursList data={data!} />
      )}
    </>
  )
}
