# Dependency Summary

This is a short, slide-ready summary of the main dependencies we use in the project.

## Core Framework
- `react` / `react-dom`: The foundation of our frontend app.
- `vite`: Fast dev server and build tool for our React TypeScript app.
- `typescript`: Type safety across the app.

## UI Toolkit
- `tailwindcss`: Utility-first CSS framework for styling.
- `@radix-ui/*`: Accessible UI primitives powering our custom components.
- `lucide-react`: Lightweight icon library used throughout the interface.
- `framer-motion`: Smooth motion and animation support.

## Forms and Validation
- `react-hook-form`: Primary library for managing form state and submission.
- `zod`: Schema validation for form data and API payloads.
- `@hookform/resolvers`: Connects Zod validation to react-hook-form.

## Data and API
- `axios`: HTTP client for backend API calls.
- `@tanstack/react-query`: Data fetching and caching layer for API requests.

## State & Navigation
- `zustand`: Lightweight app state store for shared state.
- `react-router-dom`: Client-side routing for page navigation.

## Extra UI Features
- `recharts`: Charting library for dashboards and analytics.
- `embla-carousel-react`: Carousel component for content sliders.
- `sonner`: Toast notifications for user feedback.
- `next-themes`: Light/dark mode theme switching.
- `react-resizable-panels`: Resizable panel layout support.
- `input-otp`: OTP input component for verification flows.

## Dev / Test Utilities
- `eslint`: Code linting and quality checks.
- `vitest`: Test runner for unit and component tests.
- `@testing-library/react` / `@testing-library/jest-dom`: React component testing utilities.
- `tailwindcss-animate`: Animation utilities for Tailwind styles.
- `postcss` / `autoprefixer`: CSS tooling used by Tailwind.

## Why this matters
- We built the app on React with fast tooling and strong type safety.
- Radix and Tailwind let us create polished, accessible UI quickly.
- React Query, Axios, and Zustand keep data and state reliable.
- The setup balances developer productivity with a modern UX foundation.
