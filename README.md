# MyUni - The All-in-One Platform for Coding Education

## Overview

MyUni is a comprehensive, fully-functional web application designed to facilitate coding education. It provides a seamless platform for teachers to manage classrooms, create coding problems, and conduct mock interviews. Students can join classrooms, solve problems in an integrated code editor, submit their solutions for instant feedback, and participate in real-time, AI-assisted mock interviews. The application is built with a modern tech stack and features a robust backend with code execution capabilities.

## Achievements

- **Top 5 in AI Hiring Show by Rabbit AI**: We are proud to have been recognized as one of the top 5 projects in the AI Hiring show organized by Rabbit AI.

## Key Features

### For Students:
- **Dashboard**: View all enrolled classrooms and assignments at a glance.
- **Join Classrooms**: Easily join a classroom using a unique code provided by the teacher.
- **Problem Solving**: Solve coding problems in an integrated Monaco-based code editor.
- **Code Submission**: Submit code and receive immediate verdicts (Accepted, Failed, Runtime Error, etc.).
- **Mock Interviews**: Participate in real-time mock interviews with teachers. The sessions are powered by LiveKit for real-time audio/video.
- **Interview Feedback**: Receive detailed feedback and review transcripts of past interview sessions.

### For Teachers:
- **Classroom Management**: Create and manage classrooms, each with a unique join code.
- **Module Creation**: Organize course content into modules within each classroom.
- **Problem Authoring**: Create custom coding problems with descriptions (in Markdown), test cases, and metadata.
- **Interview Scheduling**: Set up mock interview sessions for students within a module.
- **Student Management**: View and manage students enrolled in their classrooms.

### For Admins:
- **Teacher Approval System**: Admins can approve or reject requests from users who want to gain teacher-level access.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/) as the ORM
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Real-time Communication**: [LiveKit](https://livekit.io/) for real-time audio and video interviews.
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) for the in-browser code editor.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components.
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Schema Validation**: [Zod](https://zod.dev/)

## Database Schema Overview

The database schema is designed to support the application's features, with key models including:

- `users`: Stores user information and roles (student, teacher, admin).
- `classrooms`: Represents classrooms created by teachers.
- `classroom_members`: Manages the relationship between users and classrooms.
- `modules`: Allows teachers to group problems and interviews within a classroom.
- `problems`: Stores coding problems, including statements, test cases, and metadata.
- `code_submissions`: Records every code submission from users, along with the verdict and performance metrics.
- `interviews`: Defines the structure for mock interviews.
- `interview_sessions`: Tracks individual student interview sessions, including status and timing.
- `interview_transcriptions`: Stores the transcript of each interview session.
- `interview_feedback`: Stores feedback provided for an interview session.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm (or yarn/pnpm/bun)
- A running PostgreSQL instance

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/myuni.git
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up your environment variables**

    Create a `.env` file in the root of the project and add your database connection string:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
    You will also need to configure NextAuth.js providers and a `NEXTAUTH_SECRET`.

4.  **Apply database migrations**

    Run the following command to create the tables in your database based on the Prisma schema:
    ```sh
    npx prisma db push
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
