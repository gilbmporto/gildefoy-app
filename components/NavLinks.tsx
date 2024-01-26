import Link from "next/link"
import React from "react"

const links = [
  {
    href: "/",
    label: "home",
  },
  {
    href: "/tours",
    label: "tours",
  },
  {
    href: "/tours/new-tour",
    label: "new tour",
  },
  {
    href: "/profile",
    label: "profile",
  },
]

export default function NavLinks() {
  return (
    <ul className="menu menu-vertical text-base-content max-w-60">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="menu-item capitalize">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
