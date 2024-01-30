"use client"
import {
  allowToIncrementUserTokens,
  fetchUserTokensById,
  incrementUserTokens,
} from "@/utils/actions"
import React from "react"
import toast from "react-hot-toast"

export default function ClientIncrementButton({ userId }: { userId: string }) {
  async function handleClick() {
    const isAllowedToIncrement = await allowToIncrementUserTokens(userId!)
    if (isAllowedToIncrement) {
      const response = await incrementUserTokens(userId!)
      toast.success(
        `${response?.tokens!} tokens have been incremented to your account!`
      )
    } else {
      const tokens = await fetchUserTokensById(userId)
      if (tokens && tokens > 300) {
        toast.error(
          "You have to spend your tokens in order to use this feature!"
        )
        return
      }
      toast.error("Wait at least for a day and try again!")
    }
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={handleClick}>
        Increment Tokens
      </button>
    </>
  )
}
