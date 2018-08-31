const express = require('express');
const app = express();
const https = require('https');
const url = require('url');
const hostname = '127.0.0.1';
const port = 3000;

app.get('/search', function (appReq, appRes) {
  let food = {
    api_key: "314d3d963539dc5403f5328dbde78dbe",
    nojsoncallback: 1
  };

function createFoodOptionsSearch(food, query, page) {
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

  function parseFoodRspSearch(rsp) {
    let s = "";
    for(let i = 0; i <rsp.recipes.length; i++) {
      recipe_title = rsp.recipes[i].title;
      recipe_url = rsp.recipes[i].f2f_url;
      recipePhoto_url = rsp.recipes[i].image_url;
      //Recipe URl will become a page with the graph and the ingredients and link to recipe
      s += `<a href="${recipe_url}"><img alt="${recipe_title}" src="${recipePhoto_url}"/></a>`;
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
  let options = createFoodOptionsSearch(food, 'shredded%20chicken', 1);

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

      let s = createPage("shredded chicken", rsp);
        appRes.write(s);
        appRes.end();
      });
  });

  foodReq.on('error', (e) => {
    console.error(e);
  });
  foodReq.end();


});
