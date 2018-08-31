const express = require('express');
const app = express();
const https = require('https');
const url = require('url');
const hostname = '127.0.0.1';
const port = 3000;
const mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: 'password',
  database: 'mydb'
});

app.get('/', function(appReq, appRes) {
  var str = `<html><head>` +
  `<link rel='stylesheet' href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">` +
  '<title>Flickr Demo</title></head>' +
  '<body>' +
  '<h1>' + 'The Flickr API Demo' + '</h1>' +
  'Usage: http://localhost:3000/search/query/number <br>' +
  '<ul>' + '<li>query - corresponds to Flickr tags</li>'+
  '<li>number - max number of results returned</li>' +
  `<form class="example" action="localhost:3000/search/">` + `<input type="text" placeholder="Search.." name="search"><button type="submit"><i class="fa fa-search"></i></button></form>"` +
  '<li>Example: <a href="http://localhost:3000/search/shredded%20chicken">http://localhost:3000/search/shredded-chicken</a></li>' +
  '</ul>' + '</body></html>';
  appRes.writeHead(200,{'content-type': 'text/html' });
  appRes.write(str);
  appRes.end();
});

//async await
//NPM
//RESEARCH 'BABBLE' works also
//fuck https off and get request module

////probably another file
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
app.get('/:query', function (appReq, appRes) {

  function connectDropCreate() {
    connection.query("DROP TABLE ingredients");
    var sql = "CREATE TABLE ingredients (title VARCHAR(255), ingredient VARCHAR(255))";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  }

  let food = {
    api_key: "314d3d963539dc5403f5328dbde78dbe",
    nojsoncallback: 1
  };


  function createFoodOptionsSearch(food, query) {
    let options = {
      hostname: 'food2fork.com',
      port: 443,
      path:`/api/search?`,
      method: 'GET'
    }
    let str = `key=${food.api_key}` + `&q=${query}`;
    options.path += str;
    return options;
  }


  function parseFoodRspSearch(rsp) {
    let s = "";
    for(let i = 0; i <rsp.recipes.length; i++) {
      recipe_title = rsp.recipes[i].title;
      recipe_url = rsp.recipes[i].f2f_url;
      recipePhoto_url = rsp.recipes[i].image_url;
      recipe_id = rsp.recipes[i].recipe_id;
      link = "http://localhost:3000/analysis/" + recipe_id;
      //Recipe URl will become a page with the graph and the ingredients and link to recipe
      s += `<a href="${link}"><img alt="${recipe_title}" src="${recipePhoto_url}"/></a>`;
    }
    return s;
  }

  function createPage(title, rsp) {
    let number = rsp.count;
    let imageString = parseFoodRspSearch(rsp);
    //let imageString = parseFoodRspRecipe(rsp);
    let str = '<html><head><title>Search Results</title></head>' + '<body>' +
    `<h1>${title}</h1>` +
    `Total number of entries is: ${number}</br>${imageString}` +
    '</body></html>';
    return str;
  }

  let options = createFoodOptionsSearch(food, appReq.params.query, 1);
  let foodReq = https.request(options, function(foodRes) {
    console.log("statusCode: ", foodRes.statusCode);
    console.log("headers: ", foodRes.headers);


    let body = [];
    foodRes.on('data', function(chunk) {
      body.push(chunk);
    });

    foodRes.on('end', function() {
      appRes.writeHead(foodRes.statusCode, {'content-type':
          'text/html'});
      let bodyString = body.join('');
      let rsp = JSON.parse(bodyString);

      let s = createPage(appReq.params.query, rsp);
        appRes.write(s);
        appRes.end();
      });
  });

  foodReq.on('error', (e) => {
    console.error(e);
  });
  foodReq.end();


});
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

app.get('/analysis/:rId', function (appReq, appRes) {

  function connectDropCreate() {
    connection.query("DROP TABLE ingredients");
    var sql = "CREATE TABLE ingredients (title VARCHAR(255), ingredient VARCHAR(255))";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  }

  let food = {
    api_key: "314d3d963539dc5403f5328dbde78dbe",
    nojsoncallback: 1
  };

  let edamam = {
    app_key: "ee834218f4b56573e04e75950e0dd195",
    app_id: "ac7b4c28",
    //method: GET
  };

  function createfoodOptionsSearch(food, query, page) {
    let options = {
      hostname: 'food2fork.com',
      port: 443,
      path:`/api/search?`,
      //   search?key=314d3d963539dc5403f5328dbde78dbe&q=shredded%20chicken`,
      method: 'GET'
    }
    let str = `key=${food.api_key}` +
    `&q=${query}`;
    options.path += str;
    return options;
  }

  function createFoodOptionsRecipe(food, rId) {
    let options = {
      hostname: 'food2fork.com',
      port: 443,
      path:
      `/api/get?`,
      method: 'GET',
      rId: rId
    }
    let str = `key=${food.api_key}` +
    `&rId=${appReq.params.rId}`//${appReq.params.query}`;

    options.path += str;
    return options;
  }

  function createAnalysisOptions(edamam) {
    let options = {
      hostname: `api.edamam.com`,
      port: 443,
      path:
      '/api/nutrition-data?',
      method: 'GET'
    }
    let str = `app_id=${edamam.app_id}` + `&app_key=${edamam.app_key}&ingr=`;
    //6+frozen+skinless%2C+boneless+chicken+breast`;
    //let query = connection.query("SELECT ingredient FROM ingredients;");
    options.path += str;
    return options;
  }

  //


  //https://api.edamam.com/api/nutrition-data?app_id=ac7b4c28&app_key=ee834218f4b56
  //573e04e75950e0dd195&ingr=6+frozen+skinless%2C+boneless+chicken+breast+halves+1+%28
  //12+ounce%29+bottle+barbeque+sauce+1%2F2+cup+Italian+salad+dressing+1%2F4+cup+brown+sugar
  //+2+tablespoons+Worcestershire+sauce&serving=1
  //https://api.edamam.com/api/nutrition-data?app_id=ac7b4c28&app_key=ee834218f4b56573e04e75950e0dd195&ingr=1%20large%20apple


  function parseFoodRspRecipe(rsp) {
    let ingredients = rsp.recipe.ingredients;
    let s = '';
    for (ingredient of ingredients) {
      s += ingredient;
    }
    return s;
  }

  function parseAnalysisRsp(rsp) {
    connectDropCreate()
    let ingredients = rsp.recipe.ingredients;
    let title = rsp.recipe.title;
    let s = '';
    connection.query('USE mydb');
    for (ingredient of ingredients) {
      ingAr = [];
      ingAr = ingredient;
      console.log(ingAr);
      for (var i = 0; i < ingAr.length; i++) {
        console.log(ingAr[i]);
        if (ingAr[i] == ','){
          console.log("###A###");
        }
      }
      //console.log(`${ingredient} inserted`);
      var sql = `INSERT INTO ingredients(title, ingredient) VALUES ('` + title + `', '`+ ingredient +`');`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
      });
      s+= ingredient;
    }
    return s;
  }

  function createPage(title, rsp) {
    let number = rsp.count;
    //let imageString = parseFoodRspSearch(rsp);
    let imageString = parseFoodRspRecipe(rsp);
    let str = '<html><head><title>Food JSON</title></head>' + '<body>' +
    `<h1>${title}</h1>` +
    `Total number of entries is: ${number}</br>${imageString}` +
    '</body></html>';
    return str;
  }
  //https://api.edamam.com/api/nutrition-data?app_id=ac7b4c28&app_key=ee834218f4b56573e04e75950e0dd195&ingr=1%20large%20apple%22
  //let options = createFoodOptionsSearch(food, appReq.query['query']);
  //let options = createFoodOptionsRecipe(food, appReq.params.rId);
  console.log("######################################################");
  console.log();
  let options = createFoodOptionsRecipe(food, appReq.params.rId);

  //let options = createFoodOptionsRecipe(edamam);

  let foodReq = https.request(options, function(foodRes) {
    console.log("statusCode: ", foodRes.statusCode);
    console.log("headers: ", foodRes.headers);

    let body = [];
    foodRes.on('data', function(chunk) {
      body.push(chunk);
    });

    foodRes.on('end', function() {
      appRes.writeHead(foodRes.statusCode, {'content-type':
      'text/html'});
      let bodyString = body.join('');
      console.log(bodyString);
      let rsp = JSON.parse(bodyString);

      let s = createPage("analysis", rsp);
        appRes.write(s);
        appRes.end();
      });
  });
  foodReq.on('error', (e) => {
    console.error(e);
  });
  foodReq.end();
});


app.listen(port, function () {
  console.log(`Express app listening at http://${hostname}:${port}/`);
});
