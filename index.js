const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('toy robot server running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.czarj6h.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const robotCollection = client.db('robotDB').collection('robotes')

        const indexKey = {subCategory: 1, toyName:1}
        const indexOptions = {name: 'nameCategory'}
        const result = await robotCollection.createIndex(indexKey, indexOptions)
        console.log(result)
        
        app.get('/findJob/:text', async (req, res) => {
            const text = req.params.text
            const result = await robotCollection.find({
                $or: [
                    {toyName: {$regex: text, $options: 'i'}},
                    {subCatagory: {$regex: text, $options: 'i'}}
                ]
            }).toArray()
            res.send(result)
        })

        // app.get("/getJobsByText/:text", async (req, res) => {
        //     const text = req.params.text;
        //     const result = await jobsCollection
        //       .find({
        //         $or: [
        //           { title: { $regex: text, $options: "i" } },
        //           { category: { $regex: text, $options: "i" } },
        //         ],
        //       })
        //       .toArray();
        //     res.send(result);
        //   });

        app.get('/robots', async (req, res) => {
            const categorry = req.query.subCatagory
            const query = { subCategory: categorry }
            if (categorry == 'OwnRobots' || categorry == 'RemoteControl' || categorry == 'SmartRobots') {
                const result = await robotCollection.find(query).toArray()
                return res.send(result)
            }
            const result = await robotCollection.find().toArray()
            res.send(result)
        })

        app.get('/robot/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await robotCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/addToy', async (req, res) => {
            const toy = req.body
            console.log(toy)
            const result = await robotCollection.insertOne(toy)
            res.send(result)
        })

        app.put('/updateToy/:id',async (req, res) => {
            const body = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }

            const updateDoc = {
                $set: {
                    toyDetails: body.toyDetails,
                    availableQuantity: body.availableQuantity,
                    price: body.price
                }
            }
            const result = await robotCollection.updateOne(filter,updateDoc)
            res.send(result)
        })

        app.delete('/robot/:id',async (req, res) => {
            const id = req.params.id
            const query = {_id: new ObjectId (id)}
            const result = await robotCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`server running on port ${port}`)
})

