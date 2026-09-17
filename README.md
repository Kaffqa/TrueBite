# TrueBite

![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)
![AI Powered](https://img.shields.io/badge/AI-Gemini_%7C_Groq-FF6F00?style=flat-square)

TrueBite is an advanced, AI-powered food tracking and personalized nutrition assistant. Designed for modern health-conscious individuals, the platform leverages computer vision and large language models to analyze dietary habits, estimate nutritional values, and ensure food safety based on personal medical profiles.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Technical Documentation](#technical-documentation)
    - [System Architecture](#system-architecture)
    - [Database Schema](#database-schema)
    - [Project Structure](#project-structure)
4. [Installation Guide](#installation-guide)
5. [Environment Configuration](#environment-configuration)

---

## Key Features

- **AI-Driven Visual Food Analysis**  
  Utilizing the Gemini and Groq Vision APIs, users can capture or upload images of their meals. The platform accurately identifies the food, estimates portion sizes, and extracts key nutritional data (Calories, Macros, and Micronutrients).
  
- **Personalized Health & Safety Guardian**  
  TrueBite cross-references identified ingredients against the user's specific health profile. It actively flags potential allergens, dietary intolerances, and risks related to preexisting medical conditions.

- **Dynamic Macro Tracking & TDEE Calculation**  
  The system automatically calculates the user's Total Daily Energy Expenditure (TDEE) based on biometric data and lifestyle factors, offering a real-time dashboard to track daily nutritional targets.

- **Intelligent Ingredient Dictionary**  
  An interactive, personalized encyclopedia of ingredients that educates users on the specific health benefits or risks of various food additives and natural ingredients tailored to their unique profile.

---

## Technology Stack

### Frontend Application
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Form Management:** React Hook Form with Zod schema validation
- **Icons:** Phosphor Icons & Lucide React

### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email/Password & Google OAuth)
- **Security:** Strict Row Level Security (RLS) policies

### Artificial Intelligence Services
- **Primary Provider:** Google Gemini API (`gemini-3.6-flash`) for robust multimodal analysis.
- **Alternative Provider:** Groq API (`qwen3.8-27b`, `gpt-oss-120b`) for high-speed, low-latency inference.

---

## Technical Documentation

### System Architecture

TrueBite is constructed as a Single Page Application (SPA). The architecture is highly decoupled, ensuring that UI components, global state, and external API integrations operate independently.

1. **Authentication Flow:** 
   User authentication is securely managed by Supabase. The React client listens to real-time auth state changes and stores the session globally using a robust React Context (`AuthContext`).
   
2. **AI Provider Adapter Pattern:** 
   Located in `src/lib/ai-provider.ts`, the application uses an adapter design pattern to interface with external LLMs. Depending on the environment configuration, the application dynamically instantiates either a `GeminiProvider` or `GroqProvider`. This allows for seamless fallback mechanisms and prevents vendor lock-in.

3. **Strict JSON Parsing:** 
   To maintain structural integrity when communicating with generative AI models, the application enforces strict response schemas (`generationConfig.response_schema`) ensuring that all AI responses map perfectly to internal TypeScript interfaces.

### Database Schema

The PostgreSQL database is hosted on Supabase and is structured into highly optimized tables:

- `profiles`: Stores extensive user demographic data, biometric metrics, health goals, and medical conditions. GIN (Generalized Inverted Index) indexes are applied to array columns (e.g., allergies, conditions) to guarantee performant search queries.
- `food_scans`: Acts as the historical ledger for AI analyses. It logs image URLs, nutritional breakdowns, AI confidence scores, safety warnings, and inference metadata (processing time, model version).

### Project Structure

```text
├── src/
│   ├── components/       # Reusable modular UI components (Auth, Layout, UI primitives)
│   ├── contexts/         # Global state management providers
│   ├── hooks/            # Custom React hooks encapsulating data fetching and local state
│   ├── lib/              # Core utilities, AI providers, and Supabase client
│   ├── pages/            # Top-level route components acting as application views
│   └── types/            # Strict TypeScript definitions and API interfaces
├── supabase/
│   ├── schema.sql           # Database table definitions and triggers
│   └── storage-policies.sql # Security rules for Supabase object storage
├── package.json
└── vite.config.ts
```

---

## Installation Guide

Follow these instructions to deploy a local development environment of TrueBite.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm or yarn
- **Supabase**: An active Supabase project
- **API Keys**: Access keys for Google Gemini Studio or Groq Console

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/TrueBite.git
   cd TrueBite
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Initialization**
   - Navigate to your Supabase project dashboard and open the SQL Editor.
   - Execute the SQL script located at `supabase/schema.sql` to generate the necessary tables and indexes.
   - Execute the script at `supabase/storage-policies.sql` to enforce storage security policies.

4. **Environment Variables**
   Duplicate the example environment file:
   ```bash
   cp .env.example .env
   ```
   *Refer to the Environment Configuration section below to populate the values.*

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Environment Configuration

Your `.env` file must contain the following keys for the application to function correctly. 

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `VITE_SUPABASE_URL` | The REST URL of your Supabase project. | Yes |
| `VITE_SUPABASE_ANON_KEY` | The anonymous public API key for Supabase. | Yes |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key for AI generation. | Yes* |
| `VITE_AI_PROVIDER` | Determines the active AI provider (`gemini` or `groq`). Defaults to `gemini`. | No |
| `VITE_GROQ_API_KEY` | Your Groq API key. Required only if provider is set to `groq`. | No |

*\* Note: At least one AI provider API key must be supplied.*

---

*Documentation generated for technical assessment and repository evaluation.*