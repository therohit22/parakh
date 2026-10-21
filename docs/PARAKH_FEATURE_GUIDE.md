# Parakh Interview Preparation Platform — Feature Guide

## Overview

Parakh (परख = evaluation / testing) is an interview-preparation platform built to guide computer science students through data structures, algorithms, and company-specific technical tracks.

This guide details the **15 core personal DSA preparation features**, covering their design rationale, calculation formulas, database persistence strategy, and security architecture.

---

## 1. Company Preparation Roadmaps

- **Route / UI**: Available on any dedicated company page (`/companies/[slug]`) via the "Parakh Preparation Roadmap" tab.
- **API Endpoint**: `GET /api/companies/[slug]/roadmap`
- **Design & Behavior**:
  - Organizes verified questions into a progressive 3-stage sequence:
    1. **Stage 1 — Fundamentals**: Arrays, Strings, Hashing, Two Pointers.
    2. **Stage 2 — Core DSA**: Binary Search, Linked List, Stack, Queue, Trees, BST, Recursion.
    3. **Stage 3 — Advanced Algorithms**: Dynamic Programming, Graphs, BFS, DFS, Greedy, Backtracking, Trie.
  - Computes completion progress based on questions solved by the authenticated user (`User.solvedQuestions`).
  - Stage question drawers allow instant expansion to view solved status, difficulty, pattern, and practice on LeetCode.
  - **Disclaimer**: Clearly framed as a *Parakh Preparation Roadmap* based on problem frequency analysis, rather than an official company syllabus.

---

## 2. Company-wise Progress Tracking

- **Route / UI**: Integrated directly on the authenticated Dashboard (`/dashboard`) and Profile (`/profile`).
- **Data Source**: Aggregated via `GET /api/dashboard`.
- **Design & Behavior**:
  - Connects real `Question.companies` relationships to `User.solvedQuestions`.
  - Computes `solved / total` questions and a percentage progress bar for top companies.
  - Prevents N+1 database queries through single aggregation pipelines.

---

## 3. Topic-wise Progress & Strength Analysis

- **Route / UI**: Dashboard (`/dashboard`) and Profile (`/profile`).
- **Data Source**: Aggregated via `GET /api/dashboard`.
- **Classification Formula**:
  $$\text{Topic Progress} = \frac{\text{Solved Questions in Topic}}{\text{Total Questions in Topic}} \times 100$$
  - **Strong** ($\ge 70\%$): Green badge, high proficiency.
  - **Moderate** ($40\% - 69\%$): Amber badge, developing competence.
  - **Needs Practice** ($< 40\%$): Rose badge, targeted for further revision.
- Handles multi-topic questions safely without double-counting inside individual topic totals.

---

## 4. Personal Revision Queue

- **Route / UI**: Dedicated `/revision` page and question detail page toggle button.
- **API Endpoints**:
  - `GET /api/questions/revision`: Fetches the user's populated revision queue with private cache-control headers.
  - `POST /api/questions/[slug]/revision`: Adds question to user's revision queue (`$addToSet`).
  - `DELETE /api/questions/[slug]/revision`: Removes question from user's revision queue (`$pull`).
  - `GET /api/questions/[slug]/revision`: Checks if a specific question is in revision.
- **Design & Behavior**:
  - Completely separate from solved state. A problem can be *Solved + Needs Revision* or *Solved + Revised*.
  - Idempotent database operations prevent duplicate array entries.
  - User identity is always derived server-side from signed JWT cookies.

---

## 5. Parakh Preparation Score (0–100)

- **Route / UI**: Hero widget on Dashboard (`/dashboard`) and Profile (`/profile`).
- **Score Range**: 0 to 100 (integer).
- **Philosophy**: Deterministic preparation index, explicitly documented as a preparation metric rather than a statistical prediction of hiring probability. Zero AI/ML or black-box heuristics.
- **Formula**:
  $$\text{Preparation Score} = \min\left(100, \text{round}\left(C_{\text{overall}} \times 0.35 + C_{\text{topic}} \times 0.25 + C_{\text{company}} \times 0.15 + R_{\text{queue}} \times 0.15 + S_{\text{streak}} \times 0.10\right)\right)$$
  Where:
  - $C_{\text{overall}} = (\text{Solved} / \text{Total}) \times 100$
  - $C_{\text{topic}} = (\text{Covered Topics} / \text{Total Catalog Topics}) \times 100$
  - $C_{\text{company}} = (\text{Covered Companies} / \text{Total Catalog Companies}) \times 100$
  - $R_{\text{queue}} = \min(100, \text{Revision Count} \times 10)$
  - $S_{\text{streak}} = \min(100, \text{Active Streak Days} \times 14.3)$ (caps at 7 days)

---

## 6. Daily Practice

- **Route / UI**: Dedicated card on Dashboard (`/dashboard`).
- **API Endpoint**: `GET /api/daily-practice`
- **Design & Behavior**:
  - Selects 5 curated problems daily: **1 Easy, 3 Medium, 1 Hard**.
  - **Deterministic Day Hashing**: A bitwise hash of the current date string (`YYYY-MM-DD`) acts as the pseudo-random seed. This guarantees that page refreshes throughout the same calendar day return identical problems without requiring database writes.
  - Dynamically merges the user's current solved status for each question.

---

## 7. Personal Notes on Questions

- **Route / UI**: Embedded collapsible scratchpad on Question Detail page (`/questions/[slug]`).
- **API Endpoints**:
  - `GET /api/questions/[slug]/notes`: Retrieve the authenticated user's private note.
  - `PUT /api/questions/[slug]/notes`: Create or update note (max 2000 characters).
  - `DELETE /api/questions/[slug]/notes`: Delete personal note.
- **Database Model**: `QuestionNote` collection with compound unique index `{ user: 1, question: 1 }`.
- **Security**: Strict user-level isolation; users can only read, modify, or delete their own notes. Content is stored as plain text to prevent stored XSS.

---

## 8. DSA Pattern Recognition

- **Model Extension**: Added `pattern` string field and index to `Question` model.
- **Patterns Supported**: Sliding Window, Two Pointers, Binary Search, Prefix Sum, Hashing, Monotonic Stack, BFS, DFS, Dynamic Programming, Greedy, Backtracking, Union Find, Trie.
- **Search & Filter**: Questions can be queried and filtered specifically by pattern via `GET /api/questions?pattern=...`.

---

## 9. Advanced Combined Search

- **Route / UI**: Questions catalog (`/questions`).
- **API Endpoint**: `GET /api/questions`
- **Filter Dimensions**:
  - Full-text search (`search`) across titles and descriptions (ReDoS-safe regex escaping).
  - Target company (`company`).
  - Difficulty level (`difficulty`: Easy, Medium, Hard).
  - DSA Topic taxonomy (`topic`).
  - Algorithmic Pattern (`pattern`).
- **Logic**: All filters combine with strict **AND** semantics on the server side. Unbounded database loading is prevented through enforced pagination limits (max 50 per page).

---

## 10. Mock Interview Mode

- **Route / UI**: Dedicated `/mock-interview` page.
- **API Endpoint**: `GET /api/mock-interview?company=...`
- **Design & Behavior**:
  - Generates a 45-minute timed interview simulation.
  - Problem Composition: **1 Easy, 1 Medium, 1 Hard** (or 2nd Medium if insufficient Hard problems exist).
  - Features real-time countdown timer, question completion tracking, direct LeetCode links, and a completion performance summary upon submission.
  - Fully client-state managed; no heavyweight background worker or paid service required.

---

## 11. Progress History & Activity Tracking

- **Data Storage**: Compact array embedded on `User.activityLog` (`[{ date: 'YYYY-MM-DD', count: number }]`).
- **Behavior**:
  - Automatically records increments whenever questions are marked as solved.
  - Avoids creating bloated database documents for routine user clicks.

---

## 12. Streak & Activity Calendar

- **Route / UI**: Visual 30-day activity grid on Dashboard (`/dashboard`) and Profile (`/profile`).
- **Calculation**:
  - Aggregates activity from `user.activityLog` over the preceding 30 days.
  - Calculates consecutive active days (current streak). If no problem was solved today yet, streak from yesterday remains intact without penalty.

---

## 13. Curated Interview Collections

- **Route / UI**: Dedicated `/collections` catalog.
- **API Endpoint**: `GET /api/collections`
- **Curated Sets**:
  - FAANG High-Frequency Core
  - Two Pointers & Sliding Window
  - Binary Search Mastery
  - Dynamic Programming Patterns
  - Trees & Graphs Foundations
- **Architecture**: References existing questions in the database without duplicating records.

---

## 14. Improved User Profile

- **Route / UI**: `/profile` page.
- **Features**:
  - Displays user name, email, member since date, role badge.
  - Summary metrics: Solved Questions, Revision Queue, Preparation Score, Current Streak, Strongest Topic, Weakest Topic.
  - Account security settings: Change Password and Delete Account.

---

## 15. Essential Account Security

- **Change Password**:
  - Endpoint: `POST /api/auth/change-password`
  - Validates current password using `bcryptjs.compare`, enforces minimum 6-character length for new password, and securely updates password hash.
- **Account Deletion**:
  - Endpoint: `DELETE /api/auth/account`
  - Requires user password verification. Cascades deletion to remove user document and private `QuestionNote` records. Preserves shared `Question` and `Company` datasets.
