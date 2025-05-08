# Drawing Masters App

A professional art drawing application with advanced features including Three.js for 3D drawing, real-time collaboration, AI-assisted drawing, and more.

## Features

- 🎨 Advanced drawing tools with Canvas API and Three.js
- 🚀 Real-time collaboration with WebSockets
- 🤖 AI-assisted drawing with Claude API
- 🖼️ Image generation with Stable Diffusion
- 📊 Vector database for similar drawing search
- 📱 Responsive design with TailwindCSS
- ✨ Smooth animations with Framer Motion
- 🔒 TypeScript for type safety
- 🌐 Next.js for server-side rendering
- 🐳 Docker for containerization
- ☁️ AWS-ready deployment
- 🚀 Redis for caching and real-time features

## Tech Stack

- **Frontend**: React, TypeScript, Next.js, TailwindCSS, Three.js, Framer Motion
- **Backend**: Node.js, Express, WebSockets, Redis
- **AI**: Claude API, Stable Diffusion
- **Database**: Pinecone Vector Database
- **DevOps**: Docker, AWS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (optional, for containerization)
- Redis (optional, for local development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/twinkiesdraw.git
cd twinkiesdraw
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your API keys and configuration
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Server Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install server dependencies:

```bash
pnpm install
```

3. Set up server environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:

```bash
pnpm dev
```

## Development

### Project Structure

```
twinkiesdraw/
├── .husky/              # Git hooks
├── public/              # Static assets
├── server/              # Backend server
│   ├── cache/           # Server-side caching
│   ├── db/              # Database connections
│   ├── routes/          # API routes
│   └── index.ts         # Server entry point
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and libraries
│       ├── ai/          # AI integrations
│       ├── cache/       # Client-side caching
│       ├── three/       # Three.js integrations
│       ├── vectordb/    # Vector database integrations
│       └── websocket/   # WebSocket client
├── .env.example         # Example environment variables
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker configuration
└── package.json         # Project dependencies and scripts
```

### Available Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm format`: Format code with Prettier

## Deployment

### Docker Deployment

1. Build the Docker images:

```bash
docker-compose build
```

2. Start the containers:

```bash
docker-compose up -d
```

### AWS Deployment

The application is configured for deployment on AWS using:

- Amazon ECS for container orchestration
- Amazon S3 for static assets
- Amazon CloudFront for CDN
- Amazon ElastiCache for Redis
- Amazon EC2 or AWS Lambda for serverless functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Three.js](https://threejs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Stable Diffusion](https://stability.ai/)
- [Pinecone](https://www.pinecone.io/)
- [Redis](https://redis.io/)