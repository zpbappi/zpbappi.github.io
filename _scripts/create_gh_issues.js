var GitHubApi = require("github"),
    q = require("q"),
    yaml = require("js-yaml"),
    fs = require('q-io/fs'),
    frontmatter = require("front-matter"),
    util = require("util");

var github = new GitHubApi({
    version: "3.0.0",
    debug: false,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "",
    timeout: 5000
});

const dataFilePath = __dirname + '/../_data/commentrefs.yml';
const POSTS_DIR = __dirname + '/../_posts/';
const siteRoot = "http://zpbappi.com";

function getExistingCommentLinks(){
    return fs.read(dataFilePath, {'charset': 'utf8', 'flags': 'r'})
    .then(function(content){
        return yaml.safeLoad(content);
    });
};

function readSingleFileFrontMatter(file){
    return fs.read(POSTS_DIR + file, {'charset': 'utf8', 'flags': 'r'})
    .then(function(content){
        return frontmatter(content);
    })
    .then(function(obj){
        return obj.attributes;
    });
};

function isCommentLinked(frontMatterAttr, existingCommentLinks){
    return (existingCommentLinks && existingCommentLinks[frontMatterAttr.permalink]);        
}

function getUnlinkedPostFrontMatters(existingCommentLinks){
    return fs.list(POSTS_DIR)
    .then(function(files){
        var fmPromises = files.map(function(file){
            return readSingleFileFrontMatter(file);
        });
        
        return q.all(fmPromises);
    })
    .then(function(attrList){
        return attrList.filter(function(attr){
            return !isCommentLinked(attr, existingCommentLinks);
        });
    });
};

function createSingleIssue(fmAttr){
    const bodyTemplate = "Auto-generated issue to track comments for the post [%s](%s%s) in my [blog](%s).";
    
    var body = util.format(bodyTemplate, fmAttr.title, siteRoot, fmAttr.permalink, siteRoot);
    
    var msg = {
        user: "zpbappi",
        repo: "zpbappi.github.io",
        title: fmAttr.title,
        body: body,
        labels: []
    };
    
    var deferred = q.defer();
    
    github.issues.create(msg, function(err, res){
        if(err){
            deferred.reject(err);
        }
        else if(res){
            deferred.resolve({link: fmAttr.permalink, number: res.number});
        }
    });
    
    return deferred.promise;
};

function saveNewCommentLinks(maps){
    if(!maps || maps.length == 0)
        return;
        
    return getExistingCommentLinks()
    .then(function(data){
        data = data || {};
        maps.forEach(function(item){
            data[item.link] = item.number;
        });
        
        return data;
    })
    .then(function(data){
        var json = yaml.safeDump(data);
        return fs.write(dataFilePath, json);
    });
};

function main(GH_TOKEN){
    return getExistingCommentLinks()
    .then(function(data){
        return getUnlinkedPostFrontMatters(data);
    })
    .then(function(unlinkedFmAttrList){
        if(!unlinkedFmAttrList || unlinkedFmAttrList.length == 0)
            return;
        
        github.authenticate({
            type: "oauth",
            token: GH_TOKEN
        });
        
        var promiseArr = unlinkedFmAttrList.map(function(item){
            return createSingleIssue(item);
        });
        
        return q.all(promiseArr);
    })
    .then(function(commentMaps){
        return saveNewCommentLinks(commentMaps);
    });
}


module.exports = main;