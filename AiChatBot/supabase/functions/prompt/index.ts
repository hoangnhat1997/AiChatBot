// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

console.log("Hello from Functions!")

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY'));

export const generateEmbedding = async (input:string) => {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  const result = await model.embedContent(input);
  const embedding = result.embedding;

  const vector = embedding.values;

  return vector;
};

Deno.serve(async (req) => {

  const supabaseKey = createClient(
    Deno.env.get('SUPABASE_URL') ?? "",
    Deno.env.get('SUPABASE_KEY') ?? "",
    );


  const { query } = await req.json()

  const vector = await generateEmbedding(query);
  console.log(vector);

  const data = {
    message: `Hello ${query}!`,
    vectorDimentions: vector.length,
  }


  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/prompt' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
