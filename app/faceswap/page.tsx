"use client";

import { useState, useRef } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  userImageUrl?: string;
}

const isImageValid = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export default function ImageGeneratorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  //   const [imageUrl, setImageUrl] = useState("");
  const [userImageUrl, setUserImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userImageUrl) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input || "Generate image",
    };
    setMessages((prev) => [...prev, userMessage]);
    // const string =
    //   "23 yo,full body naked,  exposed, vaginal, cumshot, 1girl, masterpiece, best quality, (photorealistic:1.15)";
    const string =
      "full body exposed naked woman,masterpiece, realistic, life like quality, human like, best quality, perfect lighting, photorealism:1.4, beautiful, best quality, aesthetic, high quality, best quality, 4k, exotic, perfect lighting, masterpiece, symmetric eyes, centered in frame.";
    setIsLoading(true);
    const prompt = input + " " + string;

    try {
      const response = await fetch(
        "https://modelslab.com/api/v6/image_editing/head_shot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: "UIUprIu10B3tIL4bFbGn2W6Yt1Va5n1Pb7OaCrO1YJt2C5y0XvU1Wqzv6iRy",
            prompt: prompt,
            negative_prompt:
              "anime, cartoon, drawing, big nose, long nose, fat, ugly, big lips, big mouth, face proportion mismatch, unrealistic, monochrome, lowres, bad anatomy, worst quality, low quality, blurry",
            face_image: userImageUrl || "",
            width: "512",
            height: "512",
            samples: "1",
            num_inference_steps: "21",
            safety_checker: false,
            base64: false,
            seed: null,
            guidance_scale: 7.5,
            webhook: null,
            track_id: null,
          }),
        }
      );

      setInput("");

      const data = await response.json();
      const imageId = data.id;

      // Fetch the image URL using the image ID
      const fetchHeaders = new Headers();
      fetchHeaders.append("Content-Type", "application/json");

      const fetchBody = JSON.stringify({
        key: "UIUprIu10B3tIL4bFbGn2W6Yt1Va5n1Pb7OaCrO1YJt2C5y0XvU1Wqzv6iRy",

        request_id: imageId,
      });

      const fetchRequestOptions: RequestInit = {
        method: "POST",
        headers: fetchHeaders,
        body: fetchBody,
        redirect: "follow" as RequestRedirect,
      };

      let fetchResponse = await fetch(
        "https://modelslab.com/api/v6/images/fetch",
        fetchRequestOptions
      );
      let fetchData = await fetchResponse.json();

      // Wait for the status to be no longer "processing"
      while (fetchData.status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        fetchResponse = await fetch(
          "https://modelslab.com/api/v6/images/fetch",
          fetchRequestOptions
        );
        fetchData = await fetchResponse.json();
      }

      const imageUrl = fetchData?.output[0]; // Use the output URL as the imageUrl

      // Wait until the image URL is valid
      if (imageUrl) {
        const validImage = await isImageValid(imageUrl);
        if (!validImage) {
          throw new Error("Generated image URL is not valid.");
        }
      }

      setIsImageLoading(true);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: imageUrl
          ? "Here's your generated image:"
          : "Image generation failed.",
        imageUrl: imageUrl ? imageUrl : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsLoading(false);
      setIsImageLoading(false);
      setUserImageUrl("");
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-500 underline">
        Face Swap
      </h1>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}>
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}>
              <p>{message.content}</p>
              {message.imageUrl && isImageLoading && (
                <div className="flex justify-center">
                  <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {message.imageUrl && !isImageLoading && (
                <img
                  src={message.imageUrl}
                  alt="Generated image"
                  className="mt-2 rounded-lg max-w-full h-auto"
                  width={512}
                  height={512}
                />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={userImageUrl}
          onChange={(e) => setUserImageUrl(e.target.value)}
          placeholder="Enter image URL..."
          className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Optional: Describe the image you want to generate..."
            className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userImageUrl}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message">
            <SendHorizontal className="w-6 h-6" />
          </button>
        </div>
      </form>
    </main>
  );
}
