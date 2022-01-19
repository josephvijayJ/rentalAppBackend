const express = require('express');
const app = express();
const Mongodb = require('mongodb');
const MongoClient = Mongodb.MongoClient;

const cors = require('cors');
const bycrypt = require('bcryptjs');
const bcrypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const { is } = require('express/lib/request');

// const SECRET = '12345';
// const URL = 'mongodb://localhost:27017';
const URL =
  'mongodb+srv://Jose:IA3wGNw4fXllQPrt@josephcluster.sasww.mongodb.net/usersdata?retryWrites=true&w=majority';
let options = {
  origin: '*',
};
app.use(cors(options));
app.use(express.json());

//Authenticate function

// let authenticate = (req, res, next) => {
//   if (req.headers.authorization) {
//     try {
//       let result = jwt.verify(req.headers.authorization, SECRET);
//       if (result) {
//         next();
//       }
//     } catch (error) {
//       res.status(401).json({ message: 'token expired' });
//     }
//   } else {
//     res.status(401).json({ message: 'you are not authorized' });
//   }
// };

app.post('/addproduct', async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db('rentalapp');
    await db.collection('products').insertOne(req.body);
    await connection.close();
    res.json({ message: 'Product added successfully' });
  } catch (error) {
    console.log(error, 'whats the error');
  }
});

app.get('/allproduct', async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db('rentalapp');
    const allproduct = await db.collection('products').find({}).toArray();
    await connection.close();
    res.json(allproduct);
  } catch (error) {
    console.log(error, 'whats the error');
  }
});

app.post('/signup', async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db('rentalapp');

    let user = await db.collection('users').findOne({ email: req.body.email });
    if (!user) {
      // to Protect the password
      const salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      await db.collection('users').insertOne(req.body);
      await connection.close();

      res.json({ message: 'Signed up successfully' });
    } else {
      res.json({ message: 'Email Already exists' });
    }
  } catch (error) {
    console.log(error, 'whats the error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db('rentalapp');

    let user = await db.collection('users').findOne({ email: req.body.email });

    if (user) {
      let passwordResult = await bycrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordResult) {
        //Generate the token
        // let token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '2h' });

        await connection.close();
        // res.json({ token });
        res.json({ message: 'logged in successfully' });
      } else {
        res.json({ message: 'email or password is wrong' });
      }
    } else {
      res.json({ message: 'no users found' });
    }
  } catch (error) {
    console.log(error, 'whats the error');
  }
});

app.listen(process.env.PORT || 3003, () => {
  console.log('started the server');
});
