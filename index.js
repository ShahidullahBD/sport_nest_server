const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const PORT = process.env.PORT || 5000;


const uri = process.env.MONGODB_URI;

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
        await client.connect();

        const db = client.db('sport_nest_server');
        const allFacilitiesCollections = db.collection('all_facilities')
        const bookingsCollections = db.collection('my-bookings')

        app.get('/all-facilities', async (req, res)=>{
            const result = await allFacilitiesCollections.find().toArray()
            res.json(result)
        })

        app.get('/all-facilities/:id', async (req, res)=>{
            const {id} = req.params;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await allFacilitiesCollections.findOne(query)
            res.json(result)
        })

        app.post('/my-bookings', async (req, res)=>{
            const bookingData = req.body;
            console.log(bookingData, 'bookingData');
            const result = await bookingsCollections.insertOne(bookingData);
            res.send(result);
        })

        app.get('/my-bookings', async (req, res)=>{
            const result =await bookingsCollections.find().toArray();
            res.json(result);
        })

        app.delete('/my-bookings/:id', async (req, res)=>{
            const {id} = req.params
            const query = {
                _id: new ObjectId(id)
            }
            const result = bookingsCollections.deleteOne(query);
            res.send(result);
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



app.get('/', (req, res) => {
    res.send('Server is running Fine!')
})

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})