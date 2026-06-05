const express = require('express');
const app = express()
var cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;


const uri = process.env.DB_URI
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("hire_loop");

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged MongoDB successfully!");

        app.get("/", async (req, res) => {
            res.send("hello world")
        })

        // company
        const company = database.collection("company");
        app.post("/company",async(req,res)=>{
            const company_data = req.body;
            // console.log(company_data)
            const result = await company.insertOne(company_data);
            res.json(result);
        })

        app.get("/company",async(req,res)=>{
            const result = await company.find().toArray();
            res.json(result);
        })

        

    } finally {

    }
}


run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});