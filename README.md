# 🎡 Wheel of Names

A modern, interactive spinning wheel application for randomly selecting names built with React and TypeScript.

## ✨ Features

- **Interactive Spinning Wheel**: Smooth, realistic wheel spinning animation with physics-based deceleration
- **Dynamic Segments**: Automatically adjusts wheel segments based on the number of names
- **Name Management**: Easy add/remove names with real-time updates
- **Winner History**: Track the last 10 winners with timestamps
- **Responsive Design**: Works perfectly on both desktop and mobile devices
- **Beautiful UI**: Modern gradient design with glassmorphism effects
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd WheelOfNames
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 How to Use

1. **Add Names**: Type a name in the input field and click "Add Name" or press Enter
2. **Remove Names**: Click the "×" button next to any name to remove it
3. **Spin the Wheel**: Click the red "SPIN" button in the center of the wheel
4. **View Results**: The winner will be announced with a celebration animation
5. **Check History**: View recent winners in the history section

## 🛠️ Built With

- **React 18** - UI framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **CSS3** - Modern styling with animations and responsive design

## 📱 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Customization

You can easily customize the wheel appearance by modifying the colors in the `getSegmentColor` function in `App.tsx`:

```typescript
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.
