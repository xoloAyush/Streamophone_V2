import { llm } from "../config/langchain.js";

export async function generate(messages) {
    const response = await llm.invoke(messages);

    return response.content;
}