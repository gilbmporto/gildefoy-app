import React from "react"
import SidebarHeader from "./SidebarHeader"
import NavLinks from "./NavLinks"
import MemberProfile from "./MemberProfile"

export default async function Sidebar() {
  return (
    <div
      className="px-4 w-80 min-h-full bg-base-300 
      py-10 grid grid-rows-[auto,1fr,auto]"
    >
      {/* first row */}
      <SidebarHeader />

      {/* second row */}
      <NavLinks />

      {/* third row */}
      <MemberProfile />
    </div>
  )
}
