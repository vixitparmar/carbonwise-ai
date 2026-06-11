# CarbonWise AI

CarbonWise AI is a premium, production-grade, AI-powered carbon footprint tracker and sustainability dashboard. Inspired by clean, minimalist dashboard systems like Notion, Stripe, and Vercel, it allows individuals to log their activities, receive personalized AI recommendations, scan bills/receipts automatically using Gemini AI, and compete in gamified eco-challenges.

---

## 📖 Table of Contents
* [Problem Statement](#-problem-statement)
* [Solution](#-solution)
* [Architecture](#-architecture)
* [Key Features](#-key-features)
* [Folder Structure](#-folder-structure)
* [API Documentation](#-api-documentation)
* [AI Workflow](#-ai-workflow)
* [Installation & Local Setup](#-installation--local-setup)
* [Environment Variables](#-environment-variables)
* [Future Scope](#-future-scope)
* [License](#-license)

---

## 🚨 Problem Statement
Individual daily habits (transit, utility usage, dietary choices, and shopping purchases) compose nearly **70% of global greenhouse emissions**. However, most individuals struggle to understand their personal contribution to climate change because:
1. Carbon footprint math is complex and non-intuitive.
2. Manually calculating emissions from bills and shopping receipts is tedious.
3. Generalized environmental advice fails to adapt to specific user behaviors.
4. Tracking lacks gamification, leading to quick drop-offs in participation.

---

## ✨ Solution
CarbonWise AI bridges the gap between awareness and action:
* **Simplified Tracking**: User logs daily travel (miles/km), power usage (kWh), meals, and waste.
* **Gemini AI Sustainability Coach**: Generates a custom breakdown of the user's primary pollution sources, lists target-reduction suggestions, and forecasts savings.
* **Document Scanner (OCR)**: Upload utility bills or supermarket receipts; Gemini parses details and logs emissions automatically.
* **Eco Gamification**: Earn Green Coins for streaks, complete eco-challenges, and compare standings on a global scoreboard.
* **Resilient Architecture**: Implements a dual connection database manager which connects to MongoDB or falls back to a local JSON file-based database for offline development.

---

## 🏗️ Architecture
```
                                  [ React.js Frontend (Vite + TS) ]
                                                  |
                                                  v  (Axios HTTP Requests)
                                  [ Express.js Backend (Node + TS) ]
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
               [ Gemini AI API ]                               [ DB Manager ]
            (Coaching, OCR, Chat)                                          |
                                                 +-------------------------+-------------------------+
                                                 |                                                   |
                                                 v (Primary)                                         v (Fallback)
                                         [ MongoDB / Mongoose ]                              [ Local JSON File DB ]
```

---

## 🛠️ Key Features
1. **Interactive Dashboard**: Track daily, weekly, and monthly totals, carbon scores, goal completion percentages, and recent logs.
2. **Dynamic Daily Tracker**: Specific forms for travel vehicles, diet types, shopping items, and waste recycling.
3. **AI Chatbot**: Real-time conversational helper answering environmental queries.
4. **Bill & Receipt Scanner**: Drag-and-drop OCR tool extracting electricity usage and grocery items.
5. **Eco Challenges & Streak Tracking**: Streak multipliers, challenge coin redemptions, and high-score rankings.
6. **PDF Reports**: Export printable versions of AI coaching reports.
7. **Premium Design**: Clean white background `#FFFFFF`, subtle borders `#E5E7EB`, Outfit/Inter typography, and premium micro-interactions.

---

## 📡 Offline Mode & Resiliency
CarbonWise AI is designed to run seamlessly even when the backend API server is down or unreachable:
* **Online Mode**: When the backend API is online and running, the login and registration interfaces are fully active, requiring the user to authenticate through standard security endpoints.
* **Offline Fallback**: If the backend server is unreachable or offline, the login screen is bypassed, and the application directly displays the interactive Dashboard with simulated/mock offline datasets. All data mutations are gracefully handled via local mock models to allow zero-configuration UI testing and evaluation.

---

## 📂 Folder Structure
```
CarbonFootprint/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, express port settings
│   │   ├── controllers/     # Route business logic (auth, activities, AI)
│   │   ├── middleware/      # JWT verifiers, rate-limiters
│   │   ├── models/          # Mongoose schema definitions
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Gemini API connectors, local-db fallback services
│   │   ├── utils/           # Carbon calculation maths
│   │   └── app.ts           # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI buttons, card skeletons
│   │   ├── contexts/        # Auth context, Light/Dark theme context
│   │   ├── layouts/         # Dashboard layout (Sidebar / Bottom Nav / Drawer)
│   │   ├── pages/           # Landing, Dashboard, Tracker, Coach, Chat, Scan, Leaderboard
│   │   ├── services/        # Axios API Client
│   │   ├── types/           # TS type definitions
│   │   ├── utils/           # Carbon calculator factors
│   │   ├── App.tsx          # App routes
│   │   └── main.tsx         # Scaffolder root
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new user account | No |
| **POST** | `/api/auth/login` | Log in and receive JWT token | No |
| **GET** | `/api/auth/profile` | Retrieve user profile metadata | Yes |
| **PUT** | `/api/auth/profile` | Update profile settings/goals | Yes |
| **PUT** | `/api/auth/change-password` | Update user password | Yes |
| **POST** | `/api/activities` | Log a carbon footprint activity | Yes |
| **GET** | `/api/activities` | Retrieve logged activities history | Yes |
| **GET** | `/api/activities/stats` | Retrieve aggregated carbon dashboard statistics | Yes |
| **DELETE** | `/api/activities/:id` | Delete an activity log entry | Yes |
| **POST** | `/api/goals` | Create an emission reduction goal | Yes |
| **GET** | `/api/goals` | Retrieve all goals | Yes |
| **POST** | `/api/ai/chat` | Send question to AI assistant | Yes |
| **GET** | `/api/ai/chat/history` | Retrieve chatbot thread history | Yes |
| **GET** | `/api/ai/coach-report` | Generate AI Coach recommendation report | Yes |
| **POST** | `/api/ai/scan-bill` | Scan utility bill (image/pdf) | Yes |
| **POST** | `/api/ai/scan-receipt` | Scan receipt invoice | Yes |
| **GET** | `/api/gamification/challenges` | Retrieve eco challenges list | Yes |
| **POST** | `/api/gamification/claim` | Claim coins for completed challenges | Yes |
| **GET** | `/api/gamification/leaderboard` | Retrieve top ranked users | Yes |

---

## 🤖 AI Workflow
1. **Sustainability Coach**: Extracts a user's activity logs for the past 30 days. Computes a category breakdown and builds a system instruction prompt. Sends data to Gemini, which returns structured JSON recommendations (impact, CO2 savings, timeframe, action items).
2. **Bill OCR / Receipt Scanner**: The user uploads an image/document file. The server reads the file buffer, converts it to base64, and sends it to the multimodal Gemini model (`gemini-1.5-flash`) along with an extraction template prompt. Gemini returns JSON outputs, which the server logs directly to the user's activities record.

---

## 🚀 Installation & Local Setup

### Prerequisite
* Node.js (v18+)
* npm (v9+)
* Optional: MongoDB running locally (port 27017)

### Step 1: Clone and install backend
1. Open a terminal, navigate to `/backend`:
   ```bash
   cd backend
   npm install
   ```
2. Set up environment variables. Duplicate `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Set your `GEMINI_API_KEY`. (If empty, the app runs in **Local AI Fallback Mode**).
4. Run the backend development server:
   ```bash
   npm run dev
   ```

### Step 2: Install and configure frontend
1. Open a new terminal, navigate to `/frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Run Vite dev server:
   ```bash
   npm run dev
   ```

---

## 🔒 Environment Variables
Configure the following keys in your backend `.env` file:
* `PORT`: Port number for Express server (default: `5000`)
* `MONGODB_URI`: Connection URL for MongoDB database (default: `mongodb://localhost:27017/carbonwise`)
* `JWT_SECRET`: Signature key for JWT generation (default: `supersecret_jwt_key_carbonwise_ai`)
* `GEMINI_API_KEY`: API Key generated from Google AI Studio.

---

## 🔮 Future Scope
* **Automated Smart Meter Integration**: Connect directly to utility API endpoints (e.g. Smart Meter Texas) to sync electricity consumption without uploads.
* **IoT Hardware Tracker**: Design a pocket-sized IoT GPS tracker that logs vehicle distances automatically.
* **Corporate Dashboard**: Multi-tenant workspace features for companies seeking to calculate and offset scope 1, 2, and 3 organizational footprints.

---

## 📄 License
This project is licensed under the MIT License.
