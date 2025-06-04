import { prisma } from "../../../lib/prisma";
import {
  verifyAuth,
  createAuthErrorResponse,
} from "../../../lib/auth-middleware";

export async function PUT(request: Request, { id }: { id: string }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    const body = await request.json();
    const { title, description, frequency, streakCount, lastCompleted } = body;

    // First check if the habit exists and belongs to the user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!existingHabit) {
      return new Response(
        JSON.stringify({ error: "Habit not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        title,
        description,
        frequency: frequency?.toUpperCase(),
        streakCount,
        lastCompleted: lastCompleted ? new Date(lastCompleted) : undefined,
      },
    });

    return new Response(JSON.stringify(habit), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating habit:", error);

    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return createAuthErrorResponse(error.message);
    }

    return new Response(JSON.stringify({ error: "Failed to update habit" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: Request, { id }: { id: string }) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);

    // First check if the habit exists and belongs to the user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!existingHabit) {
      return new Response(
        JSON.stringify({ error: "Habit not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.habit.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting habit:", error);

    if (
      error instanceof Error &&
      (error.message === "No token provided" ||
        error.message === "Invalid token")
    ) {
      return createAuthErrorResponse(error.message);
    }

    return new Response(JSON.stringify({ error: "Failed to delete habit" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
