# Luma Live

Arabic live video studio with MediaPipe face filters, Canvas capture, WebRTC peer connections, and Socket.IO signaling.

## Run locally

Start the backend in one terminal:

```sh
cd ../backend
npm install
npm run dev
```

Start the frontend in another terminal:

```sh
npm install
npm run dev
```

Open the Vite URL, allow camera and microphone access, then create or join a room. Camera access requires localhost or HTTPS. The model is fetched from Google's MediaPipe model storage; Vite serves the WASM runtime locally during development.

Rooms use MongoDB when `MONGODB_URI` is configured in `backend/.env`; otherwise the backend uses temporary in-memory room metadata. Media travels directly between peers. A TURN server may be needed for connections across restrictive NATs; configure one in `src/hooks/useLiveStudio.js` for production.
