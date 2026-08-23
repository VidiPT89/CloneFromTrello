# 🗂️ Clone from Trello

> Bilingual Kanban boards with live drag-and-drop, assignees, attachments, comments and an activity log, painted in the ividi.dev palette (black, burnt orange, amber).

[🐞 Report Bug](https://github.com/VidiPT89/CloneFromTrello/issues) · [✨ Request Feature](https://github.com/VidiPT89/CloneFromTrello/issues)

QUADRO is a Next.js editorial desk: boards, lists and cards you can drag across lanes while other sessions stay in sync. Assignees, file attachments, comments and a board activity stream sit on each card. The UI is European Portuguese / English, with the language toggle remembered in `localStorage`. Live updates go through Pusher when keys are set, or Server-Sent Events on a single machine.

## ✨ Main Features

- 📋 **Boards, lists and cards** — create desks, lanes and work items
- 🧲 **Live drag-and-drop** — reorder lists and move cards, including across lanes
- 👥 **Assignees** — pick a member identity and attach people to a card
- 📎 **Attachments** — store files under `public/uploads`
- 💬 **Comments** — threaded notes on each card
- 📜 **Activity history** — creates, moves, assigns, comments and attachments
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🎬 **Motion** — grain, ember glow and staggered lanes

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Pusher](https://img.shields.io/badge/Pusher-optional-300D4F?style=flat&logo=pusher&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Pages and API routes |
| **Data** | Prisma + PostgreSQL | Boards, lists, cards, members, activity |
| **Realtime** | Pusher or SSE | Multi-user board refresh |
| **DnD** | dnd-kit | List and card dragging |
| **Motion** | Framer Motion | Lane reveal |

## 🧱 Project Structure

```text
CloneFromTrello/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/uploads/
├── src/
│   ├── app/                # routes and API
│   ├── components/
│   │   ├── board/
│   │   ├── home/
│   │   └── layout/
│   ├── i18n/
│   └── lib/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- **Docker** (PostgreSQL 16 on port 55434)

### Installation

```bash
git clone https://github.com/VidiPT89/CloneFromTrello.git
cd CloneFromTrello
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Pusher is optional. Leave those keys empty to keep live updates on Server-Sent Events for this process. To sync across machines, create a Pusher app and fill `PUSHER_*` and `NEXT_PUBLIC_PUSHER_*`.

## 📖 Usage

1. Toggle **PT** or **EN** in the header.
2. Open a board or create a new one.
3. Choose **I am** to pick your member identity.
4. Drag lists and cards. Open a card to assign people, comment and attach files.
5. Watch the activity stream at the bottom of the board.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST | `/api/boards` | List and create boards |
| GET | `/api/boards/:id` | Full board payload |
| POST / PATCH | `/api/lists` | Create a list or reorder lists |
| POST | `/api/cards` | Create a card |
| PATCH / DELETE | `/api/cards/:id` | Update assignees and notes |
| PATCH | `/api/cards/:id/move` | Move and reorder cards |
| POST | `/api/cards/:id/comments` | Add a comment |
| POST | `/api/cards/:id/attachments` | Upload a file |
| GET | `/api/activity?boardId=` | Activity log |
| GET / POST | `/api/members` | Team members |
| GET | `/api/realtime?boardId=` | SSE live channel |

## 🧪 Testing

```bash
npm test
```

`node:test` checks card placement inside a lane.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
