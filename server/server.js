const app = require("./app");
const { port } = require("./config/env");
const { testDatabaseConnection } = require("./config/database");

async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();