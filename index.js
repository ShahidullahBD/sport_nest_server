const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const jose = require('jose');
const dotenv = require('dotenv');
const app = express();

// console.log(jose, 'jose');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

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

// const JWKS = createRemoteJWKSet(
//     new URL(`${process.env.CLIENT_RUL}/api/auth/jwks`)
// )
// console.log(JWKS, 'jwks');

// const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);



const verifyToken = async (req, res, next) => {
    const { authorization } = req.headers;
    // console.log(req.headers, 'from verify token');
    if (!authorization) {
        return res.status(401).send({
            message: 'Unauthorized access'
        });
    }
    const token = authorization.split(' ')[1];
    // console.log('token', token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const JWKS = createRemoteJWKSet(
            new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
        )
        const { payload } = await jwtVerify(token, JWKS,)
        // console.log(payload);
        req.user = payload;
        next()

    } catch (error) {
        console.error('Token validation failed:', error)
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

};

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db('sport_nest_server');
        const allFacilitiesCollections = db.collection('all_facilities')
        const bookingsCollections = db.collection('my-bookings')

        app.get('/all-facilities', async (req, res) => {
            const result = await allFacilitiesCollections.find().toArray()
            res.json(result)
        })

        app.get('/all-facilities/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await allFacilitiesCollections.findOne(query)
            res.json(result)
        })

        app.post('/my-bookings', async (req, res) => {
            const bookingData = req.body;
            // console.log(bookingData, 'bookingData');
            // bookingData.userEmail = req.user.email;
            const result = await bookingsCollections.insertOne(bookingData);
            res.send(result);
        })

        app.get('/my-bookings/:userId', async (req, res) => {
            const {userId} = req.params;
            // const email = req.user.email;
            // console.log(email, 'email');
            // const query = {
            //     userEmail: email
            // };
            const result = await bookingsCollections.find({userId}).toArray();
            res.send(result);
        })

        app.delete('/my-bookings/:id', verifyToken, async (req, res) => {
            const { id } = req.params
            const query = {
                _id: new ObjectId(id)
            }
            const result = await bookingsCollections.deleteOne(query);
            res.send(result);
        })

        app.post('/add-facility', verifyToken, async (req, res) => {

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