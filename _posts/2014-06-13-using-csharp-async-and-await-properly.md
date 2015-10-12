---
title: 'Using C# async and await properly'
author: Zp Bappi
layout: post
permalink: /using-csharp-async-and-await-properly/
categories:
  - 'C#'
tags:
  - async
  - asynchronous
  - await
  - csharp
---
I should start with a proper warning- this article does not really illustrate what async and await keywords are. If you are not familiar with async and await keywords in C#, I recommend you go through the following MSDN articles:

  * [async (C# Reference)](http://msdn.microsoft.com/en-us/library/hh156513.aspx){:target="_blank"}
  * [await (C# Reference)](http://msdn.microsoft.com/en-us/library/hh156528.aspx){:target="_blank"}
  * [Asynchronous Programming with Async and Await (C# and Visual Basic)](http://msdn.microsoft.com/en-us/library/hh191443.aspx){:target="_blank"}

This article is rather intended to illustrate the benefits we can get by using **async** and **await** properly.

First create a simple console application (I named it AsyncAwaitTest). Then, let us define a dummy class to access "time consuming" resources.

{%highlight csharp%}
namespace AsyncAwaitTest
{
    using System;
    using System.Threading.Tasks;

    public class DummyDelayResource
    {
        public Task SendEmailAsync()
        {
            Console.WriteLine("[{0}] DoNothing", DateTime.Now);
            return Task.Delay(2000);
        }

        public async Task<int> GetRandomNumberAsync()
        {
            Console.WriteLine("[{0}] GetRandomNumber", DateTime.Now);
            await Task.Delay(2000);
            return (new Random()).Next();
        }

        public async Task<string> GetSpecialStringAsync(string message)
        {
            Console.WriteLine("[{0}] GetSpecialString", DateTime.Now);
            await Task.Delay(2000);
            return string.IsNullOrEmpty(message) ? "<NOTHING>" : message.ToUpper();
        }
    }
}
{% endhighlight %}

Consider the above class methods as some expensive operations which has async support (similar to .NET framework's `HttpClient.GetStringAsync` or `DBContext.SaveChangesAsync`). Important thing to keep in mind that, **each of these methods takes 2 seconds** to execute asynchronously.

Now, we write a simple class skeleton to test asynchronous method call performance.

{% highlight csharp %}
namespace AsyncAwaitTest
{
    class Program
    {
        static void Main(string[] args)
        {
            Run();
            Console.ReadLine();
        }

        static async void Run()
        {

        }
    }
}
{% endhighlight %}

As I can't have `async` Main method, I had to introduce a Run method which will run the sample tests we are about to write.

Now, we write a method DoMyTasksV1 which tries to access our asynchronous methods for accessing the resources.

{% highlight csharp %}
static async Task<string> DoMyTasksV1(string message)
{
    Console.WriteLine("[{0}] Entering method DoMyTasksV1...", DateTime.Now);
    var resource = new DummyDelayResource();
    await resource.SendEmailAsync();
    var number = await resource.GetRandomNumberAsync();
    var upper = await resource.GetSpecialStringAsync(message);
    Console.WriteLine("[{0}] Exiting method DoMyTasksV1.", DateTime.Now);
    return string.Format("{0}-{1}", number, upper);
}
{% endhighlight %}

We also add a call to DoMyTasksV1 method by changing our Run() method body as:

{% highlight csharp %}
static async void Run()
{
    Console.WriteLine("[{0}] START", DateTime.Now);
    var result = await DoMyTasksV1("test");
    Console.WriteLine("[{0}] Output: {1}", DateTime.Now, result);
    Console.WriteLine("[{0}] ALL-TASKS-COMPLETED", DateTime.Now);
}
{% endhighlight %}

If you run the program now, you will see that it takes about 6 seconds to complete DoMyTasksV1. Well, that should be okay because each of these resource access methods takes 2 seconds to execute. So, it is simple math and you should be happy with the execution time.

Wait, aren't we using asynchronous programming to achieve parallel execution of independent tasks? Well, yes. But what is the benefit of asynchronous programming if we can't execute our tasks in parallel? I have seen a lot of codes using async/await the same way as we did in DoMyTasksV1 code. By using await, we are actually blocking the code for the asynchronous operation to complete. That is by no means asynchronous programming to me, though you are using async and await keywords.

So, how do we achieve truly asynchronous execution? Simple, if you know how tasks works. Basically each async method returns a Task to you when it starts executing it. It is you who should decide in your calling code when the task must be completed. In our DoMyTasksV1, we are requiring each async task to complete before the program execution can move on to the next line.

The question is, where to wait and where not. Well, in our DoMyTasksV1 method, you can see that we do not really have any dependency on SendEmailAsync() method. It may complete as late as just before returning from the method. However, we do need the two values from GetRandomNumberAsync() and GetSpecialStringAsync() methods before we can return. With this findings, we can now write more optimized version of our method.

{% highlight csharp %}
static async Task<string> DoMyTasksV2(string message)
{
    Console.WriteLine("[{0}] Entering method DoMyTasksV2...", DateTime.Now);
    var resource = new DummyDelayResource();
    var emailTask = resource.SendEmailAsync();
    var number = await resource.GetRandomNumberAsync();
    var upper = await resource.GetSpecialStringAsync(message);
    await emailTask;
    Console.WriteLine("[{0}] Exiting method DoMyTasksV2.", DateTime.Now);
    return string.Format("{0}-{1}", number, upper);
}
{% endhighlight %}

If you change the method to call in Run() method and run the program now, you will see that the execution completes in just 4 seconds now. We just made it 33.33% efficient. What made it possible is- we are no longer waiting for the email sending procedure to complete. Rather we are running in parallel with other tasks. As we have to get the integer and string values before we can return, so these two methods must be awaited. That explains the 4 seconds delay- which seems logical. Or, is it? Lets see if we can improve it any further with our DoMyTasksV3.

{% highlight csharp %}
static async Task<string> DoMyTasksV3(string message)
{
    Console.WriteLine("[{0}] Entering method DoMyTasksV3...", DateTime.Now);
    var resource = new DummyDelayResource();
    var emailTask = resource.SendEmailAsync();
    var numberTask = resource.GetRandomNumberAsync();
    var upperTask = resource.GetSpecialStringAsync(message);

    var number = await numberTask;
    var upper = await upperTask;
    await emailTask;
    Console.WriteLine("[{0}] Exiting method DoMyTasksV3.", DateTime.Now);
    return string.Format("{0}-{1}", number, upper);
}
{% endhighlight %}

If you run the program now with V3 code, amazingly it completes in 2 seconds- which is 66.67% improvement from V1 code.  I think this is as far as optimizations go for this particular method.

I feel the need to clarify one thing explicitly, don't get confused by when the DoMyTasksV1, V2, V3 method returns. Because by design of asynchronous programming, the method returns immediately. Rest of it executes when you await on the task. You can change the Run method as below to clear your confusions about when the task is returned.

{% highlight csharp %}
static async void Run()
{
    Console.WriteLine("[{0}] START", DateTime.Now);
    var task = DoMyTasksV3("test");
    Console.WriteLine("[{0}] TASK-RETURNED", DateTime.Now);
    var result = await task;
    Console.WriteLine("[{0}] Output: {1}", DateTime.Now, result);
    Console.WriteLine("[{0}] ALL-TASKS-COMPLETED", DateTime.Now);
}
{% endhighlight %}

Try it with V1, V2, V3 and see it always returns immediately.

I hope I was able to make my point. That is, when using asynchronous programming, we should always consider not to wait for tasks to complete- unless it is absolutely necessary. That's all I wanted to say. Happy coding :)
