import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(`${process.env.GOOGLE_API_KEY}`);

export const generateEmbedding = async (input) => {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  const result = await model.embedContent(input);
  const embedding = result.embedding;

  const vector = embedding.values;

  return vector;
};

export const completion = async (prompt) => {
  const chat = genAI
    .getGenerativeModel({ model: "gemini-1.5-flash" })
    .startChat({
      // history: [
      //   {
      //     role: "user",
      //     parts: [
      //       {
      //         text: prompt,
      //       },
      //     ],
      //   },
      // ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

  const result = await chat.sendMessage(prompt);

  const text = result.response.text();
  return text;
};
