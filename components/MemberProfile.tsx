"use server"
import React from "react"
import { UserButton, auth, currentUser } from "@clerk/nextjs"
import { createNewUser, fetchOrGenerateTokens } from "@/utils/actions"
import { JsonArray } from "@prisma/client/runtime/library"

type User = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  tours?: JsonArray
}

export default async function MemberProfile() {
  const user = await currentUser()

  const newUser: User = {
    id: user?.id!,
    firstName: user?.firstName!,
    lastName: user?.lastName!,
    email: user?.emailAddresses[0].emailAddress!,
  }

  const createdUser = await createNewUser(newUser)

  if (typeof createdUser !== "string") {
    await fetchOrGenerateTokens(createdUser?.id)
  }

  return (
    <div className="px-4 flex items-center gap-3.5">
      <UserButton afterSignOutUrl="/" />
      <p>{user?.emailAddresses[0].emailAddress}</p>
    </div>
  )
}
