---
title: 'Simple calculator using TDD in F# (part-2)'
author: Zp Bappi
layout: post
permalink: /simple-calculator-using-tdd-in-fsharp-part-2/
categories:
  - 'F#'
tags:
  - calculator
  - fsharp
  - rpn
  - tdd
  - unquote
---
In [previous part](http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-1/), I created a generic stack which supports push and pop operation of "anything" along with a very unnecessary isEmpty method. In this part, I will try to do something useful with the stack and will try to create a calculator that can operate on [Reverse Polish Notation (RPN)](https://en.wikipedia.org/wiki/Reverse_Polish_notation). I will call it *RpnCaluclator. *However, unlike a simple stack, I don't really have the requirement in mind. I guess, I will enrich the requirement for RpnCalculator as I go along, until I find it complete enough. But, before I start, I would like to clean up the previous stack implementation to use the F# type inference. After removing unnecessary type declarations, my stack implementation looks like:

[<img class="alignnone  wp-image-148" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-01.png" alt="02-01" width="511" />][3]

Much cleaner. Now, let's start with RpnCalculator.

***Requirement-1***  
*I want RpnCalculator to take a stack containing strings in Reverse Polish Notation and return the result. Each item in the stack will either be an operand or an operator. Operator can be either integer or a float. The number of operators the calculator supports is fixed. For invalid Reverse Polish Notation or unsupported operators, proper error message should be displayed. *

Not too simple now! But, as we are using TDD, nothing is too complex. Let's see how far we can go. I start by creating two projects as before in the calculator solution, namely "RpnCalculator" and "RpnCalculator.Tests"- both of type F# Class Library. Then added Stack project reference to RpnCalculator project and RpnCalculator project reference to the RpnCalculator.Tests project. Also, installed xunit, xunit.runner.visualstudio and unquote packages to the RpnCalculator.Tests project. Here is how my solution explorer looks like:

[<img class="alignnone  wp-image-149" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-02.png" alt="02-02" width="348" />][4]

Then, I added two files called RpnCalculator.fs and RpnCalculatorTests.fs respectively in these two projects. Without much textual description, here is my first test and a trivial effort to make it pass:

[<img class="alignnone size-full wp-image-150" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-03.png" alt="02-03" width="800" />][5]

Okay. What about now?

[<img class="alignnone size-full wp-image-151" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-04.png" alt="02-04" width="800" />][6]

This failed test leads to another genius (!) implementation like:

[<img class="alignnone  wp-image-152" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-05.png" alt="02-05" width="403" />][7]

Which obviously forces the tests to pass. Now, it is time to bring out the BIG guns so that I can't cheat with implementation anymore. Here is such a test to make sure of that:

[<img class="alignnone size-full wp-image-153" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-06.png" alt="02-06" width="800" />][8]

Well, looks like there is no way to cheat my way out. So, here is a implementation that makes the tests pass:

[<img class="alignnone size-full wp-image-154" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-07.png" alt="02-07" width="800" />][9]

By the way, I also need to add a reference to Stack project in the RpnCulator.Tests project at this point. Well the current implementation looks good enough. Until I realized that "addition" is not the only thing that a calculator can do. What if I want to subtract two numbers like:

[<img class="alignnone  wp-image-155" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-08.png" alt="02-08" width="495"  />][10]

And again, another genius (!) implementation of calculate function is born:

[<img class="alignnone size-full wp-image-156" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-09.png" alt="02-09" width="800" />][11]

Again, two enforce the real implementation, if I add a test like:

[<img class="alignnone size-full wp-image-157" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-10.png" alt="02-10" width="800" />][12]

This makes cheating my way out really hard and lengthy. So, I think a generic solution would be a lot easier. Which is somewhat the real implementation. And, it looks like:

[<img class="alignnone size-full wp-image-158" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-11.png" alt="02-11" width="800" />][13]

It is a good point to stop and look at what I have done so far. Moreover, it would also be good idea to think about limitation of current implementation and how I should proceed further. And, finally if I have even more time, I will think about problems like- [what is the answer to life, the universe and everything][14].

But, let's not get ahead of ourselves and start by simply re-organizing the tests. I will first split my tests in two files like this:

[<img class="alignnone size-full wp-image-159" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-12.png" alt="02-12" width="800" />][15]

It does not give me any immediate benefit. But, it helps me to keep tests for similar functionalities grouped together- which, as a result, also helps me realize what functionalities I have implemented so far from a very high level view.

Now, the real fun begins. Looking at my calculate method implementation it looks like it is going to get messy as I keep adding more operators. Also, I can not really support operands with more than one operators in a single expression with the current implementation. So, I better start refactoring the implementation now. Important thing to realize that, all my tests are green. I can only change my implementation code as long my tests are green. Well, there may be some cases where I need to introduce breaking changes because of change in requirement and implementation strategy. But, I worry about them in appropriate time. Another thing I will keep in mind that I will only refactor code keeping current and upcoming "needs" in mind. Not for "what may come" or "imaginary features". Simply applying [KISS][16] and [YAGNI][17] principles together.

I will first concentrate on the types I need to represent elements of an RpnCalculator. I will place the type definitions in a separate file. I added a new file called "RpnTypes.fs" in RpnCalculator project. I also need to have this file placed before RpnCalculator.fs as the types will be the core component of the RPN calculator. To do that, I simply right-click on the newly created and select "Move Up". Keep doing it until the RpnType.fs file is placed at top in the project.

[<img class="alignnone size-full wp-image-166" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-13.png" alt="02-13" width="800" />][18]

Now, all the types I need for RpnCalculator will be defined in this file. Basically I need types to represent each **item** of the **calculator stack**, which can be either an **operator** or an **operand**. I also need to define the **operations** by the types. For now, I am only considering the binary operations. And, this is how my type definitions look like:

[<img class="alignnone size-full wp-image-168" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-14.png" alt="02-14" width="800" />][19]

Important thing to note that I haven't yet touched any code that may affect my test result. Just to make sure, I run all of the tests and make sure that I have a check point to get back to. Because, I am about to change the way things work in a moment.

I feel like, the first thing I need is to parse string items passed into the RPN calculator into the proper types. Here is the "parse" method with empty implementation for that purpose written in a sub-module named RpnCalculator.Utility.[<img class="alignnone size-full wp-image-180" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-15.png" alt="02-15" width="800" />][20]

&nbsp;

And, here is the expectation from this method expressed as tests:

[<img class="alignnone size-full wp-image-173" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-16.png" alt="02-16" width="800" />][21]

These tests ensures correct implementation (so far) of "parse" method. There are number of ways I can done that. But, I decided to choose active pattern, as it looks really cool. Here is my implementation of parse:

[<img class="alignnone size-full wp-image-177" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-17.png" alt="02-17" width="800" />][22]

Note that, there are barely any type declaration for functions and parameters. I am, and will be in later posts, relying on type inference as much as possible, without reducing the readability of the code. Also, there is a very small utility method called "isAWholeNumber", which I will be using in a moment.

With the parsing part done, I feel like doing some mathematical operations the calculator will perform. I created a file named "RpnBinaryOperations", right after the RpnTypes.fs file.

[<img class="alignnone  wp-image-184" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-18.png" alt="02-18" width="485" />][23]

Looks pretty simple. Now, I will write a simple method "getOperation" to retrieve appropriate operation based on the passed in operator. Also, another method that takes two "Numbers" as input and returns another number as a result. Here is how they look, right above the calculate function:

[<img class="alignnone  wp-image-188" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-19.png" alt="02-19" width="562" />][24]

I will add my final method called "evaluateRpnExpr", which is supposed to implement the RPN expression evaluation algorithm. But, my goal would be to make the tests pass. One such very optimistic and not-so-real-life-aware implementation looks like:

[<img class="alignnone  wp-image-193" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-20.png" alt="02-20" width="542" />][25]

Since, I have only considered integer so far, seems like I will have hard time later dealing with float results. But, for now, let's convert it to integer and have the calculate method look nicer like:

[<img class="alignnone  wp-image-194" src="{{site.url}}{{site.baseurl}}/images/2015/08/02-21.png" alt="02-21" width="426"  />][26]

I know what you would say. And, I am not proud of it either. But please keep in mind that this is a work in progress and I didn't think it through. But, look at the bright side, things starting to look "functional".

That would be all for this part. In the next part, we will try to add support for float return types, evaluating an expression having more than two operands (it is about time). Moreover, if possible, I will try to develop a way to add binary operation externally (from outside RpnCalculator module) and will also focus on how to deal with unary operators. Well, if it becomes too lengthy as this one, there is always "next part". :)

***Useful links***

  * [Part-1][1], setting up the solution and developing the stack.
  * Link to other parts: README section of the [repository][27]
  * Git hub repository: [fsharp-tdd-calculator][27]

&nbsp;

 [1]: http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-1/
 [2]: https://en.wikipedia.org/wiki/Reverse_Polish_notation
 [3]: {{site.url}}{{site.baseurl}}/images/2015/08/02-01.png
 [4]: {{site.url}}{{site.baseurl}}/images/2015/08/02-02.png
 [5]: {{site.url}}{{site.baseurl}}/images/2015/08/02-03.png
 [6]: {{site.url}}{{site.baseurl}}/images/2015/08/02-04.png
 [7]: {{site.url}}{{site.baseurl}}/images/2015/08/02-05.png
 [8]: {{site.url}}{{site.baseurl}}/images/2015/08/02-06.png
 [9]: {{site.url}}{{site.baseurl}}/images/2015/08/02-07.png
 [10]: {{site.url}}{{site.baseurl}}/images/2015/08/02-08.png
 [11]: {{site.url}}{{site.baseurl}}/images/2015/08/02-09.png
 [12]: {{site.url}}{{site.baseurl}}/images/2015/08/02-10.png
 [13]: {{site.url}}{{site.baseurl}}/images/2015/08/02-11.png
 [14]: https://www.google.com.au/?#q=the+answer+to+life+the+universe+and+everything
 [15]: {{site.url}}{{site.baseurl}}/images/2015/08/02-12.png
 [16]: https://en.wikipedia.org/wiki/KISS_principle
 [17]: https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it
 [18]: {{site.url}}{{site.baseurl}}/images/2015/08/02-13.png
 [19]: {{site.url}}{{site.baseurl}}/images/2015/08/02-14.png
 [20]: {{site.url}}{{site.baseurl}}/images/2015/08/02-15.png
 [21]: {{site.url}}{{site.baseurl}}/images/2015/08/02-16.png
 [22]: {{site.url}}{{site.baseurl}}/images/2015/08/02-17.png
 [23]: {{site.url}}{{site.baseurl}}/images/2015/08/02-18.png
 [24]: {{site.url}}{{site.baseurl}}/images/2015/08/02-19.png
 [25]: {{site.url}}{{site.baseurl}}/images/2015/08/02-20.png
 [26]: {{site.url}}{{site.baseurl}}/images/2015/08/02-21.png
 [27]: https://github.com/zpbappi/fsharp-tdd-calculator
