---
title: Testing codes with ConfigurationManager.AppSettings
author: Zp Bappi
layout: post
permalink: /testing-codes-with-configurationmanager-appsettings/
categories:
  - 'C#'
tags:
  - appsettings
  - csharp
  - configuration
  - di
  - unit-test
---
When developing an ASP .NET MVC or WebAPI based application, we eventually need to read configurations from `<appSettings>` section of Web.Config file. Here is an example entry from my imaginary project:

{% highlight xml %}
<configuration>
  <!-- other config sections -->

  <appSettings>
    <add key="app.name" value="My Application" />
    <add key="app.domain" value="mydomain.com" />
    <add key="encryption.algorithm" value="TripleDES" />
    <add key="encryption.key" value="MY_KEY" />
    <add key="encryption.vector" value="MY_VECTOR" />
    <!-- other entries -->
  </appSettings>

  <!-- other config sections -->
</configuration>
{% endhighlight %}

If we need to get a specific settings value, easiest way to get this:

{% highlight csharp %}
var encryptionAlgorithm = ConfigurationManager.AppSettings["encryption.algorithm"];
{% endhighlight %}

This is pretty fine. However, it does make your code difficult to unit test. Because, when you are running tests, `ConfigurationManager.AppSettings` may not behave the way it behaves in your web application. So, your tests may eventually fail even if there is nothing wrong with you business logic.

To make codes testable, I prefer having a service/provider for `AppSettings`. This is injected as a dependency wherever I need it. Here is the simple wrapper:

{% highlight csharp %}
using System.Collections.Specialized;
using System.Configuration;

public interface IAppSettings
{
    string this[string key] { get; }
}

public class AppSettingsWrapper : IAppSettings
{
    private readonly NameValueCollection appSettings;

    public AppSettingsWrapper()
    {
        this.appSettings = ConfigurationManager.AppSettings;
    }
    public string this[string key]
    {
        get
        {
            return this.appSettings[key];
        }
    }
}
{% endhighlight %}

Also, it would be better to configure this wrapper as a singleton or single instance in your DI container.

Now, you can easily mock this `IAppSettings` and run your tests without worrying about `ConfigurationManager`.

Here is a sample test written using MSpec and NSubstitute:

{% highlight csharp %}
[Subject(typeof(MyService))]
public class MyServiceTests
{
    Establish context = () =>
        {
            otherDependency = Substitute.For<IMyOtherDependency>();

            var appSettings = Substitute.For<IAppSettings>();
            appSettings["app.name"].Returns("My Test Applicatin");

            myService = new MyService(otherDependency, appSettings);
        };

    Because of = () => result = myService.PerformOperations();

    It should_call_my_dependency_utility_method_once = () => otherDependency.Received(1).UtilityMethod();

    It should_execute_successfully = () => result.ShouldBeTrue();


    private static IMyService myService;
    private static IMyOtherDependency otherDependency;
    private static bool result;
}
{% endhighlight %}
<br>
Happy testing. :)
