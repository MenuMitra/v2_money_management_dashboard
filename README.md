# Outlet Dashboard

A responsive and optimized dashboard for outlet management with centralized API handling and stunning UI.

## Features

- Responsive design optimized for various devices
- Centralized API handling with authentication
- Real-time order management
- Menu management with availability toggles
- Outlet settings configuration
- Modern UI with Tailwind CSS

## Tech Stack

- React
- React Router
- Axios for API requests
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd outlet-dashboard
npm install
```

3. (Optional) Create a `.env` file in the root directory to select the runtime environment:

```
VITE_APP_ENV=testing
```

If `VITE_APP_ENV` is not provided, the fallback environment defined in `src/config/env.js` is used. Update `src/config/env.js` whenever you need to change domain names or WebSocket hosts for `production`, `testing`, or `development`.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/api` - Centralized API handling
- `/src/components` - Reusable UI components
- `/src/contexts` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/layouts` - Page layout components
- `/src/pages` - Main application pages
- `/src/utils` - Utility functions

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder. 