# HealthSync

A comprehensive health tracking application built with modern web technologies. HealthSync was created during a hackathon to demonstrate rapid prototyping and innovation in health technology.

## Features

- **Real-time Health Tracking**: Monitor vital signs and health metrics
- **Team Collaboration**: Work with healthcare professionals and family members
- **Secure & Private**: Enterprise-grade security for your health data
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Mobile First**: Optimized for all devices and screen sizes

## Tech Stack

- **Frontend**: React 19 + JSX
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository
2. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── Header.jsx     # Navigation header
│   ├── Footer.jsx     # Footer component
│   └── Loading.jsx    # Loading states
├── pages/              # Page components
│   ├── Home.jsx       # Landing page
│   ├── App.jsx        # Main app dashboard
│   └── Team.jsx       # Team information
├── lib/                # Utility functions
│   └── utils.js       # Common utilities
├── App.jsx             # Main app with routing
└── index.css           # Global styles
```

## Pages

- **Home** (`/`) - Landing page with features and call-to-action
- **App** (`/app`) - Main health tracking dashboard (placeholder)
- **Team** (`/team`) - Team information and project details

## Design System

HealthSync uses a custom design system inspired by iOS/macOS with:

- **Colors**: Primary blue palette with semantic colors
- **Typography**: System fonts for optimal readability
- **Spacing**: Consistent 4px grid system
- **Shadows**: Subtle shadows for depth
- **Animations**: Smooth transitions and micro-interactions

## Contributing

This is a hackathon project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code passes linting
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Team

Built with ❤️ by a passionate team of developers during a 48-hour hackathon.

---

For questions or support, please contact the team at team@healthsync.com
