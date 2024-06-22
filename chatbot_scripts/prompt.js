import { completion, generateEmbedding } from "./embedding.js";
import supabase from "./supabase.js";

const runPrompt = async (query) => {
  const vector = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_docs", {
    query_embedding: vector,
    match_threshold: 0.3,
    match_count: 2,
  });
  // console.log(error);
  // console.log(data);

  const anwser = await completion("What is 2+2 ?");
  console.log(anwser);
};

runPrompt("How to deploy?");
