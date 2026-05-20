# Intelligent Change Management (ICM)

This repository contains the full Intelligent Change Management platform with three main layers:

- `intelligent-change-management/` — Java backend microservices
- `python-agents-icm/` — Python agent services and AI pipelines
- `telecom-change-ui/` — React + Vite frontend

> Note: `intelligent-change-management/` currently contains its own nested Git repository (`.git`). If you want this workspace to become a single monorepo, remove or relocate `intelligent-change-management/.git` before initializing the root repo.

---

## Repository layout

```
./
  .gitignore
  README.md
  intelligent-change-management/   # Java backend services
  python-agents-icm/              # Python agent microservices
  telecom-change-ui/              # React frontend
```

### Project folders

- `intelligent-change-management/`
  - Java microservices for authentication, approval, change request processing, API gateway, and service integration
  - Contains internal Maven wrapper files and Java build output paths
- `python-agents-icm/`
  - Python-based agents and AI processing services
  - Includes `anomaly-agent/`, `risk-assessment/`, `runbook-agent/`, and support code
- `telecom-change-ui/`
  - Frontend web application built with React and Vite

---

## Recommended Git setup

This workspace is not currently a Git repository at the root level. To initialize it for the GitHub repo `https://github.com/prathik31/icm.git`, run:

```bash
cd "<your-workspace-path>"
git init
git add .
git commit -m "Initial import of ICM project"
git branch -M main
git remote add origin https://github.com/prathik31/icm.git
git push -u origin main
```

### Important note about nested repository

`intelligent-change-management/` already contains `.git` and is currently a separate Git repository. If your goal is to track the full project in a single root repository, do one of the following:

1. Remove or move `intelligent-change-management/.git` before initializing the root repo, or
2. Treat `intelligent-change-management/` as a separate repo and do not add it to the root project as a tracked folder.

---

## How to clone and retrieve the full project

```bash
git clone https://github.com/prathik31/icm.git
cd icm
```

If the root repository is initialized successfully, teammates can clone the project and follow the instructions below.

---

## Setup and run instructions

### 1. Java backend (`intelligent-change-management`)

1. Change into the backend folder:

   ```bash
   cd intelligent-change-management
   ```

2. Build a service using the Maven wrapper:

   ```bash
   ./mvnw clean package
   ```

   On Windows use:

   ```powershell
   .\mvnw.cmd clean package
   ```

3. Build a specific service directory if needed:

   ```bash
   cd approval-service
   .\mvnw.cmd clean package
   ```

4. Run a built service jar from its `target/` folder:

   ```bash
   java -jar approval-service/target/<artifact>.jar
   ```

5. Common Java service paths:
   - `approval-service/`
   - `auth-service/`
   - `change-request-service/`
   - `api-gateway/`

> If the backend has module-level Maven projects, use the corresponding `pom.xml` file in each service folder.

---

### 2. Python agents (`python-agents-icm`)

The Python agent services are under `python-agents-icm/`.

1. Change into the agent folder, for example `anomaly-agent`:

   ```bash
   cd python-agents-icm/anomaly-agent
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Run the service locally:

   ```bash
   uvicorn agent.main:app --host 0.0.0.0 --port 8000
   ```

5. Optionally use Docker Compose from `python-agents-icm/`:

   ```bash
   cd python-agents-icm
   docker-compose up --build
   ```

---

### 3. Frontend (`telecom-change-ui`)

1. Change to the frontend folder:

   ```bash
   cd telecom-change-ui
   ```

2. Install npm dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Preview the production build:

   ```bash
   npm run preview
   ```

---

## Notes for teammates

- Use the root `README.md` as the entrypoint for the full workspace.
- Each subfolder may have its own `README.md` with more service-specific details.
- Do not commit local environment files like `.env`, virtual environments, IDE settings, or build artifacts.
- If you encounter missing service dependencies, inspect the subproject README files and the service folders directly.

---

## What this repo ignores

The `.gitignore` file added at the root excludes:

- Java build outputs (`target/` folders, `.class`, `.jar`, etc.)
- Node modules and frontend build output
- Python virtual environments and caches
- IDE/editor metadata
- OS temporary files
- local `.env` and secret files
- nested backend repository metadata in `intelligent-change-management/.git/`

---

## Recommended workflow

1. Clone the repo.
2. Install dependencies for the section you want to work on.
3. Start backend, agent, and frontend services in separate terminals.
4. Use service-specific README files for deeper configuration guidance.
5. Commit only source code and configuration, not local build artifacts.
