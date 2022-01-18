const express = require('express'),
    morgan = require('morgan');
const app = express();
var bodyParser = require('body-parser')

const { check, validationResult } = require('express-validator');

app.use(morgan('common'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));


const mongoose = require('mongoose');
const Models = require('./models.js');

const Weddings = Models.Wedding;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/weddingDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })

//Importing cors
const cors = require('cors');

app.use(cors());

//Importing auth.js file to the project
let auth = require('./auth.js')(app);

//importing passport.js file to the project
const passport = require('passport');
require('./passport');



//add a user
app.post('/users',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alpha numeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does is not valid').isEmail()
    ],
    (req, res) => {
        // check the validation object for errors
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username })
        // Search to see if a user with the requested username already exists
            .then((user) => {
                if(user) {
                    return res.status(400).send(req.body.Username + 'already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

//Get all users
app.get('/users', (req, res) => {
    
    console.log('checkingxoxo');
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})

//Get a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//Update user's info

app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email
            }
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });

});


//Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' has been deleted.');
            }
        })
        .catch((err) => { 
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Add a wedding plan to user's list
app.post('/users/:Username/weddings/:weddingID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { PlannedWeddings: req.params.weddingID }
    },
    { new: true }, //This line makes sure teh updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});



//Get all weddings
app.get('/weddings', passport.authenticate('jwt', { session: false }), (req, res) => {
    Weddings.find()
        .then((weddings) => {
            res.status(201).json(weddings);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get single wedding
app.get('/weddings/:Id', (req, res) => {
    Weddings.findOne({_id: req.params.id })
    .then((idOfWedding) => {
        res.status(201).json(idOfWedding);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Post a wedding to the database
app.post('/weddings', (req, res) => {
    Weddings
        .create({
            Image1: req.body.Image1,
            Image2: req.body.Image2,
            Image3: req.body.Image3,
            NameofCouple: req.body.NameOfCouple,
            Nickname: req.body.Nickname,
            Venue: req.body.Venue,
            Date: req.body.Date,
            Time: req.body.Time,
            Officiating: {
                Lead: req.body.Lead,
                Bridesmaids: req.body.Bridesmaids,
                Groomsmen: req.body.Groomsmen
            },
            ServiceSchedule: {
                Processional: req.body.Processional,
                Item2: req.body.Item2,
                Item3: req.body.Item3,
                Item4: req.body.Item4,
                Item5: req.body.Item5,
                Item6: req.body.Item6,
                Item7: req.body.Item7,
                Item8: req.body.Item8,
                Item9: req.body.Item9,

            },
            Reading: req.body.Reading,
            Songs: req.body.Songs,
            Reception: req.body.Reception,
            ReceptionTime: req.body.ReceptionTime
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});


//Post a wedding to the user
app.post('/users/PlannedWedding', (req, res) => {
    Weddings
        .create({
            Image1: req.body.Image1,
            Image2: req.body.Image2,
            Image3: req.body.Image3,
            NameofCouple: req.body.NameOfCouple,
            Nickname: req.body.Nickname,
            Venue: req.body.Venue,
            Date: req.body.Date,
            Time: req.body.Time,
            Officiating: {
                Lead: req.body.Lead,
                Bridesmaids: req.body.Bridesmaids,
                Groomsmen: req.body.Groomsmen
            },
            ServiceSchedule: {
                Processional: req.body.Processional,
                Item2: req.body.Item2,
                Item3: req.body.Item3,
                Item4: req.body.Item4,
                Item5: req.body.Item5,
                Item6: req.body.Item6,
                Item7: req.body.Item7,
                Item8: req.body.Item8,
                Item9: req.body.Item9,

            },
            Reading: req.body.Reading,
            Songs: req.body.Songs,
            Reception: req.body.Reception,
            ReceptionTime: req.body.ReceptionTime
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//Delete a wedding by weddingId
app.delete('/weddings/:weddingId', (req, res) => {
    Users.findOneAndRemove({ _id: req.params.weddingId })
        .then((user) => {
            if (!user) {
                res.status(400).send('Wedding Plan was not found');
            } else {
                res.status(200).send('Wedding plan has been deleted.');
            }
        })
        .catch((err) => { 
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening of Port ' + port);
});

