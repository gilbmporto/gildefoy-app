import React from "react"
import { AiOutlineCompass } from "react-icons/ai"
import ThemeToggle from "./ThemeToggle"

export default function SidebarHeader() {
  return (
    <div className="flex items-center mb-4 gap-4 px-4">
      <AiOutlineCompass className="w-10 h-10 text-primary" />
      <h1 className="text-xl font-bold mr-auto">Gildefoy</h1>
      <ThemeToggle />
    </div>
  )
}
