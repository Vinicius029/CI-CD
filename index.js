const http = require("http");

const PORT = process.env.PORT || 3000;

// Banco de dados em memória
let tasks = [
  { id: 1, title: "Aprender CI/CD", done: false },
  { id: 2, title: "Configurar GitHub Actions", done: false },
];
let nextId = 3;

// Helpers
const sendJSON = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const getBody = (req) =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });

// Roteador
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const parts = url.split("/").filter(Boolean); // ["api", "tasks", "1"]

  // GET /
  if (method === "GET" && url === "/") {
    return sendJSON(res, 200, { message: "API Node.js 🚀", status: "online" });
  }

  // GET /health
  if (method === "GET" && url === "/health") {
    return sendJSON(res, 200, { status: "ok", uptime: process.uptime() });
  }

  // /api/tasks
  if (parts[0] === "api" && parts[1] === "tasks") {
    const id = parts[2] ? parseInt(parts[2]) : null;

    // GET /api/tasks
    if (method === "GET" && !id) {
      return sendJSON(res, 200, { data: tasks, total: tasks.length });
    }

    // GET /api/tasks/:id
    if (method === "GET" && id) {
      const task = tasks.find((t) => t.id === id);
      if (!task) return sendJSON(res, 404, { error: "Tarefa não encontrada" });
      return sendJSON(res, 200, { data: task });
    }

    // POST /api/tasks
    if (method === "POST" && !id) {
      const body = await getBody(req);
      if (!body.title || body.title.trim() === "") {
        return sendJSON(res, 400, { error: "O campo 'title' é obrigatório" });
      }
      const newTask = { id: nextId++, title: body.title.trim(), done: false };
      tasks.push(newTask);
      return sendJSON(res, 201, { data: newTask });
    }

    // PUT /api/tasks/:id
    if (method === "PUT" && id) {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1)
        return sendJSON(res, 404, { error: "Tarefa não encontrada" });
      const body = await getBody(req);
      if (body.title !== undefined) tasks[index].title = body.title.trim();
      if (body.done !== undefined) tasks[index].done = Boolean(body.done);
      return sendJSON(res, 200, { data: tasks[index] });
    }

    // DELETE /api/tasks/:id
    if (method === "DELETE" && id) {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1)
        return sendJSON(res, 404, { error: "Tarefa não encontrada" });
      tasks.splice(index, 1);
      res.writeHead(204);
      return res.end();
    }
  }

  // 404 — rota não encontrada
  sendJSON(res, 404, { error: `Rota '${url}' não encontrada` });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`\nEndpoints disponíveis:`);
  console.log(`  GET    /`);
  console.log(`  GET    /health`);
  console.log(`  GET    /api/tasks`);
  console.log(`  GET    /api/tasks/:id`);
  console.log(`  POST   /api/tasks`);
  console.log(`  PUT    /api/tasks/:id`);
  console.log(`  DELETE /api/tasks/:id`);
});