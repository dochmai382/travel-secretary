// /js/supabase.js 파일 생성
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "frqevnyaghrnmtccnerc";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycWV2bnlhZ2hybm10Y2NuZXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTk4MDIsImV4cCI6MjA1NDgzNTgwMn0.1ITu6ie5GxJE_mf_a-G5kblLoY_5kYStt6EBxf8drPQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
