const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.ihnyz1z.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();

    const toyCollection = client.db("collectionMart").collection("services");
    const indexKeys = { title: 1, category: 1 };
    const indexOptions = { name: "titleCategory" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    // all toy
    app.get("/all-toy", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/sub-category", async (req, res) => {
      const subCategoryName = req.query?.category;
      const subCategories = await toyCollection
        .find({
          sub_category: subCategoryName,
        })
        .toArray();
      const result = {
        category_name: subCategoryName,
        subCategories,
      };

      res.send(result);
    });

    app.get("/search/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({ name: { $regex: text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.post("/add-new-toy", async (req, res) => {
      const updatedToy = req.body;

      const updateToy = {
        photo_url: updatedToy.photo_url,
        name: updatedToy.name,
        price: updatedToy.price,
        seller_name: updatedToy.seller_name,
        seller_email: updatedToy.seller_email,
        sub_category: updatedToy.sub_category,
        rating: updatedToy.rating,
        quantity: updatedToy.quantity,
        description: updatedToy.description,
      };

      const result = await toyCollection.insertOne(updateToy);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { seller_email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });


     app.get('/services', async (req, res) => {
            const sort = req.query.sort;
            const search = req.query.email;
            console.log(search);
            const query = {seller_email: search}
            const options = {
                sort: { 
                    "price": sort === 'asc' ? 1 : -1
                }
                
            };
            const cursor = toyCollection.find(query, options);
            const result = await cursor.toArray();
            res.send(result);
        })


    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);

      const updateToy = {
        $set: {
          photo_url: updatedToy.photo_url,
          name: updatedToy.name,
          price: updatedToy.price,
          seller_name: updatedToy.seller_name,
          seller_email: updatedToy.seller_email,
          sub_category: updatedToy.sub_category,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };

      const result = await toyCollection.updateOne(filter, updateToy);
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    client.db("admin").command({ ping: 1 });
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
  res.send("assignment 11 is running");
});

app.listen(port, () => {
  console.log(`Assignment 11 server is running port ${port}`);
});
