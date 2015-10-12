---
title: 'Simple calculator using TDD in F# (part-3)'
author: Zp Bappi
layout: post
permalink: /simple-calculator-using-tdd-in-fsharp-part-3/
categories:
  - 'F#'
tags:
  - calculator
  - fsharp
  - rpn
  - tdd
  - unquote
---
In this part, I will try to solve the problems that I have created in previous parts ([part-2](http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-2/) and [part-1](http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-1/)). First of all, I will add the ability to return int, float and even errors a a result of evaluating RPN expression. So, I add a type, directly in the RpnCalculator module, called "RpnResult" and my calculate method now looks like this:

[<img class="alignnone wp-image-201" src="{{site.url}}{{site.baseurl}}/images/2015/08/03-01.png" alt="03-01" width="407" height="161" />][3]

With this change in place, the test project fails to build as I assumed "int" return type previously. It is fairly easy to fix, by simply adding "Integer" in front of every expected "int" return type. I am not going to show that step. But, [this link][4] should turn out to be helpful if you fail to understand how to make the test project build again. Needless to mention, all the tests are still green.

I am adding a clever little test case that will make sure that I can operate on "int" and "float" numbers simultaneously and can return proper result from the RpnCalculator. Here is how it looks:

[<img class="alignnone size-full wp-image-205" src="{{site.url}}{{site.baseurl}}/images/2015/08/03-02.png" alt="03-02" width="800" />][5]

Surprisingly, current implementation passes almost all the test cases for this test, except for "*2 + 1.4 = 3.14*" and "*2.6 + 3.7 = 6.3*". It took me quite a while to find out which should be surprising- the failing tests? or, the passing ones?

Anyway, in summary, the reason for failure is- floating point numbers are handled a bit differently than we naturally assume about numbers. That's why, although <span class="lang:c# decode:true crayon-inline ">1f + 2.14f == 3.14f</span> , but <span class="lang:c# decode:true crayon-inline ">2f + 1.14f != 3.14f</span> . The reason behind this is beyond the scope of this blog. This is another late realization that- I should really not be using floating point numbers. Decimal is always a safer choice if you can use them. Looks like I can. So, lets jump in and change all our float types to decimal. This is not a difficult task, but a time consuming one. So, I am not going to document it here. But, for interested readers, you can find the changes I made in [this][6] commit. And, with this change from float to decimal, all our tests green magically.

I forgot to add two more (actually, one) trivial cases. Let's add them in the TrivialTests.fs file in the RpnCalculator.Tests project. Here they are:

[<img class="alignnone wp-image-207" src="{{site.url}}{{site.baseurl}}/images/2015/08/03-03.png" alt="03-03" width="520" height="130" />][7]

And, I can easily make them pass by changing the implementation of evaluateRpnExpr method like this:

[<img class="alignnone wp-image-208" src="{{site.url}}{{site.baseurl}}/images/2015/08/03-04.png" alt="03-04" width="442" height="377" />][8]

Well, it is about time to force the real RpnCalculator implementation with more than two operands and other supported operations. Best way to do that would be to right some tests. I am getting either lazy or smart to right too many tests. I am adding a new file the in the test project with just one theory. Looks like the following cleverly written test should be sufficient to force a "real" implementation of the calculate method for more than two operands:

[<img class="alignnone size-full wp-image-209" src="{{site.url}}{{site.baseurl}}/images/2015/08/03-05.png" alt="03-05" width="800" />][9]

Actually, implementing a function that evaluates RPN expression turns out to be a quite simple one as I already have all the types and helper functions defined. So, following the worked out example in wiki [here][10], my implementation becomes:

[<img class="alignnone wp-image-210" src="{{site.url}}{{site.baseurl}}/images/2015/08/03-06.png" alt="03-06" width="401" height="565" />][11]

Looks pretty simple for a fully operational Rpn calculator. But, this is what makes all the tests pass. So, I am happy with that. I have changed the signature of evaluateRpnExpr and also made it private. The whole calculation looks much cleaner than the previous one. Let's leave it this way in this part. We may refactor/reorganize it further once we add more functionalities to it.

***Useful links***

  * GitHub repository: [fsharp-tdd-calculator][12]
  * Link to other parts: README section of the [repository][12]
  * Reference: [wiki page][10] for evaluating RPN expression

&nbsp;

 [1]: http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-2/
 [2]: http://zpbappi.com/simple-calculator-using-tdd-in-fsharp-part-1/
 [3]: {{site.url}}{{site.baseurl}}/images/2015/08/03-01.png
 [4]: https://github.com/zpbappi/fsharp-tdd-calculator/commit/db5a6a3cb922772639e58f12e9910a1a43960c88
 [5]: {{site.url}}{{site.baseurl}}/images/2015/08/03-02.png
 [6]: https://github.com/zpbappi/fsharp-tdd-calculator/commit/18b8f0de32d559a419b58d1530070e4da0de6930
 [7]: {{site.url}}{{site.baseurl}}/images/2015/08/03-03.png
 [8]: {{site.url}}{{site.baseurl}}/images/2015/08/03-04.png
 [9]: {{site.url}}{{site.baseurl}}/images/2015/08/03-05.png
 [10]: https://en.wikipedia.org/wiki/Reverse_Polish_notation#Postfix_algorithm
 [11]: {{site.url}}{{site.baseurl}}/images/2015/08/03-06.png
 [12]: https://github.com/zpbappi/fsharp-tdd-calculator
