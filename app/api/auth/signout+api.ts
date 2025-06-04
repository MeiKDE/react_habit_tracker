export async function POST(request: Request) {
  try {
    // In JWT-based authentication, logout is typically handled client-side
    // by removing the token from storage. However, we can provide a consistent API.

    // For enhanced security, you could maintain a token blacklist in the database
    // or implement token refresh mechanisms, but for simplicity, we'll just return success

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Signout error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
