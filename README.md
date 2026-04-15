# 🏛️ SuperApp – PrefRio

**PrefRio** is the main web application of the Rio de Janeiro City Hall's digital ecosystem, digital wallets, courses and customer service.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> 📘 Full Documentation:  
> 🇧🇷 [Read in Portuguese](./docs/pt-br/README.pt.md)  
> 🇺🇸 [Read in English](./docs/en-us/README.en.md)

---

## 🚀 Tech Stack

| Category       | Technology                    |
| -------------- | ----------------------------- |
| Framework      | Next.js 15.4.6 + React 19     |
| Language       | TypeScript                    |
| Styling        | TailwindCSS 4 + shadcn/ui     |
| Authentication | Keycloak (Identidade Carioca) |
| API Client     | Orval (OpenAPI Generator)     |
| Validation     | Zod + React Hook Form         |
| Infrastructure | Docker + Kubernetes           |
| Lint & Format  | Biome                         |

---

## 🧩 Project Structure

```
superapp/
├── src/ # Main source code
├── docs/ # Detailed documentation
├── k8s/ # Kubernetes manifests
├── Dockerfile # Production build configuration
└── README.md # This file
```

---

## 🧠 Quick Start

```bash
# Requires Node 23.7.0+


# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Then open: http://localhost:3000

---

## 🔍 Biome scripts

```bash
# Format all files
npx @biomejs/biome format --write

# Format specific files
npx @biomejs/biome format --write <files>

# Lint files and apply safe fixes to all files
npx @biomejs/biome lint --write

# Lint files and apply safe fixes to specific files
npx @biomejs/biome lint --write <files>

# Format, lint, and organize imports of all files
npx @biomejs/biome check --write

# Format, lint, and organize imports of specific files
npx @biomejs/biome check --write <files>
```

---

Made with ❤️ by IplanRio
