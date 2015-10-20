var fs = require("q-io/fs"),
    q = require("q"),
    git = require("gift-wrapper"),
    generate = require("./generate.js");

var repo = git(__dirname + "/../");

function publishChanges(){
  return repo.add("-A")
  .then(function(){
    return repo.commit("[ci skip] automated tag and archive page generation");
  }).
  then(function(){
    return repo.remote_push();
  });
};

generate()
.then(function(){
  return repo.status();
})
.then(function(status){
  if(!status.clean){
    return publishChanges();
  }
})
.fail(console.error);
