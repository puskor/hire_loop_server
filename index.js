const express = require('express');
const app = express()
var cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
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

        app.get("/", async (req, res) => {
            res.send("hello world")
        })

        // company
        const company = database.collection("company");
        app.post("/api/company", async (req, res) => {
            const company_data = req.body;
            const token = req.headers;
            console.log("token", token)
            // console.log(company_data)
            const result = await company.insertOne(company_data);
            res.json(result);
        })
        app.get("/api/company", async (req, res) => {
            const filter = {}
            if (req.query.user_id) {
                filter.
                    userId = req.query.user_id;
            }
            const result = await company.find(filter).toArray();
            res.json(result);
        })


        const verifyToken = (req,res,next)=>{
            console.log("this is verifyToken user ",req.headers)
            next()
        }

        app.patch("/api/company/:id", verifyToken ,async  (req, res) => {
            try {

                const id = req.params.id;
                // console.log(id)
                const { status } = req.body;

                const result = await company.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            status: status,
                        },
                    }
                );
                // console.log(result, "result")

                res.json({
                    success: true,
                    message: "Status updated successfully",
                    result,
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Job

        const jobs = database.collection("jobs");
        app.post("/api/job", async (req, res) => {
            const jobData = await req.body;
            const token = req.headers;
            console.log("token", token)
            const result = await jobs.insertOne(jobData);
            res.json(result)
        })

        app.get("/api/jobs", async (req, res) => {
            const filter = {};

            if (req.query.user_id) {
                filter.postmanId = req.query.user_id;
            }

            if (req.query.job_id) {
                filter._id = new ObjectId(req.query.job_id);
            }

            const result = await jobs.aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: "company",
                        let: { companyId: { $toObjectId: "$companyId" } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$companyId"]
                                    }
                                }
                            }
                        ],
                        as: "company"
                    }
                },
                { $unwind: "$company" },
                {
                    $match: {
                        "company.status": "approved"
                    }
                }
            ]).toArray();

            res.json(result);
        });


        const apply = database.collection("job_apply");
        app.post("/api/job_apply", async (req, res) => {
            const apply_data = await req.body;
            const result = await apply.insertOne(apply_data);
            res.json(result)
        })

        app.get("/api/job_apply", async (req, res) => {
            const filter = {};

            if (req.query.user_id) {
                filter.applierId = req.query.user_id
            }

            const result = await apply.find(filter).toArray()
            res.json(result);
        })





    } finally {

    }
}


run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});