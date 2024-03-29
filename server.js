const app = require("./src/app");

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log("Server is running on port hihi");
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit Server Express"));
});
