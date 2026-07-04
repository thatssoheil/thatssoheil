// Declare NEXT_PUBLIC_* env vars that are inlined at build time by Next.js.
// These are NOT available at runtime — they are baked into the client bundle
// at build time. The source value is an env var set in the build environment.
declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_ENABLE_CHAT?: string
    }
}