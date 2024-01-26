"use client"
import React, { useEffect } from "react"
import { BsMoonFill, BsSunFill } from "react-icons/bs"
import { useState } from "react"

const themes = {
  cupcake: "cupcake",
  dracula: "dracula",
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(themes.cupcake)

  function toggleTheme() {
    const otherTheme =
      theme === themes.cupcake ? themes.dracula : themes.cupcake
    document.documentElement.setAttribute("data-theme", otherTheme)
    setTheme(otherTheme)
  }

  return (
    <button className="btn btn-outline btn-sm" onClick={toggleTheme}>
      {theme === "cupcake" ? (
        <BsMoonFill className="h-5 w-5" />
      ) : (
        <BsSunFill className="h-5 w-5" />
      )}
    </button>
  )
}
