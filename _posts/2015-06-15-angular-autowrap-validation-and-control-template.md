---
title: 'Angular AutoWrap &#8211; validation and control template'
author: Zp Bappi
layout: post
permalink: /angular-autowrap-validation-and-control-template/
categories:
  - Javascript
tags:
  - angular-js
  - angular-autowrap
  - template
  - validation
  - wrapper
---
Although AngularJS itself is pretty wonderful, I often run into situations where the html markup begins to get noisy. Displaying validation messages for input control can be a very prominent example of what I mean. In the markup, the actual meaningful line is (or, it should be):

{% highlight html %}
<input type="text" name="myName" data-ng-model="model.myName" data-required data-ng-minlength="5" />
{% endhighlight %}

But, to display the proper validation status, the whole thing looks kinda like this:

{% highlight html %}
<div class="wrapper" data-ng-class="{'error': hasAnyError() && isDirty(), 'success': !hasAnyError() && isDirty()}">
	<input type="text" name="myName" data-ng-model="model.myName" data-required data-ng-minlength="5" />
	<span class="errorMessage" data-ng-show="hasRequiredError()">My name is required.</span>
	<span class="errorMessage" data-ng-show="hasMinLengthError()">My name should be at least 5 characters long</span>
</div>
{% endhighlight %}

Well, it may not be "exactly" same for all of us, but you get the idea. Just look at the noise, it's disgusting.

So, I started to write a directive that will remove the noise completely and will make the intent more clearly visible. As a summary, I would like AngularJS to render the above noisy code if I write just the following:

{% highlight html %}
<input type="text" name="myName" data-ng-model="model.myName" data-required data-ng-minlength="5" my-magic-directive />
{% endhighlight %}

Well, this blog post is about writing the "my-magic-directive". But, I call it [Angular AutoWrap][1]. About half-way writing the directive, I realized there a similar project called [angular-auto-validate](https://github.com/jonsamwell/angular-auto-validate). Although it didn't stop me completely, but somewhat changed the motivation. For starter, I completely ignored the fact that I will have to "validate" something and relied completely on AngularJS to that (fingers crossed !). Then, I tried so hard <span style="text-decoration: underline;">**NOT**</span> to have a fixed template for displaying a validation message. Well, I ended up creating a template provider for any arbitrary control. It supports displaying validation status/message completely. In addition to that supports creating custom template any type of control (inspired by ASP.NET MVC). That is, you type:

{% highlight html %}
<input type="email"
name="myEmail"
id="my-email"
placeholder="Enter email"
my-magic-directive
my-magic-label="Email address"
/>
{% endhighlight %}

And get:

{% highlight html %}
<div class="form-group">
	<label for="my-email">Email address</label>
	<input type="email" name="myEmail" class="form-control" id="my-email" placeholder="Enter email">
</div>
{% endhighlight %}

Wouldn't it be nice!? Well, that is supported, along with custom theme for templates. Though it runs without any configuration, needless to mention that most of the default configurations can be overridden easily.

This is still an on-going development. I add features to it as I find it needed. You are welcome to suggest features. Currently I am trying to cover-

  * Ability to design template as AngularJS templates.
  * Templates for control by name, with facility to override it.
  * Support multiple theme, as well as default theme for each control.
  * Support validation message injection for each AngularJS built-in validation type.
  * Support for ng-model-options to decide when to validate controls.
  * When simply wrapping a control without the need of validation, turning of validation state tracking as an optimization.
  * Injecting custom validation logic and respective validation message.
  * Vary template by input type (text, email, phone, etc.).
  * More items to be added as I discover them along the way.

As it there is no bound to the features that can be added, I will have eventually stop and release as stable version eventually. So, considering general use-cases, I will consider it to be "usable" when I have implemented "Injecting custom validation logic" thingy. Moreover, most important yet boring part is yet to be done. That is, writing the documentation and/or features of the directive.

I am really loving the way it is turning out to be. But don't let that stop you from contributing.

Here is the [github repo][1] again, in case you've missed it above.

 [1]: https://github.com/zpbappi/angular-autowrap
