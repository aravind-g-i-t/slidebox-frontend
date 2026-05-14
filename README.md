# SlideBox Frontend

Frontend application for SlideBox image gallery.

## Tech Stack

- React
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Axios
- Vite

---

# Features

- JWT authentication
- Infinite scrolling
- Drag & drop image reordering
- Image upload
- Edit image title
- Replace image
- Responsive gallery UI

---

# Prerequisites

Make sure you have installed:

- Node.js (v18 or later)
- npm

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in frontend root.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# Run Development Server

```bash
npm run dev
```

Application will run on:

```txt
http://localhost:5173
```

---

# Build Project

```bash
npm run build
```

---

# Preview Production Build

```bash
npm run preview
```

---

# Project Structure

```txt
src/
│
├── api/
├── components/
├── pages/
├── redux/
├── services/
├── types/
└── utils/
```

---

# Authentication Flow

- Access token stored in memory
- Refresh token stored in HTTP-only cookie
- Automatic token refresh using Axios interceptors

---

# Drag and Drop Reordering

Images can be reordered using drag-and-drop functionality.

The frontend sends:

```json
{
  "draggedId": "image-id",
  "targetOrder": 5
}
```

to backend for optimized reordering.

---

# Scripts

```bash
npm run dev
npm run build
npm run preview
```