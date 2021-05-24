const express = require('express');
const cors = require('cors');

const contactRouter = require('./contacts/contact.router');
require('dotenv').config();

const PORT = process.env.PORT || 3000

module.exports = class ContactsServer {

  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: "http://localhost:3000" }));
  }

  initRoutes() {
    this.server.use("/api/contacts", contactRouter);
  }

  startListening() {
    this.server.listen(PORT, () => {
      console.log("Server started listening on port", PORT);
    });
  }

}
