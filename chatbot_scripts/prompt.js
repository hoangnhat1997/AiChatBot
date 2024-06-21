import { generateEmbedding } from "./embedding.js";

const runPrompt = async (query) => {
  console.log(query);
  const vector = await generateEmbedding(query);
  console.log(vector);
};

runPrompt("How to initialize a new Expo project?");
