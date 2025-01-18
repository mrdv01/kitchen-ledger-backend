
import http from 'http';
import app from "./app/app.js";

//create the server
const PORT = process.env.PORT || 5000
const server = http.createServer(app);
server.listen(PORT, console.log(`server is listening on port ${PORT}`))


