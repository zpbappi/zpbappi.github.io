---
layout: post
title: Making of this blog using Jekyll & Pixyll
permalink: /making-of-this-blog-using-jekyll-pixyll/
categories:
  - blog
tags:
  - jekyll
  - github
  - github-pages
  - pixyll
---

This is my first attempt to static sites. To be honest, [Jekyll](http://jekyllrb.com/) is quite impressive.
Using jekyll and few other community contribution, I was able to build and host this awesome site (isn't it?) 
completely for free. I am goning to descibe how I did it in this post.

## Step-1: Setting up GitHub

Once I have decided to use jekyll, it opens up lot of options for me. One of them is, hosting in 
[GitHub Pages](https://pages.github.com/). This takes care of the hosting problem. And, reliablity? 
How reliable is GitHub? You ask yourself. Now, using the GitHub Pages service for hosting is quite easy. 
You can find a lot more detail in the [website](https://pages.github.com/). However, I am only going 
to describe what is needed to a blog site such as this.

Let's say your github user name is `username`. All you need to do is create 
a repository in GitHub with the name `username.github.io`. Now, if you publish your html files with resources (css, images, js, etc.)
in a branch named `gh-pages` in to this repository, you can actually browse site using the url
`http://username.github.io`. It is as simple as that.

Now, you may realize that all you have to do is build your static site with jekyll and publish it to the repository. It is as 
simple as that. However, I did not stop there. I did not event want to use jekyll to build my site and then push it. I used GitHub 
to build my site for me. How? even simpler. If you push your jekyll sources (not the compiled _site contents) in to the 
`master` branch of you the `username.github.io` repository, GitHub will automatically generate the site for you and it will be accessible 
using the same url: `http://username.github.io`.

This give's you flexibility like editing/creating a markdown file from your mobile and publish it as a blog post. All you need to do is 
push to the gitHub repository. Everything else is taken care of by GitHub Pages. However, this flexibility comes with a price. That is, 
you cannot use custom jekyll plugins in your jekyll site, other than the very few plugins listed and trusted by GitHub Pages. Well, I am going 
to overlook that for now until I need it.

By now, I assume you have already created a repository named `username.github.io` in GitHub (of course, replacing `username` with your own username).
Clone it with in your computer. You will automatically have a `remote` source set for you named `origin`. Make sure your repository does not contain
anything at this point. This will save you a lot of merging issues later.


## Step-2: Setting up theme

Although jekyll is an excellent static site generator/ blog engine, I do not quite like the default theme/ UI design it give to the site. 
Luckily, it is very easy to change the theme. Jekyll has completely separated the concept of content and decoration- you can literally 
switch your theme (or, create a new one) any time without even touching your content. There are lot of themes available online for jekyll. 
They come in either as a zipped folder, or they simply are a git repository in GitHub. For our purpose, we will use the git repository ones. 
Not only because hosting your theme in GitHub is cool, it makes updating the theme a lot easier later. You can find decent collection of jekyll 
themes in [jekyllthemes.org](http://jekyllthemes.org) and [this](https://github.com/jekyll/jekyll/wiki/Themes) jekyll wiki page. To me,
[Pixyll](https://github.com/johnotander/pixyll) was the coolest one when I was looking for themes (and, it still is). It is hosted in github as well. 

What I did first is forked the pixyll repository. So, I ended up with a repository like `github.com/username/pixyll`. Then in my computer, I went 
to the `username.github.io` repo directory and added forked pixyll github repository url as another remote source named `theme`. To do that, you need
to open your favorite command shell in the `username.github.io` directory in your computer and type the following:

{% highlight shell %}
git remote add theme https://github.com/username/pixyll.git
{% endhighlight %}

Then, it is as simple as getting the theme and publishing in your blog. However, I would suggest that you create a local branch
for the theme as well. Just type the following:
{% highlight shell %}
git checkout -b theme
git pull theme master
git checkout master
git merge theme
{% endhighlight %}



Well, whether everything goes well or not depends on the initial condition of your 
repository. You may have some merge conflicts when you pull into your theme branch, or merge with your master branch. However, it should
be pretty easy to resolve those conflict, as you may not have any valuable content in your repository. So, wisest thing to do would be simply take
whatever comes from your `theme` repository in github.    

## Step-3: Configuring and Publishing

Once you have completed previous steps, it is time for you to take a look in to what you've got in the repo. First thing to look at is the 
`_config.yml` located in the root. The config file is self explaining and pretty easy to modify. That's all there is to configuration. 
Pretty easy!

Next thing is modifying the theme contents. You may find some files that you will want to modify the contents of for your personal blog. A list 
of such files may include, but limited to:
- _includes/footer.html
- _includes/navigation.html
- about.md
- ... I am sure you can find other places to edit contents in.

Once you are satisfied with you changes, you can also write post. Posts are actually located within `_posts` directory. 
There should be few sample posts from Pixyll- which will help you understand how your post structure should be. 
There are just few basic header entries for jekyll on top of the post, then it's all up to your markdown skills. By the
way, you can still write pure html in a post, although I can never think of any good reason behind that. Regardless of 
whichever way you write your blog posts, please give attention to the file name. Your file name must be in the 
`YYYY-MM-DD-<permalink>.<extension>` format where-
- `YYYY` is the 4-digit year of your writing
- `MM` is the 2-digit month of your writing
- `DD` is the 2-digit day of your writing
- `<permalink>` is the permanent link to your post and must match with the `permalink` section mentioned in your post header.
By the way, you post header should have a leading and trailling slash (`/`) before and after the permalink (at least, at the time
of writing this post)
- `<extension>` is the extension of your file and can be any of
  - md
  - markdown
  - html   

One last step as clean-up, though the posts included by pixyll in the `_posts` directory are very helpful as tutorials, 
you may not want them to be in your blog. But, if you still want to keep them, not publishing as blog posts, 
create a directory named `_draft` in your root folder (if it wasn't already there) and put the posts in it. And yes, you have 
guessed correctly, `_draft` is treated by jekyll as draft posts that you are not done writing yet and are not published as 
regular posts.

Well, I think that's all there is to know about jekyll and pixyll. You can always learn more from their websites directly. 
However, while you are reading this post, you may have noticed that my website contains _tag_ and _archive_ features- 
which are not directly supported by pixyll and jekyll. There are lot of plugins to provide you features like "tag", "archive", "tags cloud", 
etc. features. Unfortunately, you cannot use all those cool plugins when you are using GitHub Pages building your jekyll site for you.
How I got around this problem will be covered in another post. Till then, happy (static) blogging. :)