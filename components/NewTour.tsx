"use client"
import React from "react"
import TourInfo from "./TourInfo"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createNewTour,
  fetchUserTokensById,
  generateTourResponse,
  getExistingTour,
  subtractTokensFromUser,
} from "@/utils/actions"
import toast from "react-hot-toast"
import { useAuth } from "@clerk/nextjs"

export const dynamic = "force-dynamic"
export const maxDuration = 45

export type TourData = {
  city: string
  country: string
  price?: string
  style?: string
  daytime?: string
  userId: string
}

export default function NewTour() {
  const queryClient = useQueryClient()
  const { userId } = useAuth()
  const {
    mutate,
    isPending,
    data: tour,
  } = useMutation({
    mutationFn: async (data: TourData) => {
      let timeItStarted = Math.floor(Date.now() / 1000)
      const existentTour = await getExistingTour(data)
      if (existentTour) {
        return existentTour
      }

      const currentUserTokens = await fetchUserTokensById(userId!)

      if (currentUserTokens && currentUserTokens < 300) {
        toast.error("Not enough tokens!")
        console.log(
          "Time required to display that tokens have ended: ",
          Math.floor(Date.now() / 1000) - timeItStarted
        )
        return
      }

      console.log(
        "Time required to check for existing tour and fetch user tokens: ",
        Math.floor(Date.now() / 1000) - timeItStarted
      )

      const tourAndTokens = await generateTourResponse(data)

      if (!tourAndTokens?.tour) {
        toast.error("This city is not located in this country or doesn't exist")
        console.log(
          "Time required to go until the end: ",
          Math.floor(Date.now() / 1000) - timeItStarted
        )
        return null
      }

      if (tourAndTokens?.tour!) {
        const response = await createNewTour(tourAndTokens.tour)
        console.log(response)
        queryClient.invalidateQueries({ queryKey: ["tours"] })
        const subtractedTokens = await subtractTokensFromUser(
          userId!,
          tourAndTokens?.tokens!
        )
        toast.success(`${subtractedTokens?.tokens!} tokens remaining!`)
        console.log(
          "Time required: ",
          Math.floor(Date.now() / 1000) - timeItStarted
        )
        return response
      }
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const destination = Object.fromEntries(formData.entries()) as TourData

    destination.city = capitalizeFirstLetter(destination.city)
    destination.country = capitalizeFirstLetter(destination.country)

    if (!destination.price || !destination.style || !destination.daytime) {
      toast.error("Please select all options")
      return
    }

    const destinationWithUserId = {
      ...destination,
      userId,
    } as TourData

    console.log(destinationWithUserId)
    console.log("Now we're going to mutate...")
    mutate(destinationWithUserId)
  }

  function capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
        <span className="loading loading-lg"></span>
      </div>
    )
  }

  // async function handleClick() {
  //   const testTour = await testCreateNewTour()
  //   console.log(testTour)
  // }

  // console.log(tour)

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <h2 className="mb-4">Select where you want to go:</h2>
        <div className="join join-vertical lg:join-horizontal w-full">
          <input
            type="text"
            placeholder="City..."
            className="input input-bordered join-item w-full pl-4"
            name="city"
            required
          />
          <input
            type="text"
            placeholder="Country..."
            className="input input-bordered join-item w-full pl-4"
            name="country"
            required
          />
          <select
            name="price"
            id="price"
            className="join-item input-bordered select w-full"
            defaultValue={"Price?"}
            required
          >
            <option disabled>Price?</option>
            <option value="cheap">Cheap</option>
            <option value="medium">Medium</option>
            <option value="noble">Noble</option>
            <option value="expensive">Expensive</option>
          </select>
          <select
            name="style"
            id="style"
            className="join-item input-bordered select w-full"
            defaultValue={"Style?"}
            required
          >
            <option disabled>Style?</option>
            <option value="alone">Alone</option>
            <option value="friends">With Friends</option>
            <option value="family">With Family</option>
            <option value="romantic date">Date</option>
          </select>
          <select
            name="daytime"
            id="daytime"
            className="join-item input-bordered select w-full"
            defaultValue={"Daytime?"}
            required
          >
            <option disabled>Daytime?</option>
            <option value="day">Day (Morning/Afternoon)</option>
            <option value="night">Night</option>
          </select>
          <button className="btn btn-primary join-item" type="submit">
            Generate tour
          </button>
        </div>
      </form>
      <div className="mt-16">{tour ? <TourInfo tour={tour} /> : null}</div>
    </>
  )
}
