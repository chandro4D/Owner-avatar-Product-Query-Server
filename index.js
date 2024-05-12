const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
    origin:['http://localhost:5173','http://localhost:9000'],
    credentials: true,
    optionSuccessStatus:200,
}
// middleWare
app.use(cors(corsOptions))
app.use(express.json())

// ------------mongo db start--------


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ethrwxc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //  await client.connect();
    

    const queryCollection = client.db('queriesDB').collection('queries');
    app.post('/query',async(req,res) => {
        const newQuery = req.body;
        console.log(newQuery);
        const result = await queryCollection.insertOne(newQuery);
        res.send(result);
    })
    //----------------- get all query added by user----------------
    app.get('/query',async(req,res) => {
        const result = await queryCollection.find().sort({ date: -1 }).toArray()
        res.send(result)
    })
    //---------------- only for home page----------------
    app.get('/queries',async(req,res) => {
        const result = await queryCollection.find().sort({ date: -1 }).skip(0).limit(6).toArray()
        res.send(result)
    })
    // -------------get all query added by specific user-------------
    app.get('/query/:email',async(req,res) => {
        const email = req.params.email
        const query = {email:email}
        const result = await queryCollection.find(query).sort({ date: -1 }).toArray()
        res.send(result)
    })

    // Send a ping to confirm a successful connection
     await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// -----------------mongo db end---------------------

app.get('/',(req,res) => {
    res.send('query server is running very first')
})

app.listen(port,() => {
    console.log(`query server is running on port ${port}`)
})