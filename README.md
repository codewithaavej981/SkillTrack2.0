🚀 SkillTrack 2.0 — AI-Powered Skill Tracking & Learning Platform

<p align="center">
  <strong>Track your skills. Achieve your goals. Build your future.</strong>
</p><p align="center">
  A full-stack learning platform designed to help students organize their skills, manage learning goals, visualize progress, and receive AI-powered learning recommendations.
</p><p align="center">
  <a href="https://ai-powered-skilltracker.onrender.com">🌐 Live Demo</a> •
  <a href="https://github.com/codewithaavej981/SkillTrack2.0">💻 GitHub Repository</a>
</p>---

🌟 About the Project

SkillTrack 2.0 is a full-stack web application built to make personal skill development more organized, measurable, and effective.

Students learn through college, online courses, tutorials, and practical projects, but keeping track of their skills, learning goals, and progress can be difficult. SkillTrack 2.0 brings these activities together in one place.

The platform combines skill tracking, goal management, learning resources, analytics, downloadable PDF progress reports, and AI-assisted learning recommendations.

🎯 Project Objectives

- Help students maintain a structured record of their technical skills.
- Set learning goals and monitor progress toward achieving them.
- Organize learning resources and learning activities.
- Visualize development through an analytics dashboard.
- Generate downloadable reports to review learning progress.
- Use AI to provide personalized learning suggestions.

✨ Key Features

🔐 Authentication & Security

- User registration and login.
- JWT-based authentication.
- Protected routes and authenticated user experiences.
- User-specific data access.

💻 Skill Tracking

- Manage technical skills in one place.
- Track skill proficiency where supported.
- Review skills and identify areas for improvement.

📚 Learning Management

- Organize learning resources.
- Manage learning activities and progress.
- Build a more structured learning routine.

🎯 Goal Management

- Create and manage learning goals.
- Track goal status and completion.
- Monitor progress toward personal learning objectives.

📊 Dashboard & Analytics

- View key learning statistics.
- Visualize skill proficiency.
- Monitor goal completion.
- Review learning progress through charts and summaries.

🤖 AI-Powered Learning Recommendations

- AI-assisted learning suggestions using the Groq API.
- Personalized guidance to help students decide what to learn next.
- Support for a more focused learning journey.

📄 PDF Progress Reports

- Generate downloadable PDF reports.
- Keep a shareable summary of learning progress.
- Review skills and goals in a report format.

🛠️ Technology Stack

Layer| Technologies
Frontend| React.js, Vite, JavaScript, CSS
Backend| Node.js, Express.js
Database| MongoDB Atlas, Mongoose
Authentication| JSON Web Tokens (JWT)
AI Integration| Groq API
API Communication| REST APIs
Development Tools| Git, GitHub, VS Code
Deployment| Render

🏗️ System Architecture

                ┌────────────────────────┐
                │       Student          │
                └───────────┬────────────┘
                            │
                            ▼
                ┌────────────────────────┐
                │    React + Vite UI     │
                │ Dashboard, Skills,     │
                │ Goals, Learning, PDF   │
                └───────────┬────────────┘
                            │ REST API
                            ▼
                ┌────────────────────────┐
                │   Node.js + Express    │
                │ Routes, Controllers,   │
                │ JWT Authentication     │
                └───────┬────────┬───────┘
                        │        │
                ┌───────▼───┐  ┌─▼────────────────┐
                │ MongoDB   │  │    Groq API      │
                │ Atlas     │  │ AI Recommendations│
                └───────────┘  └──────────────────┘

🔄 How It Works

1. Create an account: Register and sign in to the platform.
2. Track skills: Add technical skills and maintain proficiency information.
3. Set goals: Define learning objectives and track their status.
4. Manage learning: Organize resources and update learning progress.
5. Review analytics: Use the dashboard to understand progress.
6. Get AI guidance: Request AI-assisted learning recommendations.
7. Export progress: Generate a PDF report to keep a record of learning achievements.

🌐 Live Application

Try SkillTrack 2.0:
https://ai-powered-skilltracker.onrender.com

Source Code:
https://github.com/codewithaavej981/SkillTrack2.0

«Note: The live application is hosted on Render. Availability and response time may vary depending on deployment status and hosting behavior.»

💻 Run Locally

Follow these steps to run the project on your computer.

Prerequisites

Install the following:

- "Node.js" (https://nodejs.org/)
- "Git" (https://git-scm.com/)
- A "MongoDB Atlas" (https://www.mongodb.com/atlas) database or compatible MongoDB instance
- A Groq API key if you want to use the AI features

1. Clone the Repository

git clone https://github.com/codewithaavej981/SkillTrack2.0.git
cd SkillTrack2.0

2. Configure the Backend

cd backend
npm install

Create a ".env" file in the backend directory using the variable names and format from "backend/.env.example".

Typical configuration includes:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
GROQ_API_KEY=your_groq_api_key

Use the exact environment variable names expected by the current source code. Do not commit real credentials or production secrets.

Start the backend using the script defined in "backend/package.json". For example:

npm run dev

3. Configure the Frontend

Open a second terminal:

cd frontend
npm install

Create a ".env" file using "frontend/.env.example". Configure the API URL to point to your local backend, following the existing frontend configuration.

For example:

VITE_API_URL=http://localhost:5000

Start the frontend:

npm run dev

Open the local URL printed by Vite in your terminal.

Important: The commands and environment variable names should match the scripts and configuration in the repository. Keep ".env" files containing real credentials out of Git.

🔑 Environment Variables

Variable| Purpose
"PORT"| Backend server port
"MONGODB_URI"| MongoDB connection string
"JWT_SECRET"| Secret used for JWT signing
"GROQ_API_KEY"| API key for AI features
"VITE_API_URL"| Backend API base URL used by the frontend

Only configure variables that the existing application uses. Never expose backend secrets in frontend environment variables or public repositories.

🔒 Security Practices

- Keep API keys and database credentials in server-side environment variables.
- Use authentication middleware for protected endpoints.
- Verify that users can access only their own private records.
- Validate incoming requests on the backend.
- Avoid committing ".env" files or other sensitive credentials.
- Use HTTPS for the deployed application.

🔮 Future Scope

Potential future enhancements include:

- More detailed learning analytics and progress trends.
- Additional AI-powered learning pathways.
- Personalized skill-gap analysis.
- Calendar-based learning plans and reminders.
- More report customization options.
- Integration with external learning platforms.
- Improved accessibility and mobile experiences.

These are possible enhancements, not a statement that every item is currently implemented.

👨‍💻 Developer

Aavej Ashraf Pirjade

Diploma in Computer Engineering

Interested in full-stack development, AI-powered applications, and building practical software solutions for real-world problems.

- GitHub: https://github.com/codewithaavej981

🤝 Feedback & Contributions

Feedback, suggestions, and ideas for improvement are welcome. If you find an issue or have an idea that could make SkillTrack 2.0 more useful, feel free to open a GitHub issue or share your feedback.

📜 License

No license has been specified here. Add a "LICENSE" file and update this section if you decide to distribute the project under an open-source license.

---

<p align="center">
  <strong>Built with 💙 to make learning more organized, measurable, and meaningful.</strong>
</p>
