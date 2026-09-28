import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
});

async function testGemini() {
    try {
        console.log("🚀 Testing Gemini API...");

        console.log(
            "API key loaded:",
            !!process.env.GEMINI_API_KEY
        );

        const response = await llm.invoke(
            "Reply with exactly: Gemini API is working!"
        );

        console.log("\n✅ SUCCESS");
        console.log("Response:");
        console.log(response.content);

    } catch (error) {

        console.error("\n❌ GEMINI API FAILED");

        console.error("Status:", error?.status);
        console.error("Message:", error?.message);
        console.error("Full error:", error);

    }
}

testGemini();