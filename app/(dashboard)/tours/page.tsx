import ToursPage from "@/components/ToursPage"
import { getAllTours } from "@/utils/actions"
import { currentUser } from "@clerk/nextjs"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export default async function AllToursPage() {
  const user = await currentUser()

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ["tours", "", ""],
    queryFn: async () => await getAllTours({ userId: user?.id! }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ToursPage />
    </HydrationBoundary>
  )
}
