# Hospitour Career Consultant

## Overview
**Hospitour Career Consultant** is a gamified, AI-powered web application designed to help students and professionals in the Hospitality & Tourism sector develop a comprehensive Personal Development Plan (PDP).

By triangulating data from personality assessments (MBTI), leadership styles, digital capability audits (JISC), and soft skills assessments, the app uses Google's Gemini AI to generate tailored, SMART strategic objectives.

## Key Features
*   **Profile Building**: Captures career goals, MBTI personality type, and leadership style.
*   **JISC Digital Audit**: Interactive assessment of digital capabilities (Proficiency, Identity, Wellbeing, etc.).
*   **Soft Skills Audit**: Self-assessment of core management skills (Delegation, Coaching, Planning) with dynamic AI-suggested skills based on career goals.
*   **SWOT Analysis**: A strategic framework for analyzing Strengths, Weaknesses, Opportunities, and Threats, supported by AI-generated suggestions.
*   **Visual Planner Dashboard**: A "Dream Career" visualization board summarizing the user's vision.
*   **AI-Generated PDP**: Automatic generation of SMART objectives (Specific, Measurable, Achievable, Realistic, Time-bound).
*   **Expert Consultant Feedback**: AI-powered executive summary providing holistic feedback on your Action Plan.

## Tech Stack
*   **Frontend**: React (v19), TypeScript, Vite
*   **Styling**: Tailwind CSS (Custom "Arden" color palette)
*   **Icons**: Lucide React
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK
*   **Fonts**: Inter (Sans) & Playfair Display (Serif)

## Color Palette (Arden Theme)
*   **Navy**: `#003359` (Primary Brand)
*   **Teal**: `#4ABfac` (Secondary/Highlight)
*   **Yellow**: `#FDB714` (Accents/Soft Skills)
*   **Blue Grey**: `#EAF2F5` (Backgrounds)
*   **Grey**: `#4D5156` (Text)

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env` file and add your Gemini API Key:
    ```
    API_KEY=your_google_genai_api_key
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Usage Flow
1.  **Profile**: Enter name, career goal, and motivation.
2.  **Digital Audit**: Rate capabilities across 6 JISC dimensions.
3.  **Soft Skills**: Rate core skills; AI suggests extra skills based on your goal.
4.  **SWOT**: Input internal/external factors; use AI to brainstorm.
5.  **Results**: View the Visual Dashboard and the generated SMART Action Plan.