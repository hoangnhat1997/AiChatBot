import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  `${process.env.SUPABASE_URL}`,
  `${process.env.PUBLIC_SUPABASE_KEY}`
);

export default supabase;
