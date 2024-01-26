import TourInfo from "@/components/TourInfo"
import {
  AllToursJSON,
  TourJSON,
  generateTourImage,
  getSingleTour,
} from "@/utils/actions"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import React from "react"

const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`

export default async function TourPage({ params }: { params: { id: string } }) {
  const singleTourData = (await getSingleTour(params.id)) as AllToursJSON

  if (!singleTourData) {
    redirect("/tours")
  }

  const { city, daytime } = singleTourData

  // This way down below was generating an AI image from GPT and
  // was way too expensive

  // const tourImage = await generateTourImage({ city, country })

  const { data } = await axios.get(`${url}${city}-at-${daytime}`)
  const tourImage = data?.results[0]?.urls?.raw

  const singleTourDataJSON = singleTourData as TourJSON

  return (
    <>
      <Link href="/tours" className="btn btn-secondary mb-10">
        Go Back to Tours
      </Link>
      <div className="max-w-3xl flex flex-col items-center">
        {tourImage && (
          <Image
            src={tourImage}
            alt={singleTourData.title}
            className="mx-auto rounded-xl shadow-xl mb-12 h-96 w-96 object-cover"
            width={300}
            height={300}
            priority
          />
        )}
        <TourInfo tour={singleTourDataJSON} />
      </div>
    </>
  )
}
