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



const uri =` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vktpy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creativeAgency").collection("services");
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const reviewsCollection = client.db("creativeAgency").collection("reviews");


    app.get('/services', (req, res)=>{
        // const services = req.body;
        servicesCollection.find({})
        .toArray((err,documents)=>{
            res.send(documents);
        })
    })


    app.post('/addAOrder', (req, res)=>{
      const file =  req.files.file;
      const name = req.body.name;
      const email = req.body.email;
      const serviceName =  req.body.serviceName;
      const price = req.body.price;
      const productDetail = req.body.productDetail;
      const serviceDescription = req.body.serviceDescription;
      const serviceImage = req.body.serviceImg
      const filePath = `${__dirname}/orders/${file.name}`;

      file.mv(filePath,err =>{
          if(err){
            res.status(500).send('failed to uplaod file')
          }
          const newImage = fs.readFileSync(filePath)
          const encodeImage = newImage.toString('base64')

          const image = {
            contentType : req.files.file.mimetype,
            size: req.files.file.size,
            img:  Buffer.from(encodeImage,'base64')
          }

          ordersCollection.insertOne({name,email,price,productDetail,image,serviceName,serviceDescription,serviceImage})
          .then(result =>{
            fs.remove(filePath,error =>{
             if(error){
              res.status(500).send('failed to uplaod file')
             }
             res.send(result.insertedCount>0)
            })
          })
      })
    })

   

    app.get('/services/:id', (req, res)=>{
        servicesCollection.find({_id:ObjectID(req.params.id)})
        .toArray((err,documents) =>{
           res.send(documents)
        })
    })

    app.get('/serviceListByEmail',(req,res)=>{
      ordersCollection.find({email:req.query.email})
      .toArray((err,documents)=>{
          res.send(documents);
      })
    })

    app.post('/addReview',(req,res)=>{
        const review = req.body;
        reviewsCollection.insertMany(review)
        .then(result =>{
          res.send(result);
        })
    })

   app.get('/getReview', (req, res)=>{
     reviewsCollection.find({})
     .toArray((err,documents)=>{
       res.send(documents);
     })
   })


   app.post('/addAService', (req, res)=>{
    const file =  req.files.file;
    const title = req.body.title;
    const description = req.body.description;
   
    const filePath = `${__dirname}/services/${file.name}`;

    file.mv(filePath,err =>{
        if(err){
          res.status(500).send('failed to uplaod file')
        }
        const newImage = fs.readFileSync(filePath)
        const encodeImage = newImage.toString('base64')

        const image = {
          contentType : req.files.file.mimetype,
          size: req.files.file.size,
          img:  Buffer.from(encodeImage,'base64')
        }

        servicesCollection.insertOne({title,description,image})
        .then(result =>{
          fs.remove(filePath,error =>{
           if(error){
            res.status(500).send('failed to uplaod file')
           }
           console.log(result);
          })
        })
    })
  })


});




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)