# Drawing Masters App

A professional art drawing application built with Next.js and TypeScript.

## Features

- 🚀 Server-side rendering with Next.js
- ⚡️ Fast page transitions with App Router
- 📦 Asset optimization and bundling
- 🎨 Professional drawing tools
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [Next.js docs](https://nextjs.org/docs)

## Getting Started

### Installation

Install the dependencies using pnpm:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Your application will be available at `http://localhost:3000`.

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t drawing-masters-app .

# Run the container
docker run -p 3000:3000 drawing-masters-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Vercel
- Netlify

### Vercel Deployment

This app is optimized for deployment on Vercel:

```bash
vercel
```

### DIY Deployment

If you're familiar with deploying Next.js applications, the built-in app server is production-ready.

Make sure to deploy the output of `pnpm build`

```bash
├── package.json
├── pnpm-lock.yaml
├── .next/
│   ├── static/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This application uses [Tailwind CSS](https://tailwindcss.com/) for styling, providing a clean and responsive user interface for the drawing application.

---

Built with ❤️ using Next.js.
