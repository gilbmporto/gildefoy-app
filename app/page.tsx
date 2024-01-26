import { wait } from "@/utils/actions"
import { currentUser, auth } from "@clerk/nextjs"
import Link from "next/link"
import { redirect } from "next/navigation"
import React from "react"

export default async function HomePage() {
  const user = await currentUser()
  if (user) {
    redirect("/chat")
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center border bg-base-300 border-black p-10 rounded-lg shadow-xl">
        <div className="max-w-md lg:max-w-lg">
          <h1 className="text-6xl font-bold text-primary">Gildefoy</h1>
          <p className="py-6 text-lg leading-loose">
            Your expert companion for all times and for everything! Give it a
            try and see for yourself!
          </p>
          <Link href="/chat" className="btn btn-secondary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
