# 🚗 AutoRent — Because Your Legs Were a Bad Investment

> *"Why walk when you can pay someone else's agency to let you borrow their depreciating asset?"*

---

## What Is This?

A **car rental web application** built with React, Node.js, Express, and a PostgreSQL database that costs more per month than the cars listed on it.

It has two types of users:
- **Customers** — people who are too good for public transport but too broke to own a car
- **Agencies** — people who ARE too good to drive their own cars and instead rent them out to the above group

---

## Features (aka "Things We're Proud Of That Should've Been Default")

- ✅ **Register & Login** — Yes, we made you create an account. No, we will not apologize.
- ✅ **Browse Cars** — A list of cars you can almost afford.
- ✅ **Book a Car** — Select your dates, pick how many days you'd like to be anxious about scratches.
- ✅ **My Bookings** — A sobering reminder of your financial decisions.
- ✅ **Cancel a Booking** — For when you realize you're not actually going anywhere.
- ✅ **Agency Dashboard** — For the entrepreneurs among us who bought a car and immediately turned it into a business.
- ✅ **View Customer Bookings** — Agencies stalking their customers, but make it professional.
- ✅ **Real PostgreSQL Database** — Because storing data in a JavaScript array in memory was apparently "not production ready."

---

## Tech Stack (Things We Used So You Don't Have To Understand Them)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Because we hate ourselves but not THAT much |
| Styling | Tailwind CSS | Writing actual CSS is a cry for help |
| Backend | Express.js | It was either this or invent a new framework |
| Database | PostgreSQL (Neon) | A cloud database for a car rental app. We're serious people. |
| ORM | Drizzle | SQL but make it feel like JavaScript soup |
| Auth | express-session + bcrypt | JWT was right there but we chose differently |
| Deployment | Render | It's free. Enough said. |

---

## Getting Started (The Part Nobody Reads)

### Prerequisites

- Node.js (any version that doesn't make you cry)
- pnpm (because npm is for beginners and yarn had a controversy)
- A Neon PostgreSQL URL (and the emotional resilience to manage environment variables)
- The will to live (optional but recommended)

### Installation

```bash
# Clone this masterpiece
git clone <your-repo-url>

# Install 47,000 node_modules that take up more space than your operating system
pnpm install

# Push the schema to your database
pnpm --filter @workspace/db run push

# Start the API server (prepare for silence)
pnpm --filter @workspace/api-server run dev

# Start the frontend (this one actually shows things)
pnpm --filter @workspace/car-rental run dev
```

### Environment Variables

Create a `.env` file or add to secrets. We only need one:

```
DATABASE_URL=postgres://your_neon_url_here_that_you_definitely_saved
SESSION_SECRET=something_more_creative_than_password123
```

---

## Test Accounts

The mock data is gone. The database is real now. Register your own accounts like an adult.

For reference, here's what the mock ones looked like:
- `john@example.com` — a customer named John. Groundbreaking character work.
- `agency@driveeasy.com` — an agency. They rented out 6 cars. We don't know where those cars went.

---

## Deployment on Render

A `render.yaml` file exists at the root. Render will:
1. Install pnpm
2. Build the frontend and backend
3. Start the server
4. Charge you nothing (free tier) until you get popular, then charge you everything

Just set `DATABASE_URL` on Render's dashboard. `SESSION_SECRET` is auto-generated because we trust Render more than we trust you to come up with a secret.

---

## Known Issues

- Users might actually enjoy using this, which was not the intended outcome during 3AM debugging sessions.
- The "available cars" section will be empty until an agency signs up and adds cars. This is a feature. We call it "authenticity."
- No dark mode. We tried. We failed. We moved on.

---

## Architecture (For the 3 People Who Care)

```
Browser
  └── React (Vite) SPA
        └── /api/* → Express.js API Server
                └── Drizzle ORM
                      └── Neon PostgreSQL
                            └── Your actual data
                                  └── Prayers
```

---

## Contributing

Please don't. This project is done. We are done. Everyone needs rest.

But if you *must*:
1. Fork it
2. Break it
3. Open a PR explaining why your version of breaking it is actually better
4. Wait indefinitely

---

## License

MIT — which means you can do whatever you want with this code, and we cannot legally stop you, but we can be disappointed.

---

## Final Words

This app was built with:
- 💙 React components
- ☕ Unhealthy amounts of caffeine
- 🤯 Debugging sessions that questioned the existence of JavaScript
- 🎉 The quiet satisfaction of `[✓] Changes applied` from Drizzle

If this README made you smile, the app will probably make you cry.
If the app made you cry, please file an issue with the subject line: "I trusted you."

---

*AutoRent — We put the 'rent' in 'regret'.*
