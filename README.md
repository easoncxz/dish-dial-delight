
# Dish Dial Delight

A meal planning and nutrition tracking application. Manage ingredients, create dishes, and track their nutritional content.

## Features

- Add and manage ingredients with nutritional information
- Create dishes by combining ingredients
- Automatically calculate nutritional information for dishes
- Import and export data

## Getting Started

### Quick Start with Nix

If you have [Nix](https://nixos.org/) installed with flakes enabled:

```sh
# Clone the repository
git clone https://github.com/yourusername/dish-dial-delight.git
cd dish-dial-delight

# Enter the development environment
nix develop

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Manual Setup

If you don't have Nix installed:

```sh
# Clone the repository
git clone https://github.com/yourusername/dish-dial-delight.git
cd dish-dial-delight

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development

### Prerequisites

- Node.js 18 or later
- npm 7 or later

### Tech Stack

- React with TypeScript
- Vite for building and development
- Tailwind CSS for styling
- shadcn/ui component library
- IndexedDB for client-side storage

### Commands

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type-check TypeScript files

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch using GitHub Actions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
