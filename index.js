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
    app.patch("/services/:id", async (req, res) => {
      const servicesId = req.params.id;
      const query = { _id: ObjectId(servicesId) };
      const ratings = req.body;
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          rating: ratings?.rating,
        },
      };
      const result = await servicesCollection.updateOne(
        query,
        updateDoc,
        option
      );
      res.send(result);
    });

    // review

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
      console.log(review);
    });
    app.get("/serviceReview/:serviceId", async (req, res) => {
      const id = req.params.serviceId;

      const query = { service: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();

      res.send(reviews);
    });
    app.get("/userReview/:emailId", async (req, res) => {
      const email = req.params.emailId;

      const query = { email: email };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();

      res.send(reviews);
    });
    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const ratings = req.body;
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          rating: ratings?.rating,
          massage: ratings?.massage,
        },
      };
      const result = await reviewCollection.updateOne(query, updateDoc, option);
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port : ", port);
});
