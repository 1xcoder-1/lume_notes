# API Rate Limiting

This application implements a robust, professional grade **API Rate Limiting** system to ensure high performance, security, and stability even during peak usage.

The system uses an **intelligent in memory caching mechanism** that prevents bots and malicious users from overwhelming the server, while ensuring that real users always have a smooth experience.

### 🛡️ Why Rate Limiting?

- **Cost Control:** Prevents AI budget depletion from excessive Gemini API requests.
- **Security:** Protects against "Brute Force" password attacks on the login systems.
- **Spam Protection:** Stops bots from creating thousands of notes or sending spam invitations.
- **Performance:** Ensures the app remains fast for all users by preventing database congestion.

---

### 📊 Current API Limits

| Feature                 | Rate Limit          | Protection Target       |
| :---------------------- | :------------------ | :---------------------- |
| **AI Assistant**        | 5 requests / min    | AI Budget & Quote       |
| **Login Attempts**      | 5 attempts / 15 min | Account Security        |
| **Registration**        | 10 per hour         | Database & User Spam    |
| **Public Shared Notes** | 30 views / min      | Bot Scraping & DoS      |
| **Notes Search**        | 20 queries / min    | Database Performance    |
| **Note Creation**       | 10 notes / min      | Database Capacity       |
| **Email verification**  | 1 email / min       | Email Provider Quota    |
| **Images per Note**     | **7 images max**    | Storage & DB Efficiency |

---

### 🚀 Scalability Note

The application is architecture-optimized to handle **dozens of concurrent users** (e.g., 20+ users working simultaneously) with zero latency.

- **Non-Blocking Logic:** Rate limiting runs as a lightweight check before any database or AI operations.
- **Resource Management:** The memory-based limiter automatically cleans itself to prevent memory leaks as the user base grows.
- **Single-Server Ready:** Designed to work perfectly in standard Node.js/Next.js hosting environments.

### 💡 Note for others:

To change a limit, modify the `check(limit, token)` value in the corresponding API route file (e.g., `apps/web/app/api/ai/chat/route.ts`). For largescale distributed deployments (millions of users), consider moving the cache to **Upstash Redis** by updating `lib/rate-limit.ts`.
