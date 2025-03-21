# Lumia

A Youtube-inspired video-sharing website.

> This is mock website for practice purposes.

### Tech

- NextJS
- React 19
- tRPC v11
- Drizzle
- Neon DB
- Mux
- Clerk Auth
- Svix Webhook
- Upstash Redis + Ratelimit
- Upstash Workflow
- Google Gemini 2.0 API
- Cloudflare Workers AI
- Tailwind V4

--- Local:

- Ngrok: Local development tunnel for Clerk webhooks
- [Concurrently](https://github.com/open-cli-tools/concurrently): Run multiple commands concurrently (NextJS + Ngrok)

### Features

- [x] User-uploaded videos (With managed details, categories, tags, etc)
- [ ] Custom-built video player
- [x] Video processing service (Mux)
- [ ] Video playlist creation and management
- [x] Channel subscriptions
- [x] Video comments and likes system
- [x] AI-Generation tools for the user to use (Video title, description, thumbnail)
- [x] Real-time status updates for long-running tasks using SSE

--- Tech

- [x] Use of Redis KV service as event channel for communication between Workflows and tRPC subscription endpoints. This allows real-time status tracking of the state of workflows for the client.
- [x] Using NextJS Parallel Routes and Route Intercepting for the creation of Router-compliant modals
- [x] Clerk Auth synchronization to local own db though Webhooks (Svix verification)
- [x] Authenticated server component prefetching through tRPC v11's support for server-side calls
- [x] Vercel KV (Upstash) Redis service for request rate limiting
- [x] Implementation of Background Jobs using Upstash Workflow for dealing with long-running tasks, such as AI-generation requests

### TODO

- [ ] Make admin-made Categories for homepage filters. Make user-made Tags for videos
    - [ ] Keep track of the amount a times a Tag is used on videos (Increment and Decrement accordingly in db table). Use this metric to show the most popular tags as a search filter.
- [ ] Clean up Modal implementation with a reusable hook for managing modal state.
- [ ] Verify proper state handling in video update form (Not disabling the user while fetching status)
- [ ] Add a way to go to user's profile
- [ ] Make a DB trigger to automatically create a default Watch Later playlist for the user on creation

---
