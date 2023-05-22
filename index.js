const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
var jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
// const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgipu8l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJWT = (req, res, next) => {
  console.log('hitting veryfy JWT')
  console.log(req.headers.authorization)
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message: 'unAuthorised Access'})
  }

  const token = authorization.split(' ')[1];
  console.log('token inside Verify JWT', token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if(error){
      return res.send({error: true, message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db("carDoctor").collection("services");
    const bookingCollection = client.db("carDoctor").collection("bookings");



    // jwt 'jot' token: 

    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      console.log(token)
      res.send({token});
    })


    // *Services routes

    app.get("/services", async (req, res) => {
const query ={};
const options = {
  // sort matched documents in decending order
  sort: {"price": -1}
}
      // const cursor = serviceCollection.find();
      // const result = await cursor.toArray();
      const result = await serviceCollection.find(query, options).toArray();
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


    // *Bookings routes

    app.get('/bookings', verifyJWT, async(req, res) =>{
      const decoded = req.decoded;
      console.log('came back after verify', decoded)

      if(decoded.email !== req.query.email){
        return res.status(403).send({error: 1, message: 'forbidden access'})
      }

      let query = {};
      if (req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
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

    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updateDoc = {
        $set:{
          status: updatedBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result);
    })


    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
