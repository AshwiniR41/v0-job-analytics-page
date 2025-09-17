export async function GET() {
  const isMock = String(process.env.MOCK_API).toLowerCase() === "true" || process.env.MOCK_API === "1"
  return Response.json({ mock: isMock })
}
