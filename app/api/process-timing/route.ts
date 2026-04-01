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

  // 2. Safely grab the data the user wants to process
  const body = await req.json();

  const lambdaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process-signal-timing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      "Authorization": `Bearer ${process.env.LAMBDA_SECRET_API_KEY}` 
    },
    body: JSON.stringify({
      ...body,
      userId: session.user.id 
    })
  });

  const data = await lambdaResponse.json();
  

  return NextResponse.json(data);
}
