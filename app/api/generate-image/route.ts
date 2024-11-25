import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // TODO: Replace with actual API call to your image generation service
    // This is just a dummy response
    return NextResponse.json({
      imageUrl: "https://via.placeholder.com/512",
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
