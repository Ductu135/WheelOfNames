# Wheel of Names - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React TypeScript project for a Wheel of Names clone - a spinning wheel name picker application.

## Project Overview
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS modules or styled-components
- **Key Features**:
  - Interactive spinning wheel with customizable segments
  - Add/remove/edit names functionality
  - Smooth spinning animation with realistic physics
  - Random winner selection
  - Results history tracking
  - Responsive design for mobile and desktop

## Code Style Guidelines
- Use functional components with React hooks
- Implement TypeScript interfaces for props and state
- Use CSS-in-JS or CSS modules for styling
- Follow React best practices for performance optimization
- Use semantic HTML for accessibility
- Implement smooth animations using CSS transitions or libraries like Framer Motion

## Key Components to Implement
1. **WheelComponent**: Main spinning wheel with segments
2. **NameInput**: Add/edit names interface
3. **SpinButton**: Trigger wheel spinning
4. **ResultsDisplay**: Show current and previous winners
5. **SettingsPanel**: Customize wheel appearance and behavior

## Animation Requirements
- Smooth wheel rotation with easing
- Realistic deceleration physics
- Visual feedback during spinning
- Clear winner indication
