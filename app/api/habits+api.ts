import { prisma } from "../../lib/prisma";
import { verifyAuth, createAuthErrorResponse } from "../../lib/auth-middleware";

export async function POST(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    const body = await request.json();
    const { title, description, frequency } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Map frequency string to enum value
    const frequencyEnum = frequency?.toUpperCase() || "DAILY";

    // Create the habit using Prisma
    const habit = await prisma.habit.create({
      data: {
        title,
        description: description || null,
        frequency: frequencyEnum,
        userId: auth.userId,
        streakCount: 0,
      },
    });

    return new Response(JSON.stringify(habit), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating habit:", error);

    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return createAuthErrorResponse(error.message);
    }

    return new Response(JSON.stringify({ error: "Failed to create habit" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    const habits = await prisma.habit.findMany({
      where: {
        userId: auth.userId,
        isActive: true,
      },
      include: {
        completions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(habits), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching habits:", error);

    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return createAuthErrorResponse(error.message);
    }

    return new Response(JSON.stringify({ error: "Failed to fetch habits" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
