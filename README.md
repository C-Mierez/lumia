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
- Tailwind V4

--- Local:

- Ngrok: Local development tunnel for Clerk webhooks
- [Concurrently](https://github.com/open-cli-tools/concurrently): Run multiple commands concurrently (NexJS + Ngrok)

### Features

- [ ] User-uploaded videos
- [ ] Custom-built video player
- [ ] Real-time video processing (Mux)
- [ ] Video thumbnail generation
- [ ] Video playlist creation and management
- [ ] Channel subscriptions
- [ ] Video comments and likes system

--- Tech

- [ ] Clerk Auth synchronization to local own db though Webhooks (Svix verification)
- [ ] Authenticated server component prefetching through tRPC v11's support for server-side calls
- [ ] Vercel KV (Upstash) Redis service for request rate limiting
