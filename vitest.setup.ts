import "@testing-library/jest-dom/vitest";

// Provide dummy Supabase env vars so createClient() does not crash
// during module-level initialization in tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
