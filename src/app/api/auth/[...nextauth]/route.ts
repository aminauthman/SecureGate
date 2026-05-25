import handler from "@/lib/auth";

export async function GET(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  return handler(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  return handler(request, context);
}
