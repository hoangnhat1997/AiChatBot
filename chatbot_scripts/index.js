import dotenv from "dotenv";
import fm from "front-matter";
import { createClient } from "@supabase/supabase-js";
import slugs from "./slugs.js";
import { generateEmbedding } from "./embedding.js";

dotenv.config();

const supabase = createClient(
  `${process.env.SUPABASE_URL}`,
  `${process.env.PUBLIC_SUPABASE_KEY}`
);

const parseExpoDocs = async (slug) => {
  const url = `https://raw.githubusercontent.com/expo/expo/main/docs/pages/${slug}.mdx`;
  const response = await fetch(url);
  const content = await response.text();

  const data = fm(content);
  return data;
};

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
