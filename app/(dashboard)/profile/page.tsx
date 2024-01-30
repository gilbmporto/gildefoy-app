import ClientIncrementButton from "@/components/ClientIncrementButton"
import {
  allowToIncrementUserTokens,
  fetchUserTokensById,
  incrementUserTokens,
} from "@/utils/actions"
import { UserProfile, auth } from "@clerk/nextjs"
import React from "react"
import toast from "react-hot-toast"

export default async function ProfilePage() {
  const { userId } = auth()
  const tokens = await fetchUserTokensById(userId!)

  return (
    <div className="flex justify-center flex-col">
      <div className="mb-8 ml-8 flex gap-4 items-center">
        <ClientIncrementButton userId={userId!} />
        <h2 className="text-xl font-extrabold">
          Token Amount left to use: {tokens}
        </h2>
      </div>
      <UserProfile />
    </div>
  )
}
