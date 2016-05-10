---
title: Curiously Recurring Template Pattern (CRTP) in C#
author: Zp Bappi
layout: post
permalink: /curiously-recurring-template-pattern-in-csharp/
tags:
  - csharp
  - crtp
  - design-pattern
---

CRTP or Curiously Recurring Template Pattern is often a very good topic to confuse people.
If you are one of the people who got the grasp of it completely, well done! However, 
if you are not one of those people, this post is for you. I will try to explain
my perception about CRTP.

So, without further introduction, let's jumpt into the definition of CRTP.
In C#, CRTP can be represented as a base class with difinitions similar to:
{% highlight csharp %}
public abstract class Base<T> where T : Base<T>
{
  // some other meaningful things...
}
{% endhighlight %}

Well, it isn't that hard to read. But, wait... isn't that... I mean... the type `T`...
it is defined by itself, how... why... (after reasonable amount of time later)... okay, 
so `T` is something like:

![alt text][crtp]

But, wait again... what does it even mean... is that possible... how does it even compile... why...

Don't worry if you are stuck somewhere above. I know the feeling.
It is difficult to understand from the definition. The complex
recurring relation became clear to me when I started looking at the problems it was trying to solve. 
Let's have a look at that. But, before you start reading further, forget about CRTP
and focus on the problem first.

Imagine you are creating an abstract base class which will have a common 
behavior for all the derived classes. Let's say, you want to have a method 
named `Copy`, which is supposed to create a copy of the instance. However, 
as each derived class may be different, you want all the derived classes to
implement the `Copy` method. One way of achieving that can be:

{% highlight csharp %}
public abstract class Base
{
    public abstract Base Copy();
}

public class Derived : Base
{
    public string DerivedClassProperty
    {
        get { return "Yay!!!"; }
    }
  
    public override Base Copy()
    {
        var copy = MAGICALLY_COPY_ME();
        return copy;
    }
}
{% endhighlight %}

With the above code, if I want to copy the instance of a derived class and want to 
use any derived class property or method on the copied instance, I will need to
downcast it manually to the derived type. Here is what I mean:

{% highlight csharp %}
var derived = new Derived();
var copy = derived.Copy();

// Cannot perform the operation below
// Console.WriteLine(copy.DerivedClassProperty);

var copyCast = (Derived)copy;
Console.WriteLine(copyCast.DerivedClassProperty);
{% endhighlight %} 

As you can tell, the manual downcasting looks messy. There are situations
where such manual casting will lead you to problems. I prefer avoiding it 
as much as I can. However, in this case, the base class does not really know
about the type of the derived class. So, we can't really avoid the manual casting.
Or, can we?

What if we pass the derived class type to the base class as a generic type parameter? Let's try that:

{% highlight csharp %}
public abstract class Base<T>
{
    public abstract T Copy();
}

public class Derived : Base<Derived>
{
    public string DerivedClassProperty
    {
        get { return "Yay!!!"; }
    }
  
    public override Derived Copy()
    {
        var copy = MAGICALLY_COPY_ME();
        return copy;
    }
}
{% endhighlight %}

With the slight change in the class definition, we can feel that it is already starting to look pretty.
We no longer need to do the downcasting and we can use the copied instance as:

{% highlight csharp %}
var derived = new Derived();
var copy = derived.Copy();

Console.WriteLine(copy.DerivedClassProperty);
{% endhighlight %}

Wonderful. But, there is a slight problem. The generic type parameter, that we are passing to the base class, can actually be 
anythng- as we have not yet added any restriction. So, there is nothing stopping me from writing
a derived class like:

{% highlight csharp %}
public class PeculiarDerived : Base<int>
{
    public string WhoAmI
    {
        get { return "The answer to life, universe and everything."; }
    }

    public override int Copy()
    {
        return 42;
    }
}
{% endhighlight %}

The above code compiles with no problem. It even runs perfectly. So, what's the problem?

Well, the design we have been creating so far, kind of assumes that the type parameter `T` 
is derived from the `Base` type. In our minimalistic example above, it is not causing 
any problem if the assumption is violated. However, in real life, it will not be the case.
You will often have some base class methods being called on any derived instance.
To illustrate, let's add something to our original requirement. That is, the base does 
some _mythical_ operation on the copied instance before returning it. So, we will actually
delegate the creation of the copy to the derived classes and do the required _mythical_ operation
from the base class. One possible implementation of that may look like:

{% highlight csharp %}
public abstract class Base
{
    public Base Copy()
    {
        var copy = this.DuplicateInternal();
        copy.MythicalMumboJumbo();
        return copy;
    }

    protected abstract Base DuplicateInternal();
    
    private void MythicalMumboJumbo()
    {
        // abra-ka-dabra
    }
}

public class Derived : Base
{
    protected override Base DuplicateInternal()
    {
        return MAGICALLY_COPY_ME();
    }
}
{% endhighlight %}

Ops, we forgot to add the generic type trick that we have discovered. 
Let's try to add that.

{% highlight csharp %}
public abstract class Base<T>
{
    public T Copy()
    {
        var copy = this.DuplicateInternal();
        copy.MythicalMumboJumbo(); // doesn't compile
        return copy;
    }

    protected abstract T DuplicateInternal();

    private void MythicalMumboJumbo()
    {
        // abra-ka-dabra
    }
}

public class Derived : Base<Derived>
{
    protected override Derived DuplicateInternal()
    {
        return this;
    }
}
{% endhighlight %}

Wait, it does not compile this time. The line `copy.MythicalMumboJumbo()` is not compiling
to be exact. After some thinking, it appears that the `Base` class does not know 
anything about the generic type `T`. And, as the variable `copy` is of type `T`, 
compiler is not sure there exists any method called `MythicalMumboJumbo()` in this 
type. We have to provide some hint to the compiler so that 
the type `T` becomes meaningful. What we actually want is the type `T` to be 
a derived type from `Base`. Simplest way of writing that is `where T : Base`.
However, the `Base` has a generic type parameter which is
the derived type itself. For example, when we create derived class, we define it as `public class Derived : Base<Derived> { ... }`. 
Similar reasoning can be used in writing generic type restriction. We can write the generic type
constraints as `where T : Base<T>`. It may help if you think `T` as `Derived`.

So, with this understanding, our base class definition becomes:

{% highlight csharp %}
public abstract class Base<T> where T : Base<T>
{
    public T Copy()
    {
        var copy = this.DuplicateInternal();
        copy.MythicalMumboJumbo();
        return copy;
    }

    protected abstract T DuplicateInternal();

    private void MythicalMumboJumbo()
    {
        // abra-ka-dabra
    }
}
{% endhighlight %}

Well, now if you look carefully, this is actaully the CRTP in C#.
I like to follow one very simply convention for CRTP. That is, I name the 
generic type parameter `TDerived` rather than just `T`. That gives me (or, the user of the code)
an indication that the generic type parameter is expecting the derived type and it is implemented as CRTP.

The final signature of the base class may look like:

{% highlight csharp %}
public abstract class Base<TDerived> where TDerived : Base<TDerived>
{
    public TDerived Copy()
    {
        var copy = this.DuplicateInternal();
        copy.MythicalMumboJumbo();
        return copy;
    }

    protected abstract TDerived DuplicateInternal();

    private void MythicalMumboJumbo()
    {
        // abra-ka-dabra
    }
}
{% endhighlight %}

I hope, I was able to explain how I understand CRTP, without getting stuck in the 
never ending loop. If you apply CRTP in real life often (where applicable),
you may have an epiphany- "Ohh.... that's what CRTP is all about.".

> Generally, whenever you need the derived class information in the base class, you are
probably looking for CRTP.

Here are some situations where you may apply CRTP.



__Abstract data structures__

Something like linked list. May be, the base class only knows about the parent, but keeps the children 
implementation for the derived classes.

{% highlight csharp %}
public abstract class AbstractSinglyLinkedList<TDerived> 
    where TDerived : AbstractSinglyLinkedList<TDerived>
{
    private TDerived parent;
    
    public AbstractSinglyLinkedList(TDerived parent)
    {
        this.parent = parent;
    }

    public TDerived Parent
    {
        get
        {
            return this.parent;
        }
    }
}

public class BinaryTree : AbstractSinglyLinkedList<BinaryTree>
{
    private readonly int data;
    
    public BinaryTree(BinaryTree parent, int data) : base(parent)
    {
        this.data = data;
    }

    public BinaryTree Left { get; private set; }

    public BinaryTree Right { get; private set; }

    public void AddLeft(int left)
    {
        this.Left = new BinaryTree(base.Parent, left);
    }

    public void AddRight(int right)
    {
        this.Left = new BinaryTree(base.Parent, right);
    }
}
{% endhighlight %}



__Fluent methods__

Have you seen the nice fluent methods in different libraries where you can call methods after methods
in a chain? Well, this is one way of implementing fluent methods:

{% highlight csharp %}
public interface IFluentOperations<TDerived>
    where TDerived : IFluentOperations<TDerived>
{
    TDerived FluentlyDoSomething();
    TDerived FluentlyDoSomethingElse();
    TDerived EnoughFluentForNow();
}

public class MagicOperations : IFluentOperations<MagicOperations>
{
    public MagicOperations FluentlyDoSomething()
    {
        // do something
        return this;
    }

    public MagicOperations FluentlyDoSomethingElse()
    {
        //do something else
        return this;
    }

    public MagicOperations EnoughFluentForNow()
    {
        // had enough!!!
        return this;
    }
}
{% endhighlight %}

And, then, you use it like a boss:

{% highlight csharp %}
var op = new MagicOperations();
op
    .FluentlyDoSomething()
    .FluentlyDoSomethingElse()
    .EnoughFluentForNow();
{% endhighlight %}


__Template method pattern__

You may have heard about (or, even used) a design pattern named [template method pattern](https://en.wikipedia.org/wiki/Template_method_pattern).
If you need to return the actual instance from template method, CRTP can help you with the return type. 
Here is how it may look like:

{% highlight csharp %}
public abstract class AlgorithmBase<TDerived>
    where TDerived : AlgorithmBase
{
    public TDerived Run()
    {
        this.Step1();
        this.Step2();
        // ...
        this.StepN();
        this.FinalStep();
        
        return (TDerived)this;
    }
    
    protected abstract void Step1();
    protected abstract void Step2();
    // ...
    protected abstract void StepN();
    protected abstract void FinalStep();
} 
{% endhighlight %}


Although these are different use cases of CRTP, but they all have a single requirement
in common. That is, the base class requires the knowledge of the derived classes.
If you face any such situation, I am sure that you can use CRTP quite comfortably now.

If you have any working example, feel free to add it in the comment. 
I would be curious to see your recurring template. :)

[crtp]: {{site.url}}{{site.baseurl}}/images/2016/05/crtp.png "Visualizing CRTP"
