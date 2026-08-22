# 🛡️ AgentGuard AI

## AI Agent Reliability & Security Evaluation Platform

AgentGuard AI is a platform designed to evaluate AI agents for **reliability, security, and safe behavior**.

Modern AI agents can do much more than generate text. They can use tools, access information, perform actions, and execute multi-step workflows.

Because of this, simply checking whether an AI agent gives the correct answer is not enough.

AgentGuard evaluates how an AI agent behaves during execution, including:

- Functional performance
- Tool usage
- Security behavior
- Policy violations
- Adversarial mutations
- Multi-step workflows
- Execution traces
- Failure analysis
- Replay consistency
- Security scoring
- Evaluation reports

The goal is simple:

> **Test AI agents before you trust them.**

---

# 🚀 Live Prototype

### 🌐 Live Application

**https://frontend-delta-sable.vercel.app/**

### ⚙️ Backend API

**https://agentguard-ai-9rbc.onrender.com/**

### 📦 GitHub Repository

**https://github.com/khansaheem786/AgentGuard_AI**

### 📚 API Documentation

**https://agentguard-ai-9rbc.onrender.com/docs**

### 🎥 Demo Video

**https://www.youtube.com/watch?v=HSc3lcvnBZE**

---

# 📌 Table of Contents

- [Introduction](#-introduction)
- [Problem Statement](#-problem-statement)
- [Prototype](#-prototype)
- [Our Solution](#-our-solution)
- [AgentGuard Workflow](#-agentguard-workflow)
- [How AgentGuard Works](#-how-agentguard-works)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Evaluation Pipeline](#-evaluation-pipeline)
- [Dashboard](#-dashboard)
- [Functional Evaluation](#-functional-evaluation)
- [Security Evaluation](#-security-evaluation)
- [Mutation Testing](#-mutation-testing)
- [Multi-Step Security Testing](#-multi-step-security-testing)
- [Replay](#-replay)
- [Failure Analysis](#-failure-analysis)
- [Reports](#-reports)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Backend](#-running-the-backend)
- [Running the Frontend](#-running-the-frontend)
- [Environment Configuration](#-environment-configuration)
- [Testing](#-testing)
- [Production Build](#-production-build)
- [API Overview](#-api-overview)
- [Security Methodology](#-security-methodology)
- [Example Workflow](#-example-workflow)
- [Current Project Status](#-current-project-status)
- [Future Scope](#-future-scope)
- [Why AgentGuard](#-why-agentguard)
- [Project Links](#-project-links)

---

# 👋 Introduction

AI agents are becoming increasingly capable of performing tasks, using tools, accessing information, and completing multi-step workflows.

However, as agents become more autonomous, it becomes important to understand whether they are not only capable of completing a task, but also **safe, reliable, and consistent while doing it**.

AgentGuard AI was developed to address this challenge.

It provides a platform for evaluating AI-agent behavior through functional testing, security testing, adversarial mutations, multi-step scenarios, execution analysis, replay, and reporting.

The core idea behind AgentGuard is:

> **Test AI agents before you trust them.**

---

# 🎯 Problem Statement

Traditional AI-agent testing often focuses on whether an agent produces the expected output.

However, an autonomous agent can produce the correct output while still:

- Using a tool incorrectly
- Following an unsafe instruction
- Performing an unauthorized action
- Using invalid parameters
- Violating a security policy
- Failing during a multi-step workflow
- Behaving differently when the same scenario is replayed

This creates a gap between **functional correctness** and **safe, reliable behavior**.

The problem we aim to solve is:

> **How can we systematically evaluate an AI agent's reliability and security before it is deployed into a real-world environment?**

AgentGuard addresses this by evaluating the agent's complete execution behavior instead of checking only the final answer.

---

# 🚀 Prototype

AgentGuard AI is implemented as a working web-based prototype with a separate frontend and backend.

The prototype demonstrates how an AI operations agent can be evaluated for reliability and security using a centralized evaluation platform.

For the prototype, **OpsPilot represents the AI operations agent under evaluation**, while AgentGuard acts as the evaluation and security layer around the agent.

## Prototype Flow

```text
                         OpsPilot
                    AI Agent Under Test
                             |
                             v
                       AgentGuard
                             |
             +---------------+---------------+
             |               |               |
             v               v               v
      Functional        Security        Mutation
       Testing           Testing         Testing
             |               |               |
             +---------------+---------------+
                             |
                             v
                     Multi-Step Testing
                             |
                             v
                    Execution Analysis
                             |
                             v
                         Replay
                             |
                             v
                        Reports