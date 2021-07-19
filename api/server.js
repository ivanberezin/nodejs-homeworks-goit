const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const contactRouter = require('./contacts/contact.router');

require('dotenv').config();

module.exports = class ContactsServer {

  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
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

  async initDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log("Database connection successful");
    } catch (err) {
      console.log("Database connection failed", err);
      process.exit(1);
    }
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {
      console.log("Server started listening on port", process.env.PORT);
    });
  }

}
