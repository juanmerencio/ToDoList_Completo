# Todo List — Frontend (React + Vite)

    npm install
    npm run dev      # http://localhost:5173 (proxy /api -> http://localhost:3333)

Backend: coloque `tasks.js` em `routes/tasks.js` e aplique o ajuste de CORS no `server.js`
(`methods: ['GET','POST','PATCH','DELETE']`), senão PATCH/DELETE falham no navegador.
