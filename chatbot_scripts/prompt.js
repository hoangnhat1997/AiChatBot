import { parseExpoDocs } from "./docs-parser.js";
import { completion, generateEmbedding } from "./embedding.js";
import supabase from "./supabase.js";

const buildFullPrompt = (query, docsContext) => {
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
const runPrompt = async (query) => {
  const vector = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_docs", {
    query_embedding: vector,
    match_threshold: 0.3,
    match_count: 2,
  });
  const docs = await Promise.all(data.map((doc) => parseExpoDocs(doc.id)));
  const docBoddies = docs.map((doc) => doc.body);
  const content = "".concat(...docBoddies);
  const filledPrompt = buildFullPrompt(query, content);
  const answer = await completion(filledPrompt);
  console.log(answer);
};

runPrompt("How to initialize a project?");
