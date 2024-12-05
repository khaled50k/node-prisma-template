const server = require("./server");


const port = process.env.PORT || 5000;
const startServer = () => {
  server.listen(port, () => {
    console.log("Starting server on port " + port);
  });
};
startServer();