---
title: Configurable transaction scope
author: Zp Bappi
layout: post
permalink: /configurable-transaction-scope/
categories:
  - 'C#'
tags:
  - csharp
  - configuration
  - transaction
  - transaction-scope
---
In one my projects, I had to implement something with [TransactionScope](http://msdn.microsoft.com/en-us/library/system.transactions.transactionscope.aspx){:target="_blank"}. Here is the code skeleton for that purpose:

{% highlight csharp %}
public void RunOperation()
{
    var options = new TransactionOptions
                            {
                                IsolationLevel = IsolationLevel.ReadCommitted,
                                Timeout = TimeSpan.FromSeconds(60000)
                            };
    using (var scope = new TransactionScope(TransactionScopeOption.Required, options))
    {
        try
        {
            DoSomething();
            scope.Complete();
        }
        catch (Exception ex)
        {
            //handle exception if you want.
        }
    }
}
{% endhighlight %}

Consider the `RunOperation` method as the main entry point for the awesome feature.

After a while, modifications in the requirement came as usual. Part of the modification was that we have to decide whether to use transaction or not based on a settings injected externally. This settings can come from database or an entry in `App.Config` file (in my case, it was from `App.Config`). It is not a complex requirement. However, thinking about how to implement it- I found it quite interesting. Hence, the sharing. I will go through few possible ways to implement it.

First of all, if you do not like to complicate things, you will probably go with the classical "if-else" approach. As the `TransactionScope` should be used in a using block (for your safety), your code may look like this:

{% highlight csharp %}
public void RunOperation()
{
    if (Settings.UseTransaction)
    {
        var options = new TransactionOptions
                                {
                                    IsolationLevel = IsolationLevel.ReadCommitted,
                                    Timeout = TimeSpan.FromSeconds(60000)
                                };
        using (var scope = new TransactionScope(TransactionScopeOption.Required, options))
        {
            try
            {
                DoSomething();
                scope.Complete();
            }
            catch (Exception ex)
            {
                //handle exception if you want.
            }
        }
    }
    else
    {
        try
        {
            DoSomething();
        }
        catch (Exception ex)
        {
            //handle exception if you want.
        }
    }
}
{% endhighlight %}

Bad idea. Very bad idea. Next, if you think rationally (read- object oriented design principals), you will probably want to encapsulate the behavior that varies. That is true. However, as the behavior here is whether to have using block with `TransactionScope` or not have that block totally, you may think of having an abstraction of the whole process. In that case, your code may look like:

{% highlight csharp %}
public abstract class AbstractOperation
{
    public abstract void Operate();

    protected void DoSomething()
    {
        //your implementation of things to do
    }
}

public class OperationWithTransactionScope : AbstractOperation
{
    public override void Operate()
    {
        var options = new TransactionOptions
        {
            IsolationLevel = IsolationLevel.ReadCommitted,
            Timeout = TimeSpan.FromSeconds(60000)
        };
        using (var scope = new TransactionScope(TransactionScopeOption.Required, options))
        {
            try
            {
                DoSomething();
                scope.Complete();
            }
            catch (Exception ex)
            {
                //handle exception if you want.
            }
        }
    }
}

public class OperationWithoutTransaction : AbstractOperation
{
    public override void Operate()
    {
        try
        {
            DoSomething();
        }
        catch (Exception ex)
        {
            //handle exception if you want.
        }
    }
}

public class OperationFactory
{
    public AbstractOperation CreateOperation(bool useTransaction)
    {
        return useTransaction ? (AbstractOperation)new OperationWithTransactionScope() : new OperationWithoutTransaction();
    }
}
{% endhighlight %}

And, your `RunOperation` method may look like:

{% highlight csharp %}
public void RunOperation()
{
    var factory = new OperationFactory();
    var operation = factory.CreateOperation(Settings.UseTransaction);
    operation.Operate();
}
{% endhighlight %}

This is not a bad idea. Though you can make lot of improvements to the above implementation, but you get the idea. However, to me, it was a bit over engineering. Because, the codes inside transaction scope does not vary at all. What varies is whether to use transaction or not. So, why not just encapsulate the behavior of `TransactionScope`! And that is what I did. I wrote a custom class called `ConfigurableTransactionScope` and injected a boolean value within constructor- which decides whether or not it should initiate transaction. Here is the code for `ConfigurableTransactionScope`:

{% highlight csharp %}
public class ConfigurableTransactionScope : IDisposable
{
    private readonly bool _useTransaction;
    private readonly TransactionScope _scope;

    public ConfigurableTransactionScope(bool useTransaction)
    {
        _useTransaction = useTransaction;
        if (useTransaction)
        {
            var options = new TransactionOptions
                                   {
                                       IsolationLevel = IsolationLevel.ReadCommitted,
                                       Timeout = TimeSpan.FromSeconds(60000)
                                   };
            _scope = new TransactionScope(TransactionScopeOption.Required, options);
        }
    }

    public void Commit()
    {
        if (_useTransaction)
        {
            _scope.Complete();
        }
    }

    public void Dispose()
    {
        if (_useTransaction)
        {
            _scope.Dispose();
        }
    }
}
{% endhighlight %}

With this wrapping of `TransactionScope`, your `RunOperation` method will look like:

{% highlight csharp %}
public void RunOperation()
{
    using (var scope = new ConfigurableTransactionScope(Settings.UseTransaction))
    {
        try
        {
            DoSomething();
            scope.Commit();
        }
        catch (Exception ex)
        {
            //handle exception if you want.
        }
    }
}
{% endhighlight %}

Pretty neat! You can do some other cool things with this approach. One of them may be, instead of passing just a boolean value, you can pass a whole object with different settings to configure transaction in the constructor. This settings may include isolation-level, timeout, etc. values loaded externally.

This approach can be useful when you want dynamically configurable behaviors for "something" that you use in a "using" block.
