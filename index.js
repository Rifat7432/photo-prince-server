const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middle wears
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("backend is working");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdtrwss.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    const servicesCollection = client
      .db("Assignment-11")
      .collection("services");
    const reviewCollection = client.db("Assignment-11").collection("reviews");
    // services
    app.get("/services/3", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = (await cursor.toArray()).reverse();
      const lastServices = services.slice(0, 3);

      console.log(lastServices);

      res.send(lastServices);
    });
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // review

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
  
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port : ", port);
});
