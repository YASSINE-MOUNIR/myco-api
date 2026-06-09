import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, prompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Convert base64 to buffer for Gemini
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const mimeType = "image/jpeg"; // Adjust if needed

    const response = await model.generateContent([
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType,
        },
      },
      prompt ||
        "Analyze this mushroom image. Identify the species, health status, and any issues visible.",
    ]);

    const result = await response.response;
    const text = result.text();

    return res.status(200).json({
      success: true,
      analysis: text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "Failed to analyze image",
      message: error.message,
    });
  }
}
