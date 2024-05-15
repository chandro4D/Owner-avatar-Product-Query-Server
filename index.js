const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: [`https://product-query-client.web.app`,'http://localhost:5173','https://product-query-client.web.app','https://product-query-client.firebaseapp.com'],
  credentials: true,
  optionSuccessStatus: 200,
}
// middleWare
app.use(cors())
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
    const recommendCollection = client.db('recommendDb').collection('recommend');

// --------------post recommend------------------
app.post('/recommend', async (req, res) => {
  const recommendationData = req.body;
  console.log(recommendationData);
  const result = await recommendCollection.insertOne(recommendationData);
  res.send(result);
})
// ----------Post Data (01)------------

// get all recommend data ----------------------
app.get('/recommend', async (req, res) => {
  const result = await recommendCollection.find().sort({ date: -1 }).toArray();
  res.send(result)
})
// ---------------specific user recommendation-------------------
app.get('/recommend/:userEmail', async (req, res) => {
  const userEmail = req.params.userEmail
  const query = { userEmail : userEmail }
  const result = await recommendCollection.find(query).sort({ date: -1 }).toArray()
  res.send(result)
})
// ----------------delete recommendation----------------------
app.delete('/recommend/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await recommendCollection.deleteOne(query);
  res.send(result);
})
// --------------------------------------------
    app.post('/query', async (req, res) => {
      const newQuery = req.body;
      console.log(newQuery);
      const result = await queryCollection.insertOne(newQuery);
      res.send(result);
    })
   
     

     
    //----------------- get all query added by user(queries)----------------
    // -------------------------------------------
    app.get('/query', async (req, res) => {
      const result = await queryCollection.find().sort({ date: -1 }).toArray();
      res.send(result)
    })

    // -------------get one for details page------------------
  //  ------------------------------
    app.get('/query/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }

      // const options = {
      //   projection: {ProductName: 1,_id: 1},
      // };
      const result = await queryCollection.findOne(query);
      res.send(result);
    })

    
    
    //---------------- only for home page----------------
    // -----------------------------
    app.get('/queries', async (req, res) => {
      const result = await queryCollection.find().sort({ date: -1 }).skip(0).limit(8).toArray()
      res.send(result)
    })

    
    
    // -------------get all query added by specific user-------------
    app.get('/queries/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await queryCollection.find(query).sort({ date: -1 }).toArray()
      res.send(result)
    })
  
    // ---------------------Delete One--------------------
    app.delete('/query/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await queryCollection.deleteOne(query);
      res.send(result);
    })
    
      

   
    
    // -----------update data----------
    app.put('/query/:id',async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updatedData = req.body;
      const data = {
        $set: {
          QueryTitle: updatedData.QueryTitle,
          BoycottingReasonDetails: updatedData.BoycottingReasonDetails,
          ProductBrand: updatedData.ProductBrand,
          ProductName: updatedData.ProductName,
          ImageURL: updatedData.ImageURL
        }
      }
      const result = await queryCollection.updateOne(filter,data,options);
      res.send(result);
    })

    // ------------get data for update---------------
  
  
    

   
    


    // Send a ping to confirm a successful connection
    //  await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// -----------------mongo db end---------------------

app.get('/', (req, res) => {
  res.send('query server is running very first')
})

app.listen(port, () => {
  console.log(`query server is running on port ${port}`)
})