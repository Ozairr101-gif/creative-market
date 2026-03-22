import { redirect } from 'next/navigation'

export default async function WeddingVendorBookingRedirectPage({
  params,
}: {
  params: Promise<{ id: string; bookingId: string }>
}) {
  const { bookingId } = await params
  redirect(`/dashboard/bookings/${bookingId}`)
}
