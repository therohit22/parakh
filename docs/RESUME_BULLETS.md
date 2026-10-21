# Parakh — Resume Bullets & Portfolio Descriptions

This document provides interview-defensible, technically accurate bullet points and descriptions for resumes, LinkedIn profiles, and GitHub portfolios.

---

## 1. One-Line Project Description

**Parakh** — A full-stack technical interview preparation platform built with Next.js 16, TypeScript, MongoDB Atlas, and Tailwind CSS, featuring company-wise question tracking, real-time preparation readiness analytics, and an idempotent data ingestion pipeline.

---

## 2. Standard Software Engineering Resume (3 Bullets)

- **Architected a full-stack technical interview platform** using **Next.js 16 App Router**, **TypeScript**, and **MongoDB Atlas**, delivering company-wise and topic-based problem discovery with bounded pagination, multi-criteria filtering, and sub-second catalog queries.
- **Implemented stateless authentication and zero-trust RBAC** using **JWT** stored in `httpOnly`, `SameSite=Lax` cookies with **bcryptjs** (10 salt rounds) and server-side role verification, complemented by **Zod** boundary validation and CSRF origin checks across all mutation endpoints.
- **Engineered an idempotent data ingestion CLI** supporting RFC 4180 CSV and JSON datasets with automated company slug-to-ObjectId resolution, dry-run simulation mode, and atomic Mongoose `$addToSet`/`$pull` operators for race-condition-free user progress tracking.

---

## 3. Internship-Optimized Resume (3 Bullets)

- **Built a company-focused coding practice platform** with **Next.js 16**, **React 19**, and **Tailwind CSS v4**, integrating personalized progress dashboards, difficulty breakdowns, and dark mode with zero hydration flicker.
- **Designed a secure RESTful API layer and MongoDB schema** with **Mongoose ODM**, utilizing cached connection pooling on `globalThis` to eliminate serverless cold-start bottlenecks and enforcing referential integrity against foreign key deletions.
- **Established an automated testing pipeline** using **Vitest** with 44 unit and security test cases covering authentication tampering, CSRF origin verification, CSV parsing, and Zod input validation schemas.

---

## 4. Portfolio & LinkedIn Project Description (3–5 Sentences)

**Parakh (परख)** is a company-wise technical interview preparation web platform designed to help computer science students prepare systematically for recruitment assessments. Built as a full-stack monolith using Next.js 16 App Router, TypeScript, Tailwind CSS, and MongoDB Atlas, it organizes coding problems by target technology companies, algorithmic topics, and difficulty levels. The platform features stateless authentication using JWT in httpOnly cookies, real-time readiness analytics, atomic bookmarking and progress tracking, and an administrative panel with referential integrity protection. It also includes an idempotent CLI ingestion pipeline for bulk onboarding datasets from CSV and JSON files, backed by an automated 44-test verification suite in Vitest.
