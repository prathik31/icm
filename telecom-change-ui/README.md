# Telecom Change Management UI

A modern, responsive web application for managing change requests, approvals, and runbooks in telecommunications infrastructure. Built with React, Vite, and Tailwind CSS.

## Overview

The Telecom Change Management UI is an Integrated Change Management (ICM) platform designed to streamline the process of creating, approving, and executing changes in telecom systems. It provides a comprehensive interface for managing change requests, assessing risks, tracking approvals, and executing runbooks.

## Features

- **Authentication & Authorization**
  - User login and registration
  - Protected routes with role-based access control
  - Session management with token-based authentication

- **Change Request Management**
  - Create new change requests
  - View detailed change request information
  - List and filter change requests
  - Track change status and history

- **Approval Workflow**
  - View pending approvals
  - Approve or reject change requests
  - Track approval history
  - View approved changes

- **Risk Assessment**
  - Evaluate risks associated with changes
  - Risk scoring and categorization
  - Visual risk indicators and badges

- **Runbook Management**
  - Access predefined runbooks for executing changes
  - Step-by-step execution tracking
  - Pre-check and validation cards
  - Rollback procedures and monitoring
  - Escalation handling

- **Dashboard**
  - Overview of key metrics
  - Recent activities and pending items
  - Quick access to common workflows

## Tech Stack

- **Frontend Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Styling**: Tailwind CSS 3.4.4 with custom theme
- **Routing**: React Router DOM 7.15.1
- **HTTP Client**: Axios 1.16.1
- **Icons**: Lucide React 0.527.0
- **Linting**: ESLint with React plugins
- **CSS Preprocessor**: PostCSS with Autoprefixer

## Project Structure

```
src/
├── api/                    # API integration layer
│   ├── approvalApi.js     # Approval API calls
│   ├── authApi.js         # Authentication API calls
│   ├── axiosClient.js     # Axios configuration
│   ├── axios.js           # HTTP client setup
│   └── crApi.js           # Change Request API calls
│   └── runbookApi.js      # Runbook API calls
├── components/            # Reusable React components
│   ├── AlertMessage.jsx   # Alert/notification component
│   ├── ApprovalCard.jsx   # Approval display card
│   ├── CRCard.jsx         # Change Request card
│   ├── Navbar.jsx         # Top navigation bar
│   ├── Sidebar.jsx        # Side navigation
│   ├── ProtectedRoute.jsx # Route protection wrapper
│   ├── StatusBadge.jsx    # Status indicator
│   ├── Timeline.jsx       # Timeline display
│   ├── risk/              # Risk-related components
│   ├── runbook/           # Runbook-specific components
│   │   ├── EscalationCard.jsx
│   │   ├── ExecutionStep.jsx
│   │   ├── MonitoringCard.jsx
│   │   ├── PrecheckCard.jsx
│   │   ├── RiskSummaryPanel.jsx
│   │   ├── RollbackCard.jsx
│   │   ├── RunbookHeader.jsx
│   │   ├── RunbookTimeline.jsx
│   │   └── ValidationCard.jsx
│   └── ui/                # Generic UI components
│       ├── Card.jsx
│       └── Table.jsx
├── config/               # Configuration files
│   └── api.js           # API endpoints configuration
├── context/             # React Context API
│   ├── AuthContext.jsx  # Authentication state
│   └── DataContext.jsx  # Global data state
├── hooks/               # Custom React hooks
│   ├── useApprovals.js
│   ├── useCRs.js
│   ├── useDashboard.js
│   └── useRunbookService.js
├── mock/                # Mock data
│   └── runbooksMock.js
├── pages/               # Page components
│   ├── ApprovalDetails.jsx
│   ├── ApprovalHistory.jsx
│   ├── ApprovalsPending.jsx
│   ├── ApprovedChanges.jsx
│   ├── CRCreate.jsx
│   ├── CRDetails.jsx
│   ├── CRList.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── RiskAssessments.jsx
│   ├── RunbookDetails.jsx
│   ├── RunbookOperations.jsx
│   ├── Runbooks.jsx
│   ├── NotFound.jsx
│   └── Unauthorized.jsx
├── services/            # Business logic layer
│   ├── approvalService.js
│   ├── authService.js
│   ├── crService.js
│   ├── dashboardService.js
│   └── runbookService.js
├── utils/               # Utility functions
│   └── sortByLatest.js
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
├── index.css            # Global styles
└── App.css              # Application styles
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telecom-change-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
VITE_AUTH_API=http://localhost:9003
VITE_CR_API=http://localhost:9004
VITE_APPROVAL_API=http://localhost:9005
```

### Development

Start the development server with hot module reloading:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build the application for production:
```bash
npm run build
```

### Preview

Preview the production build locally:
```bash
npm run preview
```

### Linting

Check code quality and style:
```bash
npm run lint
```

## API Integration

The application connects to multiple microservices:

- **Auth API** (Port 9003): Handles user authentication and authorization
- **Change Request API** (Port 9004): Manages change requests
- **Approval API** (Port 9005): Manages approval workflows

All API calls are made through Axios with centralized configuration in [src/api/axiosClient.js](src/api/axiosClient.js).

## Styling

The project uses Tailwind CSS with custom theme configuration:

- **Primary Color**: #2563EB (Blue)
- **Background**: #F8FAFC (Light Gray)
- **Surface**: #FFFFFF (White)
- **Border**: #E2E8F0 (Light Border)
- **Font**: Inter with fallbacks
- **Custom Shadow**: Soft shadow effect for cards

## State Management

- **Authentication**: Managed via [src/context/AuthContext.jsx](src/context/AuthContext.jsx)
- **Global Data**: Managed via [src/context/DataContext.jsx](src/context/DataContext.jsx)
- **Custom Hooks**: Provide specialized state and logic hooks

## Browser Support

The application is built with modern browsers in mind:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## ESLint Configuration

The project uses ESLint with the following plugins:
- `@vitejs/plugin-react` for React support
- `eslint-plugin-react-hooks` for React hooks linting
- `eslint-plugin-react-refresh` for Fast Refresh support

## Contributing

When contributing to this project:

1. Follow the existing code structure and naming conventions
2. Use meaningful commit messages
3. Ensure all linting checks pass: `npm run lint`
4. Test your changes thoroughly
5. Keep components modular and reusable

## License

[Add appropriate license information here]

## Support

For issues, questions, or suggestions, please contact the development team or create an issue in the repository.
