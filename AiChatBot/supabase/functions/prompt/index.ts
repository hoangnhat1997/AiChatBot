// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

console.log("Hello from Functions!")

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fm from "npm:front-matter@4.0.2";

export const parseExpoDocs = async (slug: string) => {
  const url = `https://raw.githubusercontent.com/expo/expo/main/docs/pages/${slug}.mdx`;
  const response = await fetch(url);
  const content = await response.text();

  const data = fm(content);
  return data;
};


const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY'));

export const generateEmbedding = async (input:string) => {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  const result = await model.embedContent(input);
  const embedding = result.embedding;

  const vector = embedding.values;

  return vector;
};

const buildFullPrompt = (query: string, docsContext: string) => {
  const prompt_boilerplate =
    "Answer the question posed in the user query section using the provided context";
  const user_query_boilerplate = "USER QUERY: ";
  const document_context_boilerplate = "CONTEXT: ";
  const final_answer_boilerplate = "Final Answer: ";

  const filled_prompt_template = `
    ${prompt_boilerplate}
    ${user_query_boilerplate} ${query}
    ${document_context_boilerplate} ${docsContext} 
    ${final_answer_boilerplate}`;
  return filled_prompt_template;
};

export const completion = async (prompt: string) => {
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


Deno.serve(async (req) => {

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? "",
    Deno.env.get('SUPABASE_KEY') ?? "",
    );


  const { query } = await req.json()

  const vector = await generateEmbedding(query);

  const { data: similarDocs, error } = await supabase.rpc("match_docs", {
    query_embedding: vector,
    match_threshold: 0.3,
    match_count: 2,
  });

  const docs = await Promise.all(similarDocs.map((doc: any) => parseExpoDocs(doc.id)));
  const docBoddies = docs.map((doc) => doc.body);
  const content = "".concat(...docBoddies);
  const filledPrompt = buildFullPrompt(query, content);
  const answer = await completion(filledPrompt);
  console.log(answer);


  console.log(similarDocs);

  const data = {
    answer
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
