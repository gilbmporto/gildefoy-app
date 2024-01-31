"use server"

import { Message } from "@/components/Chat"
import { TourData } from "@/components/NewTour"
import OpenAI from "openai"
import prisma from "./db"
import { User } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ChatCompletionMessage } from "openai/resources/index.mjs"

const openAIModels = {
  gpt35: "gpt-3.5-turbo-1106",
  gpt4: "gpt-4-1106-preview",
}

export type SearchObject = {
  userId: string
  city?: string
  country?: string
}

export type TourJSON = {
  id?: string
  city: string
  country: string
  title: string
  description: string
  stops: string[]
}

export type AllToursJSON = {
  id?: string
  city: string
  country: string
  title: string
  description: string
  stops: string[]
  price: string
  style: string
  daytime: string
}

export type CompleteTourData = {
  city: string
  country: string
  title: string
  description: string
  stops: string[]
  price: string
  style: string
  daytime: string
  userId: string
}

const openai = new OpenAI({
  apiKey: process.env.GILDEFOY_GPT_API_KEY,
})

export const generateChatResponse = async (
  messages: Message[],
  userId: string
) => {
  try {
    // Check if user has enough tokens left
    const tokens = await prisma.token.findUnique({
      where: { clerkId: userId },
    })

    if (tokens && tokens.tokens < 300) {
      const tokensWarningMessage: ChatCompletionMessage = {
        content: `You don't have enough tokens left!`,
        role: "system",
      }

      return {
        message: tokensWarningMessage,
        tokens: tokens.tokens,
      }
    }

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You're a helpful assistant",
        },
        ...messages,
      ],
      model: openAIModels.gpt35,
      temperature: 0.7,
      max_tokens: 500,
    })

    const tokensLeft = await subtractTokensFromUser(
      userId,
      response.usage?.total_tokens!
    )

    return {
      message: response.choices[0].message!,
      tokens: tokensLeft?.tokens!,
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function createNewUser(user: User) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  })
  if (existingUser) {
    return "User already exists"
  } else {
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })

    return newUser
  }
}

export async function fetchUserTokensById(userId: string) {
  try {
    const tokens = await prisma.token.findUnique({
      where: {
        clerkId: userId,
      },
    })
    return tokens?.tokens
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function generateTokensForUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (user) {
      const tokens = await prisma.token.create({
        data: {
          clerkId: userId,
        },
      })
      return { user, tokens }
    } else {
      return null
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function fetchOrGenerateTokens(userId: string) {
  try {
    const result = await fetchUserTokensById(userId)
    if (result) {
      return result
    } else {
      const result = await generateTokensForUser(userId)
      return result?.tokens.tokens
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function incrementUserTokens(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (user) {
      const tokensRecord = await prisma.token.findUnique({
        where: {
          clerkId: userId,
        },
      })

      if (!tokensRecord) {
        return null
      }

      let multiplier = 1
      const defaultTokenAmount = 1000
      const maxMultiplier = 7

      if (tokensRecord.TokensEndedTimestamp) {
        const daysPassed = Math.floor(
          (Math.floor(Date.now() / 1000) - tokensRecord.TokensEndedTimestamp) /
            (60 * 60 * 24)
        )
        multiplier = Math.min(daysPassed, maxMultiplier)
      }

      const tokensToIncrement = defaultTokenAmount * multiplier

      const tokens = await prisma.token.update({
        where: {
          clerkId: user.id,
        },
        data: {
          tokens: {
            increment: tokensToIncrement,
          },
          tokensEnded: false,
        },
      })

      return tokens
    } else {
      return null
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function allowToIncrementUserTokens(userId: string) {
  try {
    const tokens = await prisma.token.findUnique({
      where: {
        clerkId: userId,
      },
    })

    console.log(tokens)

    if (
      tokens &&
      tokens.tokens < 300 &&
      tokens.tokensEnded &&
      tokens.TokensEndedTimestamp &&
      tokens.TokensEndedTimestamp + 86400 < Math.floor(Date.now() / 1000)
    ) {
      return true
    } else {
      return false
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function subtractTokensFromUser(userId: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (user) {
      const tokens = await prisma.token.update({
        where: {
          clerkId: user.id,
        },
        data: {
          tokens: {
            decrement: amount,
          },
        },
      })

      revalidatePath("/profile")

      if (tokens.tokens < 300 && !tokens.tokensEnded) {
        const updatedToken = await prisma.token.update({
          where: {
            clerkId: user.id,
          },
          data: {
            tokensEnded: true,
            TokensEndedTimestamp: Math.floor(Date.now() / 1000),
          },
        })

        revalidatePath("/profile")
        return updatedToken
      }

      return tokens
    } else {
      return null
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export const getSingleTour = async (tourId: string) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: {
        id: tourId,
      },
    })
    if (!tour) {
      return null
    }
    return tour as AllToursJSON
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export const getAllTours = async ({ userId, city, country }: SearchObject) => {
  try {
    // Step 1: Get Tour IDs that match the criteria
    let tourWhereClause = {}
    if (city || country) {
      tourWhereClause = {
        OR: [
          ...(city ? [{ city: { contains: city, mode: "insensitive" } }] : []),
          ...(country
            ? [{ country: { contains: country, mode: "insensitive" } }]
            : []),
        ],
      }
    }

    const matchingTours = await prisma.tour.findMany({
      where: tourWhereClause,
      select: {
        id: true, // Select only the IDs
      },
    })

    const tourIds = matchingTours.map((tour) => tour.id)

    // Step 2: Use these IDs to find UserTour records
    const userTours = await prisma.userTour.findMany({
      where: {
        userId: userId,
        tourId: { in: tourIds }, // Filter UserTour records by these tour IDs
      },
      include: {
        tour: {
          select: {
            id: true,
            city: true,
            country: true,
            title: true,
            description: true,
            stops: true,
            price: true,
            style: true,
            daytime: true,
          },
        },
      },
    })

    if (userTours.length === 0) {
      return null
    }

    return userTours.map((userTour) => userTour.tour) as AllToursJSON[]
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export const getExistingTour = async ({
  city,
  country,
  price,
  style,
  daytime,
  userId,
}: TourData) => {
  try {
    const existingTour = await prisma.tour.findFirst({
      where: {
        city,
        country,
        price,
        style,
        daytime,
      },
      select: {
        id: true,
        city: true,
        country: true,
        title: true,
        description: true,
        stops: true,
      },
    })

    if (existingTour) {
      // Check if the user is already associated with this tour
      const existingUserTour = await prisma.userTour.findUnique({
        where: {
          userId_tourId: {
            userId: userId,
            tourId: existingTour.id,
          },
        },
      })

      // If not, create a new UserTour association
      if (!existingUserTour) {
        await prisma.userTour.create({
          data: {
            userId: userId,
            tourId: existingTour.id,
          },
        })
      }

      return existingTour as TourJSON
    } else {
      return null
    }
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export const createNewTour = async (tour: CompleteTourData) => {
  try {
    console.log("====== TOUR DATA ======")
    console.log(tour)
    console.log("====== TOUR DATA ======")
    // Create the new Tour without linking to a User
    const newTour = await prisma.tour.create({
      data: {
        city: tour.city!,
        country: tour.country!,
        title: tour.title!,
        description: tour.description!,
        stops: tour.stops!,
        price: tour.price!,
        style: tour.style!,
        daytime: tour.daytime!,
      },
      select: {
        id: true,
        city: true,
        country: true,
        title: true,
        description: true,
        stops: true,
      },
    })

    // Create a UserTour record to link the tour with the user
    await prisma.userTour.create({
      data: {
        userId: tour.userId,
        tourId: newTour.id,
      },
    })

    return newTour as TourJSON
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export const generateTourImage = async ({
  city,
  country,
}: {
  city: string
  country: string
}) => {
  try {
    const tourImage = await openai.images.generate({
      prompt: `a panaromic view of the city of ${city} in ${country}`,
      n: 1,
      size: "512x512",
    })
    return tourImage?.data[0]?.url!
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export const generateTourResponse = async ({
  city,
  country,
  price,
  style,
  daytime,
  userId,
}: TourData) => {
  console.log("=== USER ID ===")
  console.log(userId)
  console.log("=== USER ID ===")

  const query = `Find a exact ${city} in this exact ${country}.
If ${city} and ${country} exist, create a list of things to do on ${
    daytime ? daytime : `night`
  } time on the most ${
    price ? price : `noble`
  } neighborhood in this ${city},${country} ${
    style === "alone" || undefined ? null : `with your ${style}`
  }. 
Once you have a list, create a one-day tour and always give the names of restaurants / pubs / night clubs on every 'stop' paragraph. 
The Response should be in the following JSON format: 
{
  "tour": {
    "city": "${city}",
    "country": "${country}",
    "title": "title of the tour",
    "description": "short description of the city and tour",
    "stops": ["stop name", "stop name", "stop name"]
  }
}
"stops" property should include only three stops and each stop MUST be only a string.
If you can't find info on exact ${city}, or ${city} does not exist, or it's population is less than 1, or it is not located in the following ${country}, return { "tour": null }, with no additional characters.
Also, if the country is "Brazil" or "Brasil", return the answer in brazilian portuguese`

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "you are a tour guide" },
        { role: "user", content: query },
      ],
      model: openAIModels.gpt4,
      temperature: 0.7,
    })

    console.log("======= RESPONSE =======")
    console.log(response.choices[0].message)
    console.log("======= RESPONSE =======")

    // Find the JSON part of the response or use the whole response
    const jsonRegex = /```json\n([\s\S]*?)\n```/
    const match = response.choices[0].message.content!.match(jsonRegex)

    let tourData
    let jsonString

    if (match && match[1]) {
      // Extract and clean the JSON string from the matched group
      jsonString = match[1].trim()
    } else {
      // Use the whole response content as JSON string
      jsonString = response.choices[0].message.content!.trim()
    }

    console.log(`JSON String: ${jsonString}`)
    tourData = JSON.parse(jsonString)

    if (!tourData.tour) {
      return null
    }

    const tourFinalData: CompleteTourData = {
      city,
      country,
      title: tourData.tour.title,
      description: tourData.tour.description,
      stops: tourData.tour.stops,
      price: price || "",
      style: style || "",
      daytime: daytime || "",
      userId: userId,
    }

    return { tour: tourFinalData, tokens: response.usage?.total_tokens }

    // const newTour = await createNewTour(tourFinalData)

    // return newTour as TourJSON
  } catch (error: any) {
    console.log(`${error.name}: ${error.message}`)
    return null
  }
}

export async function deleteTour(tourId: string) {
  try {
    await prisma.userTour.deleteMany({
      where: {
        tourId: tourId,
      },
    })

    await prisma.tour.delete({
      where: {
        id: tourId,
      },
    })
    console.log(`Tour with ID ${tourId} deleted successfully.`)
  } catch (error) {
    console.error("Error deleting tour:", error)
  } finally {
    await prisma.$disconnect()
  }
}
