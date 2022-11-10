const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middle wears
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("backend is working");
});

//verifyJWT function

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ massage: "unauthorize" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ massage: "unauthorize" });
    }
    req.decoded = decoded;
    next();
  });
};
// mongo db connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdtrwss.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    //  send the user JWT token

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "7d",
      });
      res.send({ token });
    });

    // create DB and collections
    const servicesCollection = client
      .db("Assignment-11")
      .collection("services");
    const reviewCollection = client.db("Assignment-11").collection("reviews");
    const equipmentCollection = client
      .db("Assignment-11")
      .collection("equipment");

    // send equipment

    app.get("/equipment", async (req, res) => {
      const query = {};
      const cursor = equipmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //   services api

    //get 3 services
    app.get("/services/3", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      const lastServices = services.reverse().slice(0, 3);
      console.log(lastServices);
      res.send(lastServices);
    });
    //  get all services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
      console.log(services);
    });
    // get a service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // send service data to database
    app.post("/services", verifyJWT, async (req, res) => {
      const services = req.body;
      const result = await servicesCollection.insertOne(services);
      res.send(result);
      console.log(services);
    });
    // // review api

    // send review data to database

    app.post("/review", verifyJWT, async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
      console.log(review);
    });
    // get review data by a service id
    app.get("/serviceReview/:serviceId", async (req, res) => {
      const id = req.params.serviceId;

      const query = { service: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      const reviewsByTime = reviews
        .sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        )
        .reverse();
      res.send(reviewsByTime);
    });
    // get review data by a user email
    app.get("/userReview/:emailId", verifyJWT, async (req, res) => {
      const email = req.params.emailId;

      const query = { email: email };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      const reviewsByTime = reviews
        .sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        )
        .reverse();

      res.send(reviewsByTime);
    });
    // update review by review id
    app.patch("/review/:id", verifyJWT, async (req, res) => {
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
    //delete review by review id
    app.delete("/review/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port : ", port);
});
