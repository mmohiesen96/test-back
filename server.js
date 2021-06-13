'use strict'
// Require statements
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

// Server initialization 
const server = express();

// server requires 
server.use(express.json());
server.use(cors());

// Port
const PORT = process.env.PORT;
// Requests
server.get('/getrecipes', getRecipes);
server.get('/getfavorite', getFavorite);
server.post('/addtofav', addToFav);
server.delete('/delete/:id', deleteRecipe);
server.put('/updaterecipe/:id', updateRecipe);


mongoose.connect('mongodb://localhost:27017/recipes2',
    { useNewUrlParser: true, useUnifiedTopology: true });

const recipeSchema = new mongoose.Schema(
    {
        image: String,
        label: String,
        ingredients: Array
    }
)

const recipeModel = mongoose.model('recipe', recipeSchema);
// Functions 
// Home port
server.get('/', (req, res) => {
    res.send('Home Request');
})
// http:localhost:3001/getrecipes?ingredient=chicken
function getRecipes(req, res) {
    const urlx = `https://api.edamam.com/search?q=${req.query.type}&app_id=${process.env.API_ID}&app_key=${process.env.API_KEY}`;
    axios.get(urlx).then(result => {
        const recipes = result.data.hits.map(item => {
            return new Recipe(item);
        })

        res.send(recipes);
    })
        .catch(err => {
            res.status(500).send(err)
        })


}


function addToFav(req, res) {
    const { image, label, ingredientLines } = req.body;
    const recipe = new recipeModel({
        image: image,
        label: label,
        ingredients: ingredientLines
    })

    recipe.save();
}

function getFavorite (req , res) {
    recipeModel.find({} , (err,data) => {
        res.send(data);
    })
}

function deleteRecipe (req,res) {
    const id = req.params.id;
    recipeModel.remove({_id : id} , (err,data) => {
        recipeModel.find({} , (err,recipeData) =>  {
            res.send(recipeData);
        })
    })
}

function updateRecipe (req,res) {
    recipeModel.find({} , (err,data)=> {
        data.map((item,idx) => {
            if(idx == req.params.id){
                item.image = req.body.image;
                item.label = req.body.label;
                item.save();
            }
        })
        console.log(data);
        res.send(data);
    })
}
// Listen
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})


class Recipe {
    constructor(data) {
        this.image = data.recipe.image,
            this.label = data.recipe.label,
            this.ingredientLines = data.recipe.ingredientLines
    }
}