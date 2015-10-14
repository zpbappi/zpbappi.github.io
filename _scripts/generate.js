var yaml  = require('js-yaml'),
    fs    = require('fs'),
    util  = require('util');

// create tag files
try {
  var doc = yaml.safeLoad(fs.readFileSync(__dirname + '/../_data/tags.yml', 'utf8'));
  var contentTemplate = "---\nlayout: tag\ntag: %s\npermalink: /tags/%s/\n---";
  var fileNameTemplate = __dirname + "/../tags/%s.md";
  for(var key in doc){
    var fileName = util.format(fileNameTemplate, key);
    var content = util.format(contentTemplate, key, key);
    if(!fs.existsSync(fileName))
      fs.writeFileSync(fileName, content);
  }
} catch (e) {
  console.log(e);
}

// create archive files
function getYearAndMonth(fileName){
  var array = fileName.split("-");
  return {
    year: array[0],
    month: array[1]
  };
};

try{
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
  var contentTemplate = "---\nlayout: archive\nyear: '%s'\nmonth: '%s'\nmonthName: %s\n---";

  var files = fs.readdirSync(__dirname + '/../_posts/');
  var archiveDir = __dirname + '/../archive/';
  for(var i=0; i<files.length; ++i){
    var file = files[i];
    var date = getYearAndMonth(file);
    var yearDir = archiveDir + date.year.toString() + '/';
    var monthDir = yearDir + date.month.toString() + '/';
    if(!fs.existsSync(yearDir)){
      fs.mkdirSync(yearDir);
    }
    if(!fs.existsSync(monthDir)){
      fs.mkdirSync(monthDir);
      var content = util.format(contentTemplate, date.year, date.month, monthNames[date.month]);
      fs.writeFileSync(archiveDir + date.year + '/' + date.month + "/index.html", content);
    }
  }
}
catch(e){
  console.log(e);
}
