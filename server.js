const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Model = require("./Models");

const apiCall = require("./lib");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//body parser (post requests)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// const uri = process.env.ATLAS_URI;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology : true }, () => {

	console.log("MongoDB database connection established successfully");

});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

app.get("/movies/:movie", (req, res) => {


	const {movie} = req.params;

	Model.findOne({name : movie}, async (err, data) => {

		if(data == null)
		{

			console.log("veritabanında bulunmadı...");

			try
			{
				const obj = await apiCall(movie);

				console.log("obj : ", obj);

				const newMovie = new Model(obj);

				// veritabanına kaydet
				await newMovie.save();

				res.send(obj);
				res.end();

			}catch(e)
			{
				console.log("api bulamadı...");

				// api bulamazsa
				
				res.sendStatus(404);
				res.end();

			}

		}else
		{
			// veritabanında bulundu

			res.send(data);
			res.end();
		}


	})



})


app.get("/search", (req, res) => {

	let {name} = req.query;

	name = name.split(" ").map(s => s[0].toUpperCase() + s.slice(1).toLowerCase()).join("+");

	console.log("name : ", name);

	Model.find(

		{
			"name" : 
			{
				"$regex" : name, "$options" : "i"
			}
		}, (err, docs) => {

			console.log("------------------------")
			
			docs.forEach(i => console.log(i.name))

			res.send(docs);

			res.end();


	})


})



app.post("/add", (req, res) => {

	console.log(req.body);

	const {name, image, nudity, violence, profanity, drugs, intense} = req.body;

	const movie = {
		name,image,nudity,violence,profanity,drugs,intense
	}

	const newMovie = new Model(movie);

	newMovie.save()
	.then(() => res.json('Movie Added'))
	.catch(err => res.status(400).json('Error: ' + err));

})
