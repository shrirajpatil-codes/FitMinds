# FITMIRROR AI

### Reality-Aware, Self-Learning Fitness Intelligence for Students

> **FitMirror AI is an AI-powered fitness intelligence system designed for students whose academic workload, available time, energy, and physical condition continuously change. Instead of forcing students to follow a fixed workout plan, FitMirror AI dynamically adapts exercise recommendations to the student's current reality and learns from their ongoing behavior and response.**

---

## 📌 Overview

Students often struggle to maintain a consistent fitness routine because their daily reality is not fixed.

Academic workload, available time, energy levels, fatigue, previous workout behavior, fitness goals, and consistency can change from one day to another. A conventional fitness application may provide a predefined workout plan, but such a plan does not necessarily adapt when the student's circumstances change.

**FitMirror AI** is proposed as a reality-aware fitness intelligence system that addresses this limitation.

Instead of asking:

> **"What workout should every student follow?"**

FitMirror AI focuses on:

> **"What workout is appropriate for this student, given their current reality?"**

The system combines:

* Student check-ins and contextual information
* Behavioral data
* AI-based dropout-risk prediction
* Natural-language intent understanding
* Real-time computer-vision-based exercise feedback
* A deterministic safety and decision engine
* Adaptive workout planning
* Continuous behavioral learning

The goal is to create a fitness experience that is **personalized, explainable, safety-aware, and continuously adaptive**.

---

# 🎯 Problem

Students frequently have difficulty maintaining regular exercise because fitness has to compete with changing academic and personal commitments.

A fixed fitness plan assumes that the student's:

* Available time
* Energy
* Academic workload
* Physical condition
* Motivation
* Consistency

remain relatively stable.

In reality, these factors can change frequently.

This creates a gap between:

**the workout plan a student is given**

and

**the workout the student can realistically follow.**

FitMirror AI addresses this gap by making the fitness plan responsive to the student's changing reality.

---

# 💡 Proposed Solution

FitMirror AI works as a **reality-aware fitness intelligence layer** between the student's current state and their workout plan.

The proposed system follows the overall cycle:

```text
Student Reality
       ↓
Understand
       ↓
Intelligent Decision
       ↓
Workout Adaptation
       ↓
Student Response
       ↓
Behavioral Learning
       ↺
Future Adaptation
```

Rather than treating a workout plan as fixed, FitMirror AI dynamically adjusts relevant workout parameters such as:

* **Duration**
* **Intensity**
* **Exercise Load**
* **Timing**

The system also incorporates safety constraints and explainability into its decision process.

---

# ⭐ Key Features

## 1. Reality-Aware Check-In

The system collects relevant information about the student's current state through a check-in mechanism.

The information can contribute to understanding factors such as:

* Available time
* Energy
* Physical condition
* Academic workload
* Fitness goals
* Current constraints

The purpose is not simply to collect information, but to provide the AI with the context required to make a more appropriate fitness decision.

---

## 2. Adaptive Workout Planning

FitMirror AI is designed to avoid a one-size-fits-all workout approach.

Based on the student's current context and system decisions, the workout can be adapted across parameters such as:

* Workout duration
* Exercise intensity
* Exercise load
* Timing

This allows the recommended workout to better match the student's current situation.

---

## 3. AI-Based Dropout Risk Prediction

A major component of FitMirror AI is the prediction of potential workout dropout or disengagement risk.

### Proposed Algorithm

**Gradient Boosted Trees (XGBoost)**

with:

**Logistic Regression** as a baseline model.

### Input Features

The model is intended to work with structured behavioral features such as:

* Workout completion rate
* Recent activity patterns
* Gaps between sessions
* Soreness-related information
* Negotiation frequency
* Behavioral consistency

### Why XGBoost?

XGBoost is well suited to structured/tabular data and can provide feature-importance information.

This supports an explainable approach where the system can identify which behavioral factors contributed to a predicted risk level.

### Training Approach

Since real longitudinal student behavior data is not available during the initial development stage, the planned system uses **synthetic behavior-archetype data** representing patterns such as:

* Stable behavior
* Declining behavior
* Volatile behavior

This provides a controlled starting point for the prediction component.

---

# 🗣️ 4. Intelligent Workout Negotiator

FitMirror AI includes a natural-language interaction layer through which a student can communicate constraints or preferences related to their workout.

For example, a student may express a need for:

* Less time
* Lower intensity
* A different workout arrangement
* A modified session

### Proposed Approach

**Sentence embeddings using MiniLM through `sentence-transformers` + cosine similarity**

This is intended to provide a lightweight **zero-shot intent classification** mechanism.

Instead of requiring a large manually labelled dataset, new intents can be introduced through representative example phrases.

---

# 👁️ 5. Computer Vision — Exercise Rep Counting & Form Check

FitMirror AI is designed to provide real-time exercise feedback using computer vision.

### Proposed Technology

**MediaPipe Pose**

The system uses body landmarks to understand exercise movement.

The planned approach uses:

* 33 body keypoints
* Landmark visibility/confidence
* Joint-angle calculations
* A deterministic state machine

for exercise rep counting and form-related checks.

### Why Client-Side Processing?

The proposed computer-vision component is intended to run client-side to:

* Reduce latency
* Support real-time feedback
* Improve privacy

Rather than transmitting raw video continuously to the backend, the intended architecture can work with skeletal landmark information.

### Confidence-Aware Abstention

If landmark visibility falls below the required threshold, the system should avoid producing an unreliable result.

Instead, it can ask the student to reposition or improve visibility.

This follows the principle:

> **When confidence is insufficient, the system should abstain instead of pretending to be certain.**

---

# 🛡️ 6. Safety & Rules Engine

Not every fitness decision needs to be made by machine learning.

FitMirror AI intentionally includes a deterministic rules engine for safety-relevant decisions.

### Approach

**Deterministic weighted scoring + hard safety filters**

The rules engine is responsible for applying explicit constraints before recommendations are finalized.

This provides:

* Predictability
* Explainability
* Safety constraints
* Transparent decision logic

The system therefore does not rely entirely on a black-box model for safety-sensitive workout decisions.

---

# 🧠 7. Explainable AI

Explainability is an important part of the FitMirror AI architecture.

The system is designed so that important decisions can be connected to understandable factors.

For example, the dropout-risk component can expose feature importance, while the deterministic rules engine provides explicit reasoning for safety-related constraints.

The design principle is:

> **A fitness recommendation should not only be generated — its reasoning should be understandable.**

---

# 🔄 8. Continuous Behavioral Learning

FitMirror AI is designed as a continuously adaptive system.

The intended cycle is:

```text
Student Reality
      ↓
AI Understanding
      ↓
Decision
      ↓
Adaptive Workout
      ↓
Student Response
      ↓
Behavioral Learning
      ↓
Future Recommendation
```

This allows the system to use ongoing behavioral information rather than treating every workout as an isolated event.

---

# 🏗️ System Architecture

FitMirror AI is divided into multiple technical layers.

```text
┌───────────────────────────────────────────────┐
│                  FRONTEND                     │
│ React + Vite + Tailwind CSS                  │
│ Axios + React Query                           │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│                  BACKEND                      │
│ Node.js + Express                             │
│ JWT Authentication + Prisma ORM               │
│ Safety / Decision Middleware                  │
└───────────────┬───────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐  ┌───────────────────────────┐
│  PostgreSQL   │  │       AI / ML SERVICE     │
│               │  │ Python + FastAPI           │
│ User          │  │                           │
│ CheckIn       │  │ XGBoost                   │
│ Plan          │  │ MiniLM Embeddings         │
│ Session       │  │ MediaPipe Pose            │
│ Behaviour     │  │ Rules Engine              │
│ Profile       │  │                           │
└───────────────┘  └───────────────────────────┘
```

---

# 💻 Technology Stack

## Frontend

| Technology       | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| **React.js**     | Component-driven user interface                      |
| **Vite**         | Frontend development and build tooling               |
| **Tailwind CSS** | Consistent and rapid UI styling                      |
| **Axios**        | HTTP communication with backend services             |
| **React Query**  | Server-state caching, synchronization and refetching |

### Why React Query?

React Query is intended to keep frontend server state synchronized with backend changes without relying entirely on manual `useState` / `useEffect` data-fetching logic.

---

## Backend

| Technology     | Purpose                                  |
| -------------- | ---------------------------------------- |
| **Node.js**    | Backend runtime                          |
| **Express.js** | HTTP server and middleware pipeline      |
| **JWT**        | Stateless authentication                 |
| **Prisma ORM** | Type-safe database access and migrations |

The backend architecture is designed around a middleware pipeline.

Safety-related filtering and decision logic can therefore be positioned before downstream scoring or recommendation operations.

---

## Database

### PostgreSQL

PostgreSQL is selected as the primary relational database.

The core data relationships form a dependency chain:

```text
User
  ↓
CheckIn
  ↓
Plan
  ↓
Session
  ↓
BehaviourProfile
```

A relational database is appropriate for these relationships and for behavioral feature extraction involving:

* Completion rates
* Time-windowed activity
* Session gaps
* Behavioral aggregations

PostgreSQL also provides transactional consistency for related writes.

### Planned Hosting Options

* Neon
* Supabase

---

# 🤖 AI / ML Layer

The AI/ML layer is planned as a separate service using:

### Python + FastAPI

The system contains multiple AI/ML components rather than attempting to use one model for every problem.

---

## AI Model 1 — Dropout Risk Prediction

**Problem type:** Structured/tabular prediction

**Proposed model:**

* XGBoost
* Logistic Regression baseline

**Purpose:**

Predict potential disengagement/dropout risk based on behavioral features.

---

## AI Model 2 — Intent Classification

**Problem type:** Natural-language understanding

**Proposed approach:**

* Sentence Transformers
* MiniLM embeddings
* Cosine similarity

**Purpose:**

Understand student workout-related requests without requiring a large supervised training dataset.

---

## AI Model 3 — Computer Vision

**Problem type:** Real-time pose estimation

**Proposed technology:**

* MediaPipe Pose
* Body landmarks
* Joint-angle calculations
* Deterministic state machine

**Purpose:**

* Exercise rep counting
* Form-related feedback
* Confidence-aware exercise tracking

---

# 🧩 Rules Engine

The rules engine complements the ML components.

Instead of using machine learning for every decision, FitMirror AI uses deterministic logic where explicit and explainable behavior is preferable.

The proposed decision architecture combines:

```text
AI Predictions
      +
Intent Understanding
      +
Exercise / Session Data
      +
Safety Rules
      ↓
Adaptive Decision
```

This hybrid architecture allows ML to provide intelligence while deterministic rules provide controlled safety boundaries.

---

# 🔐 Authentication & Security

The backend is designed to use:

### JWT Authentication

JWT provides stateless authentication and avoids requiring a centralized session store for the basic authentication mechanism.

The application should also ensure that sensitive configuration values such as:

* API keys
* database credentials
* authentication secrets

are stored through environment variables and are **not committed to the Git repository**.

GitHub specifically warns against committing passwords, API keys, or other sensitive information to a repository.

---

# 🗃️ Core Data Model

The proposed relational structure centers around the following entities:

```text
USER
 │
 ├── CHECK-IN
 │       │
 │       ▼
 │     PLAN
 │       │
 │       ▼
 │     SESSION
 │       │
 │       ▼
 └── BEHAVIOUR PROFILE
```

These entities support the collection and analysis of longitudinal behavioral information.

---

# 🔁 High-Level Working Flow

```text
1. Student Authentication
          ↓
2. Student Check-In
          ↓
3. Current Reality Assessment
          ↓
4. AI / Rule-Based Analysis
          ↓
5. Risk + Intent + Context Analysis
          ↓
6. Adaptive Workout Decision
          ↓
7. Personalized Workout
          ↓
8. Exercise Session
          ↓
9. Computer Vision Feedback
          ↓
10. Session / Behaviour Data
          ↓
11. Behavioural Learning
          ↓
12. Future Workout Adaptation
```

---

# 🧠 Hybrid Intelligence Approach

FitMirror AI does not attempt to solve every problem with one model.

Instead, the architecture intentionally matches different techniques to different problem types:

| Problem                          | Proposed Technique                        |
| -------------------------------- | ----------------------------------------- |
| Structured behavioral prediction | **XGBoost**                               |
| Baseline risk prediction         | **Logistic Regression**                   |
| Natural-language intent          | **MiniLM embeddings + cosine similarity** |
| Pose estimation                  | **MediaPipe Pose**                        |
| Rep counting                     | **Joint-angle state machine**             |
| Safety decisions                 | **Deterministic rules engine**            |
| Authentication                   | **JWT**                                   |
| Data persistence                 | **PostgreSQL + Prisma**                   |

This separation allows the system to use the most appropriate technique for each component.

---

# 🎯 Why This Approach Is Different

Traditional fitness applications often begin with a workout plan and expect the user to adapt to it.

FitMirror AI reverses this relationship.

```text
Traditional Approach

Fixed Workout
      ↓
Student adapts to workout


FitMirror AI

Student Reality
      ↓
FitMirror AI
      ↓
Workout adapts to student
      ↓
System learns from response
```

The central idea is:

> **The fitness plan should adapt to the student — not the student continuously struggle to adapt to a fixed plan.**

---

# 📊 Explainability & Safety Philosophy

FitMirror AI follows a confidence-aware and explainable design philosophy.

### For prediction

The dropout-risk model can provide feature-importance information.

### For vision

Low landmark confidence can cause the system to abstain instead of producing an unreliable result.

### For safety

Explicit rules and hard filters can constrain recommendations.

This creates a hybrid system where:

**ML provides intelligence**

while

**rules provide control and explainability.**

---

# 🚧 Development Status

FitMirror AI is being developed as a proposed AI-powered fitness intelligence system.

### Planned / In Development

* [ ] React + Vite frontend
* [ ] Tailwind CSS interface
* [ ] React Query server-state management
* [ ] Node.js + Express backend
* [ ] JWT authentication
* [ ] Prisma ORM
* [ ] PostgreSQL database
* [ ] Student check-in system
* [ ] Adaptive workout planning
* [ ] XGBoost dropout-risk model
* [ ] Logistic Regression baseline
* [ ] MiniLM intent classification
* [ ] MediaPipe Pose integration
* [ ] Rep counting
* [ ] Form-related feedback
* [ ] Safety rules engine
* [ ] Behaviour profile
* [ ] Session tracking
* [ ] Continuous adaptation mechanism

> **Note:** The items above represent the planned technical implementation of the project and should not be interpreted as completed functionality unless the corresponding implementation exists in the repository.

---

# 🛠️ Planned Project Structure

A possible high-level project organization is:

```text
FITMIRROR-AI/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   └── ...
│
├── ai-service/
│   ├── models/
│   ├── inference/
│   ├── vision/
│   ├── intent/
│   └── ...
│
├── prisma/
│   └── schema.prisma
│
├── README.md
└── .gitignore
```

The exact structure may evolve during implementation.

---

# 🔮 Future Scope

Potential future development areas include:

* More sophisticated behavioral learning
* Expanded exercise libraries
* Additional exercise-form analysis
* More personalized adaptation strategies
* Larger real-world longitudinal datasets
* Improved risk prediction
* Additional natural-language intents
* More detailed behavioral profiles
* Expanded fitness analytics
* Improved recommendation evaluation

These are future possibilities and are not presented as current implemented functionality.

---

# ⚠️ Important Safety Note

FitMirror AI is a student-focused fitness technology project and is intended as a technical prototype/system concept.

Its recommendations should not be treated as a substitute for professional medical, fitness, or rehabilitation advice.

Safety constraints are therefore an important part of the proposed architecture.

---

# 📜 License

License information will be added according to the project's final repository and distribution requirements.

---

# 👥 Project

## FITMIRROR AI

**Reality-Aware, Self-Learning Fitness Intelligence for Students**

Built as an AI-powered solution focused on helping students maintain realistic and adaptive fitness routines despite changing academic and personal conditions.

---

## 🚀 Core Idea

> **Sense the student's reality. Understand the context. Adapt the workout. Learn continuously.**
