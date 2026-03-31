// app/api/auth/[...all]/route.ts
// Better Auth Next.js App Router handler — handles all /api/auth/* requests

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
