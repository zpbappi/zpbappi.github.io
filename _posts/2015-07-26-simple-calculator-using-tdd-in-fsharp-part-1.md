---
title: 'Simple calculator using TDD in F# (part-1)'
author: Zp Bappi
layout: post
permalink: /simple-calculator-using-tdd-in-fsharp-part-1/
categories:
  - 'F#'
tags:
  - calculator
  - fsharp
  - tdd
  - rpn
---
> **Caution!**  
> Difficulty level: newborn  
> Length: really long part-1 of a multi-part blog post

Being new to the F# world, I was feeling lost and confused. However, after few days of reading and watching, and of course being inspired by F# usergroup in Sydney, I was able to gather some confidence to start building something. This post is not about sharing my experience, rather it is a "write as I go" post. And, honestly I don't know how it is going to end.

Okay. So, I have decided to create a simple calculator using TDD in F#. "Calculator" sounds a simple project. However, my goal is to solve this simple problem in very modular fashion so that in the end I have better understanding of how to organize F# modules, codes and tests. I will probably divide the whole process of developing the calculator in few blog posts. <span style="line-height: 1.6471;">The code will be available in the git repository <a href="https://github.com/zpbappi/fsharp-tdd-calculator">here</a>.</span>

I will be using Visual Studio 2013 to develop it. XUnit will be used to write the tests. And, I could not really find anything better than Unquote for assertion. Lets begin...

*I want to develop a calculator which can do basic arithmetic (like add, subtract, multiplication, division, etc.). It will take a **valid** arithmetic **expression** of **supported operations** and will provide the result. In case of any **error** during the calculation process (e.g. invalid or malformed expression, divide by zero, root of negative one), it will **raise exception** with proper error message and terminate the process.*

At this point, with the requirement in mind, it is very tempting to start writing tests to enforce calculator behavior. However, I would like to take a moment to discuss the problem further and how I can make small reusable components that can be used later in this project (or, even in other projects).

I always find the task of parsing [infix][1] arithmetic expressions a bit difficult. So, I would like to "ignore" this task for now. Rather I would do something simpler- which is parsing [Reverse Polish Notation (RPN)][2] . I believe, I can deal with converting from infix to RPN later. Well, to parse and compute RPN, I think a stack is mandatory. So, I will first concentrate on creating a generic stack. Then I will move towards creating RPN calculator and as a result- a fully functional infix calculator.

In this part, I will only create a stack.

**Creating the stack**

It should be a simple task to create a stack with few lines on code in any language. But, again, I am focusing more on organizing the solution and how small pieces fit together in F#. So, I will move forward slowly and will have very elaborate description of creating stack as I go- like baby steps. Once things start looking good, I will start running.

Let's start by creating a F# project first. I named the project Stack and named the solution TddCalculator. I choose it to be Library type project and checked the "Create directory for solution".

[<img class="alignnone size-full wp-image-128" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.03.50.png" alt="Create F# project" width="800" />][3]

Similarly added another library project called Stack.Tests in the same solution. First things first- delete all the "unnecessary" files that were created with projects. So, my solution explorer looks like:

[<img class="alignnone  wp-image-129" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.10.42.png" alt="Stack and Stack.Tests projects" width="313"  />][4]

I installed "xunit" and "unquote" package for the project Stack.Tests. I also installed "xunit.runner.visualstudio" which enables visual studio to discover and run xunit tests without installing anything else (thanks to [Aaron Powell][5] for this). We can install packages in various ways. However, I prefer opening package manager console and running the following lines one at a time:

{% highlight batch %}
install-package xunit
install-package xunit.runner.visualstudio
install-package unquote
{% endhighlight %}

Finally, added a reference of Stack project in Stack.Tests project. That is all the setup I need to start coding.

I created a file named Stack.fs in Stack project and another file named "StackTest.fs" in Stack.Tests project. I declared a generic type Stack in Stack.fs file. The type "Stack" is nothing but a list of the generic type passed in, according to the declaration. Here is how my VS looks right now:

[<img class="alignnone size-full wp-image-131" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.31.13.png" alt="empty stack and test" width="800" />][6]

Now, it is time to write some tests. Well, we all know the basic operations on a stack are push and pop. However, I decided to add a behavior isEmpty to stack first, just to see how it goes. Here is how I describe isEmpty:

[<img class="alignnone size-full wp-image-132" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.38.17.png" alt="Initial tests for isEmpty" width="800"  />][7]

And, here is the implementation of isEmpty:

[<img class="alignnone  wp-image-133" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.44.01.png" alt="default isEmpty method" width="566" />][8]

Just enough to make the code compile. Now, I really should complete writing the tests before writing any more code. So, after some thoughts, my expectations from isEmpty method becomes:

[<img class="alignnone size-full wp-image-134" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-09.24.24-Copy.png" alt="tests for isEmpty" width="800" />][9]

If I build and run the tests now, only two of the three tests will fail- because of obvious reasons. I haven't implemented the isEmpty method yet. Implementing isEmpty is as simple as returning <span class="lang:scala decode:true  crayon-inline">stack.IsEmpty</span>, which comes with List module. But, if I do it that way, I wouldn't be needing this isEmpty method for stacks at all. Let's do it without the List.IsEmpty method. So, my unnecessarily-complicated-with-no-purpose isEmpty method becomes:

[<img class="alignnone size-full wp-image-135" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-09.24.24.png" alt="isEmpty method body" width="800" />][10]

Now when I build the solution and run the tests, all green. :)

To more serious reader, apologies to make such a simple thing so complicated. Actually implementing isEmpty was just to check if the whole setup works. Looks like it does. Let's start taking bigger steps towards real things that we will need. Let's implement push and pop.

*I want push method to take an element and a stack and return a new stack containing the new element at top. And, I want pop method to take a stack and return a tuple containing the top element and rest of the stack.*

Without further textual description, here is the signature of push and pop method:

[<img class="alignnone  wp-image-136" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-16.51.59.png" alt="Empty push and pop" width="397" />][11]

And, here is the behavior I expect from push and pop:

[<img class="alignnone size-full wp-image-137" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-16.41.59.png" alt="push and pop tests" width="800" />][12]

When I build and run the tests, looks like push and pop methods are not behaving the way I want. After running some code/test/code/refactoring cycle (or not!) I came up with the following implementation of push and pop:

[<img class="alignnone size-full wp-image-138" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-17.14.29.png" alt="buggy push and pop" width="800" />][13]

Seems to work and all my tests are green. But, feels like I am missing something. After going though the test cases (yes, not the implementation of push/pop, but the test cases), I figured that I am missing a boundary/terminal case. Which is- what happens when I pop an empty stack? Let's find out. As soon as I attempt to pop from an empty stack in the F# interactive window, it raises an exception which I didn't consider before. Let's write a test to cover this case and change our implementation. I want to stick to "raising exception" for now. But, this time I will raise the exception with my custom message. So, my final (for now) implementation of pop, with the newly added test case, looks like:

[<img class="alignnone size-full wp-image-139" src="{{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-17.26.05.png" alt="fixed pop method" width="800" />][14]

All tests are passing now. I am happy with current stack implementation. It is behaving the way I want and I can change any behavior later with confidence as I have tests backing me up.

That's all for this first part. In next part, I will try to do something useful towards developing the fully functional calculator with this simple stack.

***Useful links***

  * Next part: [part-2][15]
  * Link to other parts: README section of the [repository][18]
  * F# resources: [fsharp.org][16]
  * [Unquote][17]
  * [GitHub repository][18]

&nbsp;

&nbsp;

&nbsp;

&nbsp;

 [1]: https://en.wikipedia.org/wiki/Infix_notation
 [2]: https://en.wikipedia.org/wiki/Reverse_Polish_notation
 [3]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.03.50.png
 [4]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.10.42.png
 [5]: http://www.aaron-powell.com/
 [6]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.31.13.png
 [7]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.38.17.png
 [8]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-23-21.44.01.png
 [9]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-09.24.24-Copy.png
 [10]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-09.24.24.png
 [11]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-16.51.59.png
 [12]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-16.41.59.png
 [13]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-17.14.29.png
 [14]: {{site.url}}{{site.baseurl}}/images/2015/07/Screenshot-2015-07-24-17.26.05.png
 [15]: http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-2/
 [16]: http://fsharp.org/
 [17]: https://code.google.com/p/unquote/
 [18]: https://github.com/zpbappi/fsharp-tdd-calculator
