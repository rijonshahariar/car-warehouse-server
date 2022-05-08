const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1pbhl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('carvaly').collection('cars');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '2d'
            });
            res.send({ accessToken });
        })

        // Cars API
        app.get('/cars', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const results = await cursor.toArray();
            res.send(results);
        });

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        });

        // Add New Car
        app.post('/cars', async (req, res) => {
            const newCar = req.body;
            const result = await serviceCollection.insertOne(newCar);
            res.send(result);
        });

        // update car
        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.quantity,
                    sold: updatedQuantity.sold
                }
            };
            const result = await serviceCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

        // Delete Car
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Carvaly Server Running');
});

app.listen(port, () => {
    console.log(port);
})