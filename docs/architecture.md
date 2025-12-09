# Architecture Documentation

## High-Level Overview
The application is a **Client-Side Single Page Application (SPA)** built with React. It follows a linear, wizard-like flow where state is accumulated through multiple steps and finally sent to the Gemini AI API to generate a structured result.

## Directory Structure
```
/
├── components/         # UI Components
│   ├── Assessment*.tsx # Step-specific forms (Digital, Soft Skills, SWOT)
│   ├── PDPView.tsx     # Final dashboard and result view
│   ├── ProfileForm.tsx # Initial user data capture
│   └── StepIndicator.tsx # Progress navigation
├── services/
│   └── geminiService.ts # API interactions with Google GenAI
├── docs/               # Documentation
├── App.tsx             # Main container & State Manager
├── types.ts            # TypeScript interfaces
├── constants.ts        # Static data (MBTI types, Leadership styles)
└── index.html          # Entry point (Tailwind config, Fonts)
```

## State Management
The application uses **Local Component State** lifted up to `App.tsx` to manage the session data. There is no global state library (Redux/Zustand) as the scope is contained within a single user session.

### Core State Objects (`App.tsx`)
1.  **`profile`**: User identity, goal, MBTI, motivation.
2.  **`digitalAudit`**: Scores for JISC framework categories.
3.  **`softSkills`**: Scores for core skills + dynamic `custom` skills array.
4.  **`swot`**: Strings for S, W, O, T.
5.  **`pdpResult`**: The JSON response from Gemini containing the generated goals.

## Data Flow
1.  **Input Phase**: User moves through steps (`profile` -> `digital` -> `softskills` -> `swot`). Data is aggregated in parent state.
2.  **AI Enrichment (Intermediate)**:
    *   *Transition to Soft Skills*: `generateCareerSkills` calls Gemini to fetch role-specific skills based on `careerGoal`.
    *   *SWOT Phase*: `generateSwotSuggestions` analyzes current inputs to suggest SWOT points.
3.  **Generation Phase**:
    *   All accumulated state is passed to `generatePDP` in `geminiService.ts`.
    *   A complex prompt is constructed including the "Arden" persona instructions.
    *   Gemini returns a structured JSON object.
4.  **Review Phase**:
    *   `PDPView` renders the JSON data.
    *   User submits the entire plan for review.
    *   `evaluateActionPlan` sends the full list to Gemini for a text-based executive summary.

## AI Integration (`services/geminiService.ts`)
We use the **Google GenAI SDK** with `gemini-2.5-flash` for low latency and high JSON reliability.

*   **Structured Output**: We heavily utilize `responseSchema` and `responseMimeType: "application/json"` to ensure the AI returns data that can be directly mapped to our UI components without complex parsing logic.
*   **Prompt Engineering**: Prompts are designed to act as a "Consultant," taking raw audit data and synthesizing it into strategic advice.

## Styling Architecture
*   **Tailwind CSS**: Utility-first styling.
*   **Configuration**: The `tailwind.config` in `index.html` extends the theme with specific brand colors (`arden-navy`, `arden-teal`, etc.) and font families to ensure consistency without hardcoding hex values in components.