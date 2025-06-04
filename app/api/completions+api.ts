import { prisma } from "../../lib/prisma";
import { verifyAuth, createAuthErrorResponse } from "../../lib/auth-middleware";

export async function POST(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    const body = await request.json();
    const { habitId, completedAt, notes } = body;

    if (!habitId) {
      return new Response(JSON.stringify({ error: "Habit ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the habit belongs to the authenticated user
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: auth.userId,
      },
    });

    if (!habit) {
      return new Response(
        JSON.stringify({ error: "Habit not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the completion
    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        notes,
      },
    });

    // Update the habit's streak count and last completed
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        streakCount: habit.streakCount + 1,
        lastCompleted: completion.completedAt,
      },
    });

    return new Response(JSON.stringify(completion), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating completion:", error);

    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return createAuthErrorResponse(error.message);
    }

    return new Response(
      JSON.stringify({ error: "Failed to create completion" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const all = url.searchParams.get("all");

    let completions;

    if (all === "true") {
      // Get all completions for the authenticated user
      completions = await prisma.habitCompletion.findMany({
        where: {
          habit: {
            userId: auth.userId,
          },
        },
        include: {
          habit: true,
        },
        orderBy: {
          completedAt: "asc",
        },
      });
    } else {
      // Get today's completions by default
      const today = date ? new Date(date) : new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      completions = await prisma.habitCompletion.findMany({
        where: {
          habit: {
            userId: auth.userId,
          },
          completedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          habit: true,
        },
      });
    }

    return new Response(JSON.stringify(completions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching completions:", error);

    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return createAuthErrorResponse(error.message);
    }

    return new Response(
      JSON.stringify({ error: "Failed to fetch completions" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
