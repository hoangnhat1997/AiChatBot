import slugs from "./slugs.js";
import { generateEmbedding } from "./embedding.js";
import supabase from "./supabase.js";
import dotenv from "dotenv";
import { parseExpoDocs } from "./parseExpoDocs.js";

dotenv.config();

const handleDoc = async (slug) => {
  const data = await parseExpoDocs(slug);

  // Generate vector

  const vector = await generateEmbedding(data.body);

  // Save vector to Supabase

  const { error } = await supabase
    .from("docs")
    .insert([
      {
        id: slug,
        title: Date.now(),
        url: `https://docs.expo.dev/${slug}`,
        vector: vector,
      },
    ])
    .select();

  console.log(error);
};

const handleAllDocs = async () => {
  await Promise.all(slugs.map((slug) => handleDoc(slug)));
};

handleAllDocs();
