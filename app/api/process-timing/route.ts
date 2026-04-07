import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Your better-auth instance
import { headers } from 'next/headers';
import dotenv from 'dotenv';
dotenv.config();

export async function POST(req: Request) {
  // 1. Authenticate that the user calling this is logged into Better-Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Safely grab the file data from the multipart request
  const formData = await req.formData();
  
  const lambdaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process-signal-timing`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LAMBDA_SECRET_API_KEY}` 
    },
    body: formData // Forward the multipart/form-data to the Lambda backend
  });

  if (!lambdaResponse.ok) {
    const errorBody = await lambdaResponse.text();
    return NextResponse.json({ error: "Backend error", detail: errorBody }, { status: lambdaResponse.status });
  }

  // Stream the backend response to the frontend for real-time progress updates
  return new Response(lambdaResponse.body, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
