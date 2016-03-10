---
layout: post
title: Multi currency generic Money in C#
permalink: /multi-currency-generic-money-in-csharp/
tags:
  - money
  - currency
  - csharp
---

I have recently [written](https://github.com/zpbappi/money) a Money class in C# with generic and multi-currency support.

## Why should I use it?
It is supposed to be different than the existing ones.

## How is it different?
For starter, the data type of the `amount` in Money is not really fixed. 
You can use any built-in data type (`double`, `decimal`, `float`, etc.) to represent the `amount`.
You can even use any custom data type as well (lets say, you have created a custom data type called `ExtremelyLargeNumber`).
However, the custom data type needs to satisfy very few things, namely-

- It must be a `ValueType`
- It must be comparable with itself (_you know, to sort or event to tell that an amount is greater than the other_)
- If you want to add/subtract/multiply/divide any built-in type (say, `int`) with Money of your custom type,
you have to implement implicit conversion between your type and the target type.
- You will also need to implement the operators in your custom data type. Not all of them, 
just the ones you will be using. For example, if your operations are limited to addition and subtraction 
of money objects, then you only have to implement `+` and `-` operators in your custom data type 
_[thanks to [aleksei](https://twitter.com/dekko_ru) for his review]_.
- Finally, it is not recommended to implement your own numeric data type, unless you absolutely have to. 
This can be a very tricky thing to do- think about the operators, comparision and implicit casting into other types.
In most cases, `decimal` will be more than enough.

Technically speaking, if your custom type is `CustomNumber`, then the following restriction applies on `CustomNumber`:
{% highlight csharp %}
... where CustomNumber : struct, IComparable, IComparable<CustomNumber>
{% endhighlight %}
And, if you want to convert `int` number into your custom type `CustomNumber`, or want to add any `int` number
with Money with amount of type `CustomNumber`, then you should also implement implicit conversion like:
{% highlight csharp %}
public static implicit operator CustomNumber(int number)
{
    CustomNumber myNumber;
     // somehow convert the number into your CustomNumber type
     // and set the value in myNumber variable
     return myNumber; 
}
{% endhighlight %}
You can apply the same principle to support conversion to and from any data type you want. 

## What about currency?
Good question. Yes, you can specify the currency when constructing a Money object. 
If you do not specify a currency, the currency from the your machine's currenctly
set UI culture will be used.

## Okay. Where do I get it?
You can simply add a reference to 
[this nuget package](https://www.nuget.org/packages/Multi-Currency-Money/)
and start using it. 

Oh wait, did you mean _get the code_? You will find the code in 
[this github repository](https://github.com/zpbappi/money).

## Can I see some code now?
Sure. Here is a basic example:
{% highlight csharp %}
// create money with decimal type of amount in my currency
var localMoney = new Money<decimal>(100m);

// create Australian dollars 
var aud = new Money<decimal>(42m, "AUD"); 
{% endhighlight %}

Each money object exposes the currency (always in upper case) and the amount it represents. 
Money objects are comparable with each other, only if they are of same currency.
They also support unary operation as well as binary operations with built-in data types.
{% highlight csharp %}
// currency and amount properties
var m = new Money<decimal>(100m, "aud");
Assert.AreEqual("AUD", m.Currency);
Assert.AreEqual(100m, m.Amount);

// USD and AUD are not the same
var usd = new Money<decimal>(100m, "USD");
var aud = new Money<decimal>(100m, "AUD");
Assert.AreNotEqual(usd, aud);

// unary operation on money
var intMoney = new Money<int>(41, "EUR");
intMoney++;
Assert.AreEqual(42, intMoney.Amount);
Assert.AreEqual("EUR", intMoney.Currency);

// binary operation with numbers
var money = new Money<decimal>(100m, "AUD");
var result = money - 58m;
Assert.AreEqual(42m, result.Amount);
result = 100.5m + result;
Assert.AreEqual(142.5m, result.Amount);
Assert.AreEqual("AUD", result.Currency);
{% endhighlight %}

## What if I have different currencies?
Well, that is the main purpose behind this project. 
Regardless of your currencies of the money objects, you can actually combine different
money objects together using binary operators (`+`, `-`, `*`, `/`, and `%` to be exact).
What you get back as a result is a `Wallet`. Let me show you what I mean.
{% highlight csharp %}
var m1 = Money<decimal>(100m, "AUD");
var m2 = Money<decimal>(-42m, "AUD");
var m3 = Money<decimal>(3.1415m, "USD");
var m4 = Money<decimal>(1m, "EUR");
var m5 = Money<decimal>(8m, "GBP");

var wallet1 = m1 + m2;
var wallet2 = wallet1 - m3;

// or if you are really insane
var crazyWallet = (m1 % m5) + ((m2 * 3.5m) / m4) - (m3 * 9m);
{% endhighlight %}

## Okay, what do I do with a wallet?
You get the result. There are two different ways to get result in two possible scenarios-

1. You have only combined money of same currency.
2. You have used money of different currencies.

The first case is pretty easy and simple. In this case, you know for sure that you will only be dealing with 
single currency. After combining money object into a wallet, you get the result as:
{% highlight csharp %}
var m1 = Money<decimal>(100m, "AUD");
var m2 = Money<decimal>(-42m, "AUD");
var wallet = m1 + m2; // or any other insane combination of any number of money objects
var resultingMoney = wallet.EvaluateWithoutConversion();
Assert.AreEqual(58m, resultingMoney.Amount);
Assert.AreEqual("AUD", resultingMoney.Currency);
{% endhighlight %}

Pretty straight forward. However, for the second case, the `Wallet` actually needs to know
how to convert between currencies. Now, this is a sacred knowledge I am ___NOT___ willing 
to put inside the `Wallet` implementation for countless reasons. Rather, I ask you to provide 
your own currency converter to do the conversion. Your currency converter has to implement
the interface `ICurrencyConverter<T>` available in the `Money` namespace. The generic type 
`T` here is actually the type you are using to represent money. As an example, if you are
using `decimal` (a pretty good choice for almost all real life scenarios) to represent
the amount in `Money`, then your currency converter should look something like:
{% highlight csharp %}
public class MyCurrencyConverter : ICurrencyConverter<decimal>
{
    // ... your constructor
    
    // ... other code and properties, if you need
    
    // the method of our interest 
    public decimal Convert(decimal fromAmount, string fromCurrency, string toCurrency)
    {
        // return the converted amount into decimal in this case
    }
    
    // ... other codes, if you have any
}
{% endhighlight %}

With the above implementation (I mean, when you actually implement it), you 
are now ready to do any multi-currency operation like:

{% highlight csharp %}
var m1 = Money<decimal>(100m, "AUD");
var m2 = Money<decimal>(-42m, "AUD");
var m3 = Money<decimal>(3.1415m, "USD");
var m4 = Money<decimal>(1m, "EUR");
var m5 = Money<decimal>(8m, "GBP");


var multinationalWallet = (m1 % m5) + ((m2 * 3.5m) / m4) - (m3 * 9m);
var currencyConverter = new MyCurrencyConverter();
var resultingMoneyInAUD = multinationalWallet.Evaluate(currencyConverter, "AUD");

var expectedAmount = I_AM_NOT_SURE_WHAT_THE_VALUE_IS_YOU_FIGURE_IT_OUT;
Assert.AreEqual(expectedAmount, resultingMoneyInAUD.Amount);
Assert.AreEqual("AUD", resultingMoneyInAUD.Currency);
{% endhighlight %}

## Will you provide a default currency converter with Money?
No.

## I cannot write my own converter, please help.
Okay. I have a plan to provide some currency converter utility classes in future 
which can be used with Money. They will basically consume online services 
for currency conversion available now a days. However, those classes are not 
any how related to this Money implementation and will never be. Having said that, 
you can easily use that currency conversion utility classes (that I will right in future)
with this Money implementation. 
I will even put some example code on how to do that. Once that is done,
I will publish the link here.

_Psst... if you have done it already and is available publicly, let me know 
if I can add a reference here._ 

## Anything else I should know about?
Yes. If you are cleverly thinking of using `EvaluateWithoutConversion` method of
a wallet with multiple currencies in it- so that you dont have to write a 
currency converter, I say good luck and go ahead.
You will be immediately greeted by `InvalidOperationException` with a nice and friendly message.

I assume you will be a good citizen and write (or, find) your currency converter
implementation and use it properly. Without even touching your code, I would like to
make it a bit more effecient. As most of the currency converter will be consuming online services,
they are likely to be slow. So, calling it to conver `10 USD -> AUD` and then again
`3 USD -> AUD` seems like a very bad choice. To eliminate this issue of your
currency converter (!), I have provided a magical wrapper class called `CachedCurrencyConverter`.
The way you use it is:
{% highlight csharp %}
public class MyCurrencyConverter : ICurrencyConverter<decimal>
{
    // ... your constructor
    
    // ... other code and properties, if you need
    
    // the method of our interest 
    public decimal Convert(decimal fromAmount, string fromCurrency, string toCurrency)
    {
        // return the converted amount into decimal in this case
    }
    
    // ... other codes, if you have any
}

// ... then somewhere in your code
var myConverter = new MyCurrencyConverter();
var cachedConverter = new CachedCurrencyConverter<decimal>(myConverter);

var resultingMoney = wallet.Evaluate(cachedConverter, "AUD");
{% endhighlight %}

It does not require you to write too much code, but improves the performace of 
your currency converter. Because, it queries for a currency pair (e.g. USD to AUD) only once
and remembers the conversion rate. Next time, it does not query for the same pair (regardless of the amount)
rather serves from memory.
Best thing about it, you don't even have to
think about any of these when you are writing your own currency converter.

## I don't like typing Money&lt;T&gt; all the time. What do I do?
Okay. If you have decided on a data type you will be using to 
represent the Money amount (and, it better be `decimal`),
here's is a nice trick you can do.

Inside your namespace declaration, type:
{% highlight csharp %}
using Money = Money<decimal>;
{% endhighlight %}

Then, you will be able to use it in a simplified form as:
{% highlight csharp %}
var m1 = new Money(42m, "USD");
var m2 = new Money(100m, "AUD");
// and so on...
{% endhighlight %}

## So far, cool. However, why don't you have XYZ feature?
Sorry, I didn't think about XYZ before. 
Please [create an issue](https://github.com/zpbappi/money/issues) 
in github with some description of the XYZ feature. 
Then we can continue discussion there and decide whether we can actually build it.

## You have a bug. How do I fix it?
Please [create an issue](https://github.com/zpbappi/money/issues) first.
If you are interested, you will probably be requested to create a pull request 
to fix the bug. Otherwise, one of contributors will fix that. Thank you in advance
for reporting it though.

## Summary
Once again, for your ease of access:

- [Money nuget package](https://www.nuget.org/packages/Multi-Currency-Money/) (called 'Multi currency money', as the name 'Money' was already taken by someone else)
- [Money source code](https://github.com/zpbappi/money)

That's all folks. Hopefully, you feel like creating your own forex business now.