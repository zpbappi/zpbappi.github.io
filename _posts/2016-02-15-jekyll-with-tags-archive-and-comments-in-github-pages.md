In my [previous post](/making-of-this-blog-using-jekyll-pixyll/), I have demonstrated how we can easily setup a Jekyll blog hosted in GitHub Pages. 
I will explain how I implemented the automatic tag and archive page generation within the constraints imposed by GitHub Pages. Also, I will show 
how I ended up using GitHub to store and serve my blog comments as well.

But, before I explain the automatic "way" of doing it, I should probably mention the end goal. In other words, the manual way of doing 
the whole thing. From there, we will see how much of we can automate.

## Creating Tags

As a very first thing, I need to store the mapping between _url friendly_ tag name and _display text_ of a tag. Example- 
tagging a content with `github-pages` will display as `GitHub Pages` to the user. Similarly, tagging with `di` will display 
`Dependency Injection`. You have probably guessed that I will be using the _url friendly_ tag names in my URL.

Jekyll provides a special folder called `_data` for storing data. If it does not exist, you can obviously create one. 
I simply created a file in that folder called `tags.yml`. Content of this file is a static mapping between a tag's _url friendly_ name and 
_display text_. Here is a snippet of this file:

{% highlight yaml %}
ci-cd:
  name: CI/CD
csharp:
  name: C#
datetime:
  name: DateTime
di:
  name: Dependency Injection
{% endhighlight %}

This is the convention I chose. You may come up with your own way of storing the information- it really doesn't matter. 
After completing my mapping inside `data/tags.yml` file, I created a folder in the root directory called `tags`. 
Inside this folder, I have a file called `index.html` which contains the following html code (technically, this is not just html, rather 
a liquid template code with front-matter yml):


{% highlight html %}
{% raw %}
---
title: Site Tags
permalink: /tags/
layout: page
sitemap: false
---
<ul>
  {% assign tags = site.tags | sort 0 %}
  {% for tag_item in tags %}
  {% assign tag = (tag_item | first) %}
  <li>
    <a href="{{site.url}}{{site.baseurl}}/tags/{{tag}}">{{site.data.tags[tag].name}}</a> ({{site.tags[tag].size}})
  </li>
  {% endfor %}
</ul>
{% endraw %}
{% endhighlight %}

This simple code snippet will handle the request to URL `http://mysite.com/tags/` and will list all the tags available in the site 
with post count beside each tag. I am also generating URL like `http://mysite.com/tags/<url-friendly-tag-name>` for all the tags. 
However, these pages do not exist. I need to create the pages inside `/tags/` folder for each tag that I have on my site. This does 
sound like a repetitive task and hence, I am going to automate it. Before I do that, I realize that all the tag pages I am about to generate 
will have basically same functionality. That is- display the posts tagged with this tag. So, I can even move this whole logic inside a layout 
file and keep only the varying part inside the tag files. Sounds like a good plan and I will have more centralized control over the tag pages 
content. So, I ended up creating a layout file named `tag.html` inside `/_layouts` folder. This layout file contains the following code:

{% highlight html %}
{% raw %}
---
layout: default
---

<div class="post">
  <header class="post-header">
    <h1 class="h2">Posts tagged with <em>"{{ site.data.tags[page.tag].name }}"</em></h1>
  </header>

  <article class="post-content">
    <ol>
      {% for post in site.tags[page.tag] %}
      <li>
        <a class="post-link" href="{{post.url | prepend: site.baseurl}}"><h3 class="post-title mb0">{{post.title}}</h3></a>
        <p class="post-meta small">{{ post.date | date: site.date_format }}</p>
        <div class="small">
          {% include post_tags.html tags-class="small" %}
        </div>
      </li>
      {% endfor %}
    </ol>
  </article>
</div>
{% endraw %}
{% endhighlight %} 

Now, all that is left is to generate files for each tag in the site that uses this layout. Having a layout file to handle most of the rendering logic 
simplifies individual files to a great deal. For example- to handle URL `http://mysite.com/tags/github-pages`, I need to create a file 
`/tags/github-pages.md` with the content:

{% highlight html %}
{% raw %}
---
layout: tag
title: Posts with tag Github Pages
tag: github-pages
permalink: /tags/github-pages/
sitemap: false
---
{% endraw %}
{% endhighlight %}

But, I am not going to create all the tag files by hand. In fact, I am not going to create any of them. Instead, I wrote a small NodeJS script 
to do that for me. Here is a quick and dirty script for generating all the tag files that you need:

{% highlight js %}
var yaml  = require('js-yaml'),
    q     = require('q'),
    fs    = require('q-io/fs'),
    util  = require('util');
    
function createTagFiles() {
  var contentTemplate = "---\nlayout: tag\ntitle: Posts with tag %s\ntag: %s\npermalink: /tags/%s/\nsitemap: false\n---";
  var fileNameTemplate = __dirname + "/../tags/%s.md";
  return fs.read(__dirname + '/../_data/tags.yml', {'charset': 'utf8', 'flags': 'r'})
  .then(function(content){
    return yaml.safeLoad(content);
  })
  .then(function(doc){
    var promises = Object.keys(doc).map(function(key){
      var tagText = doc[key].name;
      var fileName = util.format(fileNameTemplate, key);
      var content = util.format(contentTemplate, tagText, key, key);
      return fs.exists(fileName)
      .then(function(exists){
        if(!exists)
          return fs.write(fileName, content);
      });
    });
    return q.all(promises);
  });
};
{% endhighlight %}

The above function returns a promise, which you can either wait for being resolved or chain with other tasks that you may have. 
You can run this above NodeJS script using from your local machine to generate all the tag files you will need. However, if you want 
to go really pro, you can have Travis-CI looking into your GitHub repository after every push to the repository have it run the above 
NodeJS script to create the tag files and push it back to your repository. Guess what? That's what I did. Please go ahead and have a look 
at the [github repository for this blog](https://github.com/zpbappi/zpbappi.github.io) to see how everything fit together.

One small thing, I also wanted to display the tags for a post in the home page under the tile of each post and also at the bottom of each
post page. In both cases, I need to generate almost exactly same html. So, I create an html file named `post_tags.html` inside another 
special jekyll directory `/_includes/`. Content of `/_includes/post_tags.html` is:

{% highlight html %}
{% raw %}
{% if post.tags.size > 0 %}
<p class="post-tags {{include['tags-class']}}">
  <i class="fa fa-tags"></i>
  {% for tag in post.tags | sort %}
    <a href="{{site.url}}{{site.baseurl}}/tags/{{ tag }}">{{ site.data.tags[tag].name }}</a>{% if forloop.last == false %}, {% endif %}
  {% endfor %}
</p>
{% endif %}
{% endraw %}
{% endhighlight %}

Now, wherever I want to display the tags associated with a post, I just need to add the following code:
{% highlight html %}
{% raw %}
{% include post_tags.html %}
{% endraw %}
{% endhighlight %}

One word of caution, the `post_tags.html` assumes that the post is actually available in a variable named `post`. This assumtion may be true for the 
home page. However, in the post detail page (rendered by `/_layouts/post.html`) the variable named `page` holds all the information for that post. 
Here is how I modified my `/_layouts/post.html` to overcome this problem:
{% highlight html %}
{% raw %}
{% assign post = page %}
{% include post_tags.html %}
{% endraw %}
{% endhighlight %}

That's about all. This should work fine as long as you keep your `_data/tags.yml` file updated whenever you add a new tag and put your tags 
properly in your post front-matter. Like, this post that you are reading now has the front-matter:

{% highlight yaml %}
tags:
  - jekyll
  - github
  - github-pages
{% endhighlight %}

## Creating Archive

Once we have a good understanding of the tags are generated, generating archive will seem very easy. First of all, I needed to create a folder named `archive` 
with an `index.html` inside it. It contains:

{% highlight html %}
{% raw %}
---
title: Archive
permalink: /archive/
layout: page
sitemap: false
---

{% if site.posts.size == 0 %}
<p>
  Sorry, no posts. :(
</p>
{% else %}
  {% include archive.html %}
{% endif %}

{% endraw %}
{% endhighlight %}

There is nothing much going on. It appears the actual logic is inside `archive.html` file. This file (i.e. `/_includes/archive.html`) will actually 
iterate through all the posts in the site categorize them in year and month they were created on. Based on that information, it will display 
some html similar to:

- Year-1
    - Month Name-1 (# posts in this month)
    - Month Name-2 (# post in this month)
- Year-2
    - Month Name-3 (# posts in this month)
    - Month Name-4 (# post in this month)
    
Moreover, each month name will be a link to a page (`http://mysite.com/archive/<year>/<month>`) where all posts created on the particular month will 
be displayed as a list. I think it is quite simple requirement. Here is a brute-force implementation of the above requirement found in 
`/_includes/archive.html`:

{% highlight html %}
{% raw %}
<ul>
<li>
{% assign cYear = "" %}
{% assign cMonth = "" %}
{% assign posts = site.posts | sort: 'date' | reverse %}
{% assign first = posts | first %}
{% assign cMonthName = "" %}
{% assign cMonthLink = "" %}
{% assign count = 0 %}

{% for post in posts %}
  {% assign count = count | plus: 1 %}
  {% assign year = (post.date | date: '%Y') %}
  {% assign month = post.date | date: '%Y-%m' %}
  {% if year != cYear %}
    {% if cYear != "" %}
      <a href="{{cMonthLink | prepend: "/archive" | prepend: site.baseurl}}">{{cMonthName}}</a> ({{count | minus: 1}})</li></ul></li><li>
      {% assign count = 1 %}
    {% endif %}
    {{year}}<ul><li>
    {% assign cMonth = "" %}
    {% assign cYear = year %}
  {% endif %}

  {% if month != cMonth %}
    {% if cMonth != "" %}
      <a href="{{cMonthLink | prepend: "/archive" | prepend: site.baseurl}}">{{cMonthName}}</a> ({{count | minus: 1}})</li><li>
      {% assign count = 1 %}
    {% endif %}
    {% assign cMonth = month %}
  {% endif %}
  {% assign cMonthName = post.date | date: '%B' %}
  {% assign cMonthLink = post.date | date: '/%Y/%m' %}
{% endfor %}
<a href="{{cMonthLink | prepend: "/archive" | prepend: site.baseurl}}">{{cMonthName}}</a> ({{count}})
</li>
</ul>
</li>
</ul>
{% endraw %}
{% endhighlight %}

It is pretty messy and straight-forward implementation. But, it works. You may try to come up with a better implementation. 
Feel free to let me know then. I will update my code. 

With all these in place, I now need to create the pages for each month and year I have at least a post in. I will be creating a 
directory structure like:

- 4-digit year
    - 2-digit month 
        - index.html

inside archive directory. Similar to tag files, these `index.html` will have almost nothing and rendering logic will be inside a layout file 
`/_layouts/archive.html`. So, my layout file for archive contains:

{% highlight html %}
{% raw %}
---
layout: default
---

<div class="post">
  <header class="post-header">
    <h1 class="h2">Posted in <em>{{page.monthName}}, {{page.year}}</em></h1>
  </header>

  {% assign posts = site.posts | sort: "date" | reverse %}
  <article class="post-content">
    <ol>
      {% for post in posts %}
        {% assign year = post.date | date: '%Y' %}
        {% assign month = post.date | date: '%m' %}
        {% if year == page.year and month == page.month %}
        <li>
          <a class="post-link" href="{{post.url | prepend: site.baseurl}}"><h3 class="post-title mb0">{{post.title}}</h3></a>
          <p class="post-meta small">{{ post.date | date: site.date_format }}</p>
          <div class="small">
            {% include post_tags.html tags-class="small" %}
          </div>
        </li>
        {% endif %}
      {% endfor %}
    </ol>
  </article>
</div>

{% endraw %}
{% endhighlight %}

Quite simple. However, the `index.html` files within the `archive/<year>/<month>` folders are even simpler. An example of such a file is:
{% highlight html %}
{% raw %}
---
layout: archive
title: Posted in June 2014
year: '2014'
month: '06'
monthName: June
sitemap: false
---
{% endraw %}
{% endhighlight %}

It is evident that this `index.html` file is placed in `/archive/2014/06/index.html` location. It will handle the URL 
`http://mysite.com/archive/2014/06` and will list out all the post created in June 2014.

Now, all that is left is to create the year/month folders with the proper `index.html` within them with a script as before.

Here is another quick and dirty script for that task:

{% highlight js %}
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
  var contentTemplate = "---\nlayout: archive\ntitle: Posted in %s\nyear: '%s'\nmonth: '%s'\nmonthName: %s\nsitemap: false\n---";
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
        var content = util.format(contentTemplate, monthNames[month] + " " + year, year, month, monthNames[month]);
        var filePath = archiveDir + year + '/' + month + "/index.html";
        promises.push(createSingleArchiveFile(monthDir, filePath, content));
      });
    }
    return q.all(promises);
  });
};
{% endhighlight %}

Once again, you can run this NodeJS script (`createArchiveFiles()` function) from your local machine to generate the archive directory structure with 
`index.html` files, or you can be a pro and have Travis-CI do that for your automatically. 

## Adding Comments

For comment integration with static blog generated using Jekyll (or, any blog in general), Disqus is pretty popular. 
However, I wanted to keep every under the same umbrella. As an experiment, I tried to use GitHub issues as the host for my blog comments. 
In that case, I can simply use GitHub API to load the comments and display in my blog easily. There are few problems I needed to solve first.

1. Create GitHub issue for every blog post I have and whenever I write a new one
2. Link that issue somehow with the blog post so that comments can be loaded for a specific post
3. I don't want to do it manually :(

So, after a careful inspection of the generated issues, it becomes clear that each issue created in a repository has a unique id (a number). I also 
have something unique for every post, which is the `permalink`. I just need to store the mapping between `permalink` of a post and related GitHub 
Issue ID somewhere. Again, `/_data` folder to the rescue. I have created a file `/_data/commentrefs.yml` which contains a simple map between 
post `permalink` and GitHub Issue ID. If any `permalink` is not present in that file, that means it is a new post and I need to create a GitHub Issue 
for this post. After that, I need to add the mapping in the `commentrefs.yml` file for the new post. That pretty much takes care of the linking part. 

Displaying comments are least of my problems. I have written a [simple angular code](https://github.com/zpbappi/zpbappi.github.io/blob/master/_includes/comments.html) 
to fetch and render comments from GitHub issues using GitHub API. There is also a [very basic css](https://github.com/zpbappi/zpbappi.github.io/blob/master/css/comment.css) 
to give the contents a "commety" look. Also, I have to make sure that angular is available to me by modifying the `/_includes/head.html` file.

Now, the final and most important part. I need to generate issues in GitHub for every post that I have if it isn't generated already. 
And yes, you guessed it correct. I ended up automating that part as well. I created another NodeJS script which takes care of this linking and updating 
`commentrefs.yml` file if needed. The script is too big to be copied here. You can always [read it from the GitHub repository](https://github.com/zpbappi/zpbappi.github.io/blob/master/_scripts/create_gh_issues.js). 
It will need you GITHUB_TOKEN to authenticate. Please do not put your GITHUB_TOKEN in the code. Instead, pass it to the code as a parameter. That is what 
I am doing using Travis-CI.

## Summary
My goal was to have a structure which I can modify myself within GitHub only for tags, archive, and comments. Then, I went ahead and automated 
the manual labor using Travis-CI. All the automation scripts needed for this blog is located in `/_scripts/` folder. The execution starts from 
`/_scripts/main.js` file. These scripts were written for this blog only, so they may not work just by copying into your blog. You may need to 
modify some content (hard coded URL and path) to match your environment. 

I hope this (really) long post helps if you have a blog hosted in GitHub Pages. I am sure you can 
come up with other cool feature implementations too using similar approaches. Feel free add a comment about the cool feature you have implemented 
for a Jekyll blog hosted in GitHub Pages. Happy (static) blogging. :) 