# Contribution Guide

Welcome to the **NFT Marketplace** project! We're excited to have you contribute to building an NFT marketplace using **Next.js**, **Nest.js**, **Rust**, **PostgreSQL (Prisma)**, and **Solana**. Before getting started, please review this guide to understand the contribution process, coding standards, and project structure.

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [How to Contribute](#how-to-contribute)
  - [Fork the Repository](#fork-the-repository)
  - [Clone Your Fork](#clone-your-fork)
  - [Set Up Your Environment](#set-up-your-environment)
  - [Create a Branch](#create-a-branch)
  - [Make Your Changes](#make-your-changes)
  - [Commit Your Changes](#commit-your-changes)
  - [Push Your Branch](#push-your-branch)
  - [Create a Pull Request](#create-a-pull-request)
- [Coding Standards](#coding-standards)
- [Monorepo Structure](#monorepo-structure)
- [Running Tests](#running-tests)
- [Setting Up the Environment](#setting-up-the-environment)
- [Issues and Feature Requests](#issues-and-feature-requests)

## Project Overview

This project is an **NFT Marketplace** built using:

- **Next.js** for the frontend
- **Nest.js** for the backend API
- **Rust** for Solana smart contracts
- **PostgreSQL** for database management

The marketplace allows users to mint, buy, and sell NFTs, with blockchain interactions powered by **Solana**.

## Prerequisites

Before contributing, ensure you have the following installed on your local machine:

- **Node.js** (version 20)
- **NPM**
- **Nx** (for monorepo management)
- **Rust** (for developing smart contracts)
- **Solana CLI**
- **PostgreSQL** (for database management)
- **Docker** (optional for containerized development)

## How to Contribute

### Fork the Repository

Start by forking the repository to your GitHub account. This will create a copy of the project under your GitHub profile.

### Clone Your Fork

Once you've forked the repository, clone your fork locally:

```bash
git clone https://github.com/your-username/nft-marketplace.git
cd nft-marketplace
```

### Set Up Your Environment

Run the following commands to set up your environment:

- Frontend

```bash
npm run dev:frontend
```

- Backend

```bash
npm run dev:backend
```

- Smart Development:
  **Note:** This step is optional and only required if you want to develop smart contracts.
  Install the Solana CLI and run a local Solana cluster (solana-test-validator) for local development

### Make Your Changes

Now, you can start developing the features. Be sure to follow the coding standards when making changes.

### Coding standards

- All code must be written in TypeScript for type safety and linting.
- Use the `eslint` and `prettier` plugins to ensure consistent code formatting.

### Rust (Solana Smart Contracts)

- Clippy: Run `cargo clippy` to catch common mistakes.
- Format: Run `cargo fmt` to format your code.

### Monorepo Structure

The project follows the Nx Monorepo structure:

- apps/frontend: Next.js for the frontend (UI)
- apps/backend: Nest.js for the backend API
- contracts: Rust for Solana smart contracts
- libraries: shared utilities, types, and models
- prisma: database schema and migrations

### Running Tests (optional)

Before submitting the PR, ensure that all tests pass:

- Frontend

```bash
nx test frontend
```

- Backend

```bash
nx test backend
```

- Smart Contracts (Rust)

```bash
cargo test
```

### Issues and Feature Requests

if you find a bug or have a feature request, feel free to open an issue. Make sure to provide enough context and steps to reproduce the issue.
