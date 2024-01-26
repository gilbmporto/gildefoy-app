import { AllToursJSON } from "@/utils/actions"
import Link from "next/link"
import React from "react"

export default function TourCard({ tour }: { tour: AllToursJSON }) {
  const { id, city, country, title, price, style, daytime } = tour
  return (
    <Link
      href={`/tours/${id}`}
      className="card card-compact rounded-2xl bg-base-100"
    >
      <div className="card-body items-center text-center py-2">
        <h2 className="card-title text-center">{`${city}, ${country}`}</h2>
        <p className="text-center text-lg">{title}</p>
        <p className="card-body text-center flex flex-row justify-between min-w-full">
          <span>Price:</span>{" "}
          <span>
            {price === "cheap"
              ? `💰 Cheap`
              : price === "medium"
              ? `💰💰 Medium`
              : price === "noble"
              ? `💰💰💰 Noble`
              : `💰💰💰💰 Expensive`}
          </span>
        </p>
        <p className="card-body text-center flex flex-row justify-between min-w-full">
          <span>With who:</span>{" "}
          <span>
            {style === "alone"
              ? `🧑 Alone`
              : style === "friends"
              ? `🧑‍🤝‍🧑 Friends`
              : style === "family"
              ? `🧔‍♂️👩🧒 Family`
              : `👩‍❤️‍👨 Date`}
          </span>
        </p>
        <p className="card-body text-center flex flex-row justify-between min-w-full">
          <span>Time:</span>{" "}
          <span>{daytime === "day" ? `🌞 Day` : `🌜 Night`}</span>
        </p>
      </div>
    </Link>
  )
}
