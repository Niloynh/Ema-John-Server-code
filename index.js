const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvgc4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      
      const database = client.db("online_shop");
      const productCollection = database.collection("products");
      const orderCollection = database.collection("order")
        
      app.get('/products' , async(req , res)=>{
        
            const cursor = productCollection.find({})
            const page = req.query.page 
            const size = parseInt(req.query.size) 
            let products;
            const count = await cursor.count()
            if(page){
              products = await cursor.skip(page * size).limit(size).toArray()
            }
            else{
              products = await cursor.toArray()
            }
            
            res.send({
              count,
              products
            })
      
      })

      app.post('/products/bykeys' , async(req , res)=>{
        const keys = req.body 
        const query = {key: {$in: keys}}
        const products = await productCollection.find(query).toArray() 
        res.json(products)
      
      })

      app.post('/order' , async(req , res)=>{
          const order = req.body 
          const products = await orderCollection.insertOne(order)
          res.json(products)
      
      })
      
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/' , (req , res)=>{

   res.send('hello from simple server :)')

})

app.listen(port, () => {
    console.log(`Server started on port`, port);
});