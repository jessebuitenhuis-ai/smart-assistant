# Frontend App - Angular Chat Interface

## Overview
This is the Angular frontend application for the Smart Assistant project. It features a chat interface component built with Angular 20 and styled using Tailwind CSS.

## Technology Stack
- **Framework**: Angular 20.2.0
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Nx (monorepo workspace)
- **Language**: TypeScript 5.9

## Project Structure
```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── app.ts                 # Main app component
│   │   ├── app.html               # Main app template
│   │   ├── app.scss               # Main app styles
│   │   ├── chat.component.ts      # Chat interface component
│   │   ├── chat.component.html    # Chat interface template
│   │   └── chat.component.scss    # Chat interface styles (minimal, using Tailwind)
│   ├── styles.scss                # Global styles (includes Tailwind imports)
│   └── main.ts                    # Application entry point
└── CLAUDE.md                      # This file
```

## Key Components

### Chat Component (`chat.component.ts`)
The main chat interface component that provides:
- Message display with user/bot differentiation
- Real-time message input
- Keyboard support (Enter to send)
- Timestamp display for each message
- Demo bot responses

**Features**:
- Messages stored in local array with sender and timestamp
- User messages aligned right (blue background)
- Bot messages aligned left (white background)
- Auto-scroll to latest messages
- Clean, modern UI using Tailwind CSS

### Styling Approach
The app uses **Tailwind CSS** for all styling:
- Utility-first CSS classes applied directly in templates
- No custom SCSS except for Tailwind imports in `styles.scss`
- Responsive design with flexbox layout
- Modern color scheme (slate-800 header, blue-500 accents)

## Tailwind Configuration
Tailwind is configured at the root level:
- Config file: `/root/repo/tailwind.config.js`
- Content paths: `./apps/frontend/src/**/*.{html,ts}`
- Global imports in: `apps/frontend/src/styles.scss`

## Development Commands
```bash
# Serve the frontend app
nx serve frontend

# Build the frontend app
nx build frontend

# Test the frontend app
nx test frontend

# Lint the frontend app
nx lint frontend
```

## Component Architecture
- **Standalone Components**: Using Angular's standalone component API
- **Imports**: Components import their own dependencies (CommonModule, FormsModule)
- **Two-way Binding**: Using `[(ngModel)]` for input field
- **Structural Directives**: `*ngFor` for message list rendering
- **Class Binding**: Dynamic classes based on message sender

## Future Enhancements
- Connect to backend API for real chat functionality
- Add message history persistence
- Implement typing indicators
- Add file upload support
- Support markdown rendering in messages
- Add user authentication

## Notes for AI Assistants
- Always use Tailwind CSS utility classes for styling (no custom CSS)
- Follow Angular standalone component pattern
- Keep components simple and focused
- Use TypeScript interfaces for type safety
- Follow the existing message structure for consistency
