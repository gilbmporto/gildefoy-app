import ClientIncrementButton from "@/components/ClientIncrementButton"
import { fetchUserTokensById } from "@/utils/actions"
import { UserProfile, auth } from "@clerk/nextjs"
import React from "react"

export default async function ProfilePage() {
  const { userId } = auth()
  const tokens = await fetchUserTokensById(userId!)

  return (
    <div className="flex justify-center flex-col">
      <div className="mb-8 ml-8 flex flex-col sm:flex-row gap-4 items-center mt-4">
        <ClientIncrementButton userId={userId!} />
        <h2 className="text-xl font-extrabold flex gap-2">
          Token Amount left to use: <span>{tokens}</span>
        </h2>
      </div>
      <UserProfile />
    </div>
  )
}
