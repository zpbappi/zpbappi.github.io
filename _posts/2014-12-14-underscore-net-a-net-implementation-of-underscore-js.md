---
title: 'Underscore.Net - A .NET implementation of Underscore.js'
author: Zp Bappi
layout: post
permalink: /underscore-net-a-net-implementation-of-underscore-js/
categories:
  - 'C#'
tags:
  - csharp
  - underscore-js
  - underscore-net
---
This is an experimental project began few days ago when I accepted a challenge by [Kazi Rashid][1]. I had to implement [_.debounce()](http://underscorejs.org/#debounce) method of [Underscore.js](http://underscorejs.org/) in c# to complete this challenge. I thought, why stop at `debounce()` only?

So, I ended up creating a [github project](https://github.com/zpbappi/underscore-net). Currently `_.once()` and `_.debounce()` methods are implemented and they are published to master branch. However, I will continue to implement other methods in [dev](https://github.com/zpbappi/underscore-net/tree/dev) branch. Once they are properly tested, they will eventually make their ways into master branch.

I tried to keep the .NET version consistent with Underscore.js, as much as possible. However, Underscore.Net accepts Action as callback functions. Moreover, you can use generic Action&lt;T&gt;. So far, Actions containing up to 4 parameters are supported. For detail usage, please visit the tests in [Underscore.Specs](https://github.com/zpbappi/underscore-net/tree/dev/Underscore.Specs) folder of the github repo.

Here is a sample usage of Underscore.Net methods implemented so far.

{% highlight csharp %}
namespace TestMarkdownNamespace
{
    using UnderscoreNet;

    public class TestMarkdownClass
    {
        private readonly Action initApplication;
        private readonly Action&lt;string, IMarkdownCompiler, IHtmlContent&gt; render;
        private readonly IMarkdownCompiler markdownCompiler;

        public TestMarkdownClass()
        {
            this.initApplication = Underscore.Once(this.InitializeApplication);
            this.render = Underscore.Debounce<string, IMarkdownCompiler, IHtmlContent>(this.RenderMarkdown, 2000);
            this.markdownCompiler = new MarkdownCompiler();
        }

        private void InitializeApplication()
        {
            // very expensive method and should be called once only
            Console.WriteLine("App initialized.");
        }

        private void RenderMarkdown(string markdownContent, IMarkdownCompiler compiler, IHtmlContent htmlContent)
        {
            this.initApplication(); // if it was not initialized before :)
            htmlContent.Content = compiler.Compile(markdownContent);
        }

        public void OnMarkDownContentChange(string content, IHtmlContent htmlContent)
        {
            // this method is called as soon as someone changes any markdown content (on keyup)
            this.render(content, this.markdownCompiler, htmlContent);
        }
    }
}
{% endhighlight %}

This project is in very early stage. While I encourage constructive criticisms, I would really appreciate some contributions too. Please let me know if you want to contribute to it. Keep in mind that there are lot of underscore methods for which we have much better implementation already in .NET (mostly for Collection and Array section of Underscore.js). So, it would be better if we concentrate on [Functions](http://underscorejs.org/#functions) section of Underscore.js first. Let's make something wonderful together with underscore flavor.

 [1]: https://twitter.com/manzurrashid
