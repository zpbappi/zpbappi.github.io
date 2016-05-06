var yaml  = require('js-yaml'),
    q     = require('q'),
    fs    = require('q-io/fs'),
    util  = require('util');

// domain data
var monthNames = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December"
};

// create tag files
function createTagFiles() {
  var contentTemplate = "---\nlayout: tag\ntitle: Posts with tag %s\nsummary: posts with tag %s\ntag: %s\npermalink: /tags/%s/\nsitemap: false\n---";
  var fileNameTemplate = __dirname + "/../tags/%s.md";
  return fs.read(__dirname + '/../_data/tags.yml', {'charset': 'utf8', 'flags': 'r'})
  .then(function(content){
    return yaml.safeLoad(content);
  })
  .then(function(doc){
    var promises = Object.keys(doc).map(function(key){
      var tagText = doc[key].name;
      var fileName = util.format(fileNameTemplate, key);
      var content = util.format(contentTemplate, tagText, tagText, key, key);
      return fs.exists(fileName)
      .then(function(exists){
        if(!exists)
          return fs.write(fileName, content);
      });
    });
    return q.all(promises);
  });
};

// create archive files
function getYearAndMonth(fileName){
  var array = fileName.split("-");
  return {
    year: array[0],
    month: array[1]
  };
};

function createSingleArchiveFile(monthDir, filePath, content){
  return fs.exists(monthDir)
  .then(function(exists){
    if(!exists)
      return fs.makeTree(monthDir);
  })
  .then(function(){
    return fs.exists(filePath);
  })
  .then(function(exists){
    if(!exists)
      return fs.write(filePath, content);
  });
};

function createArchiveFiles(){
  var contentTemplate = "---\nlayout: archive\ntitle: Posted in %s\nsummary: posted in %s\nyear: '%s'\nmonth: '%s'\nmonthName: %s\nsitemap: false\n---";
  var archiveDir = __dirname + '/../archive/';

  return fs.list(__dirname + '/../_posts/')
  .then(function(files){
    var data = {};
    for(var i=0; i<files.length; ++i){
      var file = files[i];
      var date = getYearAndMonth(file);
      if(!data[date.year]){
        data[date.year] = [];
      }
      if(data[date.year].indexOf(date.month) === -1){
        data[date.year].push(date.month);
      }
    }
    return data;
  })
  .then(function(data){
    var promises = [];
    for(var year in data){
      var yearDir = archiveDir + year.toString() + '/';
      data[year].forEach(function(month){
        var monthDir = yearDir + month.toString() + '/';
        var content = util.format(contentTemplate, monthNames[month] + " " + year, monthNames[month] + " " + year, year, month, monthNames[month]);
        var filePath = archiveDir + year + '/' + month + "/index.html";
        promises.push(createSingleArchiveFile(monthDir, filePath, content));
      });
    }
    return q.all(promises);
  });
};

// main entry point
module.exports = function(){
  return q.all([createTagFiles(), createArchiveFiles()]).then(function(){
    console.log("Tag and Archive files creation completed successfully.")
  }).fail(function(e){
    console.error(e);
  });
};
