const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload')
var fs = require('fs-extra');
require('dotenv').config()





const port = 4000;
const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('orders'))
app.use(express.static('services'))
app.use(fileUpload())



const uri = ` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vktpy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creativeAgency").collection("services");
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const reviewsCollection = client.db("creativeAgency").collection("reviews");
  const adminCollection = client.db("creativeAgency").collection("admin");

  app.get('/services', (req, res) => {
    // const services = req.body;
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.post('/addAOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const serviceName = req.body.serviceName;
    const price = req.body.price;
    const productDetail = req.body.productDetail;
    const serviceDescription = req.body.serviceDescription;
    const serviceImage = req.body.serviceImg;


    const newImage = file.data;
    const encodeImage = newImage.toString('base64')

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encodeImage, 'base64')
    }

    ordersCollection.insertOne({ name, email, price, productDetail, image, serviceName, serviceDescription, serviceImage})
      .then(result => {
        console.log(result)
        res.send(result.insertedCount > 0)
      })
  })



  app.get('/services/:id', (req, res) => {
    servicesCollection.find({ _id: ObjectID(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/serviceListByEmail', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewsCollection.insertOne(review)
      .then(result => {
        res.send(result);
      })
  })

  app.get('/getReview', (req, res) => {
    reviewsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.post('/addAService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;

    const newImage = file.data;
    const encodeImage = newImage.toString('base64')

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encodeImage, 'base64')
    }


  })

  app.get('/admins', (req,res)=>{
    // console.log(req.body)
    adminCollection.find({})
    .toArray((err, documents)=>{
      if(err){
        console.log(err)
        res.status(500).send({message:'Something went wrong'})
      }
      res.status(200).send(documents)
    })
  })


  app.get('/allOrders', (req, res)=>{
    ordersCollection.find({})
    .toArray((err, documents)=>{
      if(err){
        res.status(500).send({message: 'Something went wrong'})
      }
      res.status(200).send(documents)
    })
  })


});




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)