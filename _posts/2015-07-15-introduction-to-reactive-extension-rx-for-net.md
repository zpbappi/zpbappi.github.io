---
title: Introduction to Reactive Extension (Rx) for .NET
author: Zp Bappi
layout: post
permalink: /introduction-to-reactive-extension-rx-for-net/
categories:
  - 'C#'
tags:
  - csharp
  - rx
  - workshop
---
It is probably very, very late to be introduced to Rx library. But, I must say that I am amazed by the power of Rx for .NET. Reactive Extension for .NET is, by far, the most powerful tool to handle events and concurrency that I have come across.

With Rx, I could merge, combine, filter, aggregate (and, what not!) event streams from multiple sources. I don't even have to think about concurrency. It is even easier to switch/maintain execution context using Rx Schedulers. Imagine building a desktop application with background tasks which needs to update the UI. Well, removing the nightmare is one of the many cool features of Rx for .NET. Another very interesting (and of course, powerful) feature is you can schedule you code/task to run in the cloud (or, anywhere you want) and give you back the results. As usual, it is quite easy to do using Rx.

Learning Rx, I consider, is one of the most pleasant experience of my life. With great collection of learning resources available form [MSDN][1], it was so easy to find what I need. You can also learn in the most difficult yet best way, which is from [Rx source code][2] directly. However, I would suggest the [Channel9][3] workshop (videos) to start learning Rx. These videos are really nice and they provide some cool challenges after each module. If you are bit familiar with Rx (at least what it is, and what it is supposed to achieve), the challenges given in workshop starts to make more sense. I have attempted to solve (and, possibly completed) the challenges provided in the workshop. You can find my solutions in this [github repo][4]. As a beginner in Rx, I do not claim my solutions to be the most efficient ones. However, I have also kept the unsolved versions of the challenges in the [unsolved ][5]branch of the same repository. If you can't find the challenges online, please feel free to fork it from the repo and try to solve your own.

If you would like to read rather than watching videos, then [introrx.com ][6]is really the best guide available (so far). There is another good looking site [reactivex.io][7] which is still getting rich in content. Good thing about this site is it contains references to many Rx implementations (i.e. Javascript, Java, etc.).

Getting started with something new can be very unpleasant when you don't know where to start. That's why I wanted to compile the resources that I followed to learn about Rx initially. I hope you enjoy your Rx experience as much as I did.

 [1]: https://msdn.microsoft.com/en-us/data/gg577609.aspx
 [2]: https://rx.codeplex.com/
 [3]: https://channel9.msdn.com/series/Rx-Workshop
 [4]: https://github.com/zpbappi/rx-workshop-challenges
 [5]: https://github.com/zpbappi/rx-workshop-challenges/tree/unsolved
 [6]: http://www.introtorx.com/
 [7]: http://reactivex.io/
