# Intelligent Change Management (ICM)

## Setup and Run Instructions

### Prerequisites
- **Java**: Version 17 or higher
- **Python**: Version 3.8 or higher
- **Node.js**: Version 16 or higher (for frontend)
- **npm**: Comes with Node.js
- **Maven**: Bundled with Java microservices (mvnw wrapper included)

---

## 1. Java Microservices (`intelligent-change-management`)

**Services**: approval-service, auth-service, change-request-service, runbook-service

#### Setup
```bash
cd intelligent-change-management
```

#### Build All Services
```bash
# On Linux/Mac
./mvnw clean package

# On Windows
.\mvnw.cmd clean package
```

#### Build a Specific Service
```bash
cd approval-service
# On Linux/Mac
../mvnw clean package

# On Windows
..\mvnw.cmd clean package
```

#### Run a Service
```bash
# After building, run the JAR from the target folder
cd approval-service/target
java -jar approval-service-0.0.1-SNAPSHOT.jar

# Or run directly from the source directory
cd approval-service
# On Linux/Mac
../mvnw spring-boot:run

# On Windows
..\mvnw.cmd spring-boot:run
```

---

## 2. Python Agent Services (`python-agents-icm`)

**Services**: risk-assessment, runbook-agent

#### Setup
```bash
cd python-agents-icm

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Run Risk Assessment Agent
```bash
cd risk-assessment

# Install service-specific dependencies
pip install -r requirements.txt

# Run the agent
python agent/main.py

# Or run with uvicorn (if exposed as API)
uvicorn agent.main:app --reload --port 8000
```

#### Run Runbook Agent
```bash
cd runbook-agent

# Install service-specific dependencies
pip install -r requirements.txt

# Run the agent
python main.py

# Or using pytest for tests
pytest test_endpoint.py
pytest test_scenarios.py
```

#### Using Docker (Optional)
```bash
cd risk-assessment
docker-compose up
```

---

## 3. Frontend (`telecom-change-ui`)

**Technology**: React + Vite + Tailwind CSS

#### Setup
```bash
cd telecom-change-ui

# Install dependencies
npm install
```

#### Development Server
```bash
npm run dev
# Server runs at http://localhost:5173
```

#### Build for Production
```bash
npm run build
# Output in dist/ folder
```

#### Preview Production Build
```bash
npm run preview
```

#### Linting
```bash
npm run lint
```

---

## Quick Start (All Services)

### Terminal 1: Java Backend
```bash
cd intelligent-change-management/approval-service
../mvnw spring-boot:run
```

### Terminal 2: Python Agents
```bash
cd python-agents-icm/risk-assessment
source venv/bin/activate  # or venv\Scripts\activate on Windows
python agent/main.py
```

### Terminal 3: Frontend
```bash
cd telecom-change-ui
npm run dev
```

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
