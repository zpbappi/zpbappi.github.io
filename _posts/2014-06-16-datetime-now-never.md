---
title: DateTime.Now? Never.
author: Zp Bappi
layout: post
permalink: /datetime-now-never/
categories:
  - 'C#'
tags:
  - csharp
  - datetime
  - unit-test
---
**UPDATE:**  
*I have changed DateTime.Now to DateTime.UtcNow in the code samples.*

This is something I learned from guru [Kazi Rashid](https://twitter.com/manzurrashid){:target="_blank"} and is worth sharing a thousand times. This may also save you life as well as your job in some cases.

When developing a solution (from very simple ones to the ones with enterprise level complexity), you often face situation where you have to use current date/time. Some example scenario may be-

  * you run some task at exact time of a day.
  * you send email notifications to users at night.
  * you run some book-keeping on an exact day of year (say, 1st January of every year)
  * you send birthday wishes/reminders to user.
  * ...

Well, the list can go on forever. To implement all such scenarios, it is very tempting to use famous `DateTime.Now` provided by .NET library for our convenience. Nothing wrong with it, your solution will operate exactly as it should be (given that your implementation is correct). Then, why should we never use it?

The answer lies deep within your understanding of "developing a software". If you think you are done just after coding the logic properly- you should stop reading this article. This is not meant for you.

However, if you would like to "test" your software (more accurately, the unit of module you just developed), you will face some problem with your implementation. Consider you have developed a system that does not permit user creation after 5 pm (insane! but bear with me). So, how would you test this feature? Two immediate solution pops in mind-

  1. wait until it is 5 pm, then test.
  2. if you are in a hurry, change the system time (yes, I mean your operating system's time) to 5.10 pm and then test.

Sounds pretty simple. Also, pretty stupid. You will soon find out that, though extremely ridiculous, these stupid options are the only available options for you to test your system. That is the problem comes with `DateTime.Now` or `DateTime.UtcNow` for free. In short, you can not test your code's behavior in different time- although you know that the behavior will be different in different times.

So, how do we get around this problem and still maintain a testable code? It is pretty simple. Never use `DateTime.Now` or `DateTime.UtcNow` anywhere in your code. FULL STOP.

Then how on earth will we get the reference to current time? You will need a simple helper/utility class for that purpose. You may have a core module or library or framework (or whatever you call it) which is available in all parts of your project. Include this simple class in that core library.

{% highlight csharp %}
public static class Clock
{
    private static Func<DateTime> _resolver;

    static Clock()
    {
        _resolver = () => DateTime.UtcNow;
    }

    public static DateTime Now
    {
        get
        {
            return _resolver();
        }
    }

    public static Func<DateTime> Resolver
    {
        set
        {
            _resolver = value ?? (() => DateTime.UtcNow);
        }
    }

    public static void Reset()
    {
        Resolver = null;
    }
}
{% endhighlight %}

Then, always use `Clock.Now` anywhere you want to get the current date/time from system.

So, how is it different from `DateTime.UtcNow`? Remember our example scenario where we do not allow user creation after 5 pm. To test this scenario, all we have to do is-

**1.** in our test initialization, we have to add the following code:

{% highlight csharp %}
var simulationDateTime = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 17, 10, 0);
Clock.Resolver = () => simulationDateTime;
{% endhighlight %}
<br>
**2.** when our test ends, we have to make sure to call `Clock.Reset();`

That's all you need to do. All your tests will run with a simulated time 5.10 pm of current day. And when tests end, your clock will reset to current time leaving your system unaffected. You neither have to wait for 5 pm any more, nor you need to change the system time. I am sure you will find more use cases where you can use this small utility class.

I hope this will help you in many situations, as it helped me.


**Update [June 18, 2014]:**
It seems I have missed a very important thing- Microsoft Fakes (ShimsContext to be exact). You will find more detail [here](http://msdn.microsoft.com/en-us/library/hh549176.aspx){:target="_blank"}.
