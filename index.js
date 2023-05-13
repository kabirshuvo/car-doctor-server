const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgipu8l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("carDoctor").collection("services");
    const bookingCollection = client.db("carDoctor").collection("bookings");


    // *Services

    app.get("/services", async (req, res) => {

      // const cursor = serviceCollection.find();
      // const result = await cursor.toArray();
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });


    // *Bookings

    app.get('/bookings', async(req, res) =>{
      let query = {};
      if (req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find().toArray();
      res.send(result);
    })
    app.post('/bookings', async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        console.log(result);
        res.send(result)
        
      } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to save booking.' });
      }
      
    });


    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car Doctor Server is Running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
