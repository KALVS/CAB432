var express = require('express');
var router = express.Router();
var request = require('request');

const Recipe = require(__dirname + `/../models/recipe.model`);
const config = require(__dirname + '/../config.js');

const food = {
  api_key: '24542be1f84cd101eb14826707d17071',
  nojsoncallback: 1
}

function cleanString(str, dirtyChar, cleanChar) {
  result = str.replace(dirtyChar, cleanChar);
  return result;
}

function searchForRecipe(food, query, callback) {
  let foodRawURL = `https://www.food2fork.com/api/search?key=${food.api_key}` +
  `&q=${query}`;
  foodRawURL = cleanString(foodRawURL, /&#8217;/g, '');
  let foodURL = encodeURI(foodRawURL);
  let rsp;
  let foodTitle = [];
  try {
    console.log('food START');
    request(foodURL, function(error, response, body) {
      //console.log('error:', error); //Print error if error
      //console.log('statusCode:', response && response.statusCode); //Print response status incase it doesnt work
      //console.log("SEARCH DATA")
      rsp = JSON.parse(body);

      for (var i = 0; i < 4; i++) {
        let dirtyTitle = rsp.recipes[i].title;
        dirtyTitle = decodeURI(dirtyTitle);
        cleanTitle = cleanString(dirtyTitle, /’/g, '');
        cleanTitle = cleanString(dirtyTitle, /&#8217;/g, '');

        foodTitle.push(cleanTitle);
        console.log("search for recipe: ", cleanTitle);
        //console.log(foodTitle[i]);
      }
      //console.log('food END');
      callback(foodTitle);
    });
  } catch (err) {
    console.log("error: ", err);
  }
}

const edamam = {
  app_key: '94271fc667d95d0240640d96d0527c5c',
  app_id: 'b3684a31'
}

function getRecipe(edamam, foodTitle) {
      let titleList = [];
      for (title of foodTitle) {
        console.log(title);
        titleList.push(title);
      }
      //Just use one for now
      //Get title, and image in the page for now

      var edamRawURL = `https://api.edamam.com/search?q=${titleList[0]}&app_id=b3684a31&app_key=94271fc667d95d0240640d96d0527c5c`
      edamRawURL = cleanString(edamRawURL, /’/g, '');
      var edamURL = encodeURI(edamRawURL);
      let rsp;

    request(edamURL, cleanTitle ,function (error, response, body) {
      console.log('getRecipe start');
      console.log('foodTitle: ', cleanTitle);
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      rsp = JSON.parse(body);
      console.log("RSP START");
      //tmpIngre = rsp.hits[j].recipe.ingredientlines;
      //console.log(rsp.hits[0]);
      console.log(rsp.hits[0].recipe.ingredientlines);

      console.log('RSP end \n getRecipe end');
    });
  }
/*} catch (err) {
  console.log('error in edamam:', err);
}*/



function executeAsyncTasks(food, edamam, query, foodTitle) {
  return searchForRecipe(food, query, async function(titles){
getRecipe(edamam, titles);
  });
}


/* GET home page. */
router.get('/', function(req, res, next) {
  let cardInfo;
  if(!req.query.Search) {
    res.render('index', {title: 'Welcome to Mindful Meals'});
  } else if (req.query.Search) {
    query = JSON.stringify(req.query.Search);
    searchForRecipe(food, query, function(foodTitle){
      if (foodTitle) {
        getRecipe(edamam, foodTitle);
      } else {
        console.log("failure to get foodtitle");
      }
    });
//    console.log(content);
    res.render('index',{ title: "You've searched for: " + query });
  }
});

module.exports = router;
