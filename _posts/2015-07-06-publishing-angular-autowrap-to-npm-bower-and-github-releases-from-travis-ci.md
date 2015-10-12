---
title: Publishing Angular Autowrap to npm, bower and GitHub Releases from Travis-CI
author: Zp Bappi
layout: post
permalink: /publishing-angular-autowrap-to-npm-bower-and-github-releases-from-travis-ci/
categories:
  - Javascript
tags:
  - javascript
  - github
  - ci-cd
  - publish
  - travis-ci
---
> tl;dr > [read the code then](https://github.com/zpbappi/angular-autowrap/tree/master/_scripts).

[Angular Autowrap](https://github.com/zpbappi/angular-autowrap) is turning out to be a great learning experiment for me as I try to push boundaries of features available. But, first let me clarify what I tried to achieve. Well, all I wanted is-

  1. Run test every time I push to GitHub
  2. Make the build available to be consumed for end users

That was a pretty simple goal and should not be a problem using Travis-CI. All I had to do is run the tests in [script][3] block and configure the [deploy][4] part properly in .travis.yml which will handle the deployment by itself. It was too simple, really. But, then my expectations began to increase.

I realized that I wanted to have only the sources for Angular Autowrap library in the GitHub repository, but not the builds. Major reason behind that is, builds are composed from the sources using simple gulp tasks. With this decision, it becomes immediately impossible to publish to bower. Because, bower actually fetches contents from GitHub directly ([read more here][5]). As I did not have any build/usable version of the library in my repository, I cannot really use bower for publishing from the repository. That leaves, npm and GitHub releases.

Npm allows lot more flexibility to what gets in the released version (aka- package). Because, you actually need to do "[npm publish][6]" where you can configure almost anything using the package.json file. Note that, it is the same package.json file that you are using for developing the library itself. Well, if you look at the [package.json][7] file in the source repo, you will see that it contains devDependecies that are totally irrelevant to the published/released library. As I said, I was trying to push the things a bit further, so I wanted to have different (!) package.json for publishing to npm- which should be much cleaner than the one I need for development. It does not seem to be possible using Travis-CI "deploy" alone. There are also other concerns which I will come to later.

For GitHub releases, it is almost effortless. Including specific files for releases, custom condition to decide when to release, you can pretty much configure it all using only the .travis.yml. I think, just to make things complicated(!), I wanted the ability to override the custom condition too. That felt pretty exciting when I implemented that. But, now I really don't see the point, except for pure experimental interest. Anyway, that's the way I have done it and I will have to live with it (until I change it again).

So, finally my **requirement for publishing** became:

  1. Publish should be triggered whenever I push tags to GitHub. "Tag" should be a subset of Semver. I will only allow versions of the following formats:
      * X.Y.Z
      * X.Y.Z-(alpha \| beta \| rc)
      * X.Y.Z-(alpha \| beta \| rc).N
  2. Should publish to bower with library js, minified js (including sourcemaps to the unminified one), README and custom bower.json.
  3. Should publish to npm with library js, minified js (including sourcemaps), READ and custom package.json which reflects proper version.
  4. Should publish in GitHub Releases for each major release. Tags are already present in GitHub, so no action needed for tags that are not major release.
  5. Types of releases-
      * Pre-release: identified by tag of format "X.Y.Z-(alpla \| beta \| rc)" and "X.Y.Z-(alpha \| beta \| rc).N"
      * Major: identified by tag of format "X.0.0".
      * Minor: all other tags from the allowed subset of Semver. However, for a minor version, if there is a branch in GitHub repo named as "release-<version>", then that specific minor release should be treated as major release. This feature is to ensure the ability to publish a major version without changing the first-digit of version (i.e. major version) when needed.
  6. Publishing behavior for different type of releases-
      * A release should be published in GitHub Releases automatically for every major release. Although the release description can be changed later manually, if needed. All other release types will remain as tags GitHub.
      * Npm should treat all the release types same way. All releases will be published to npm.
      * Bower should treat all the release types same way. All releases will be available using bower.
  7. Js linting should be done first, as a part of automated testing.

Phew! Does not look so simple now. Well, from the requirement (read- desire), it is obvious that Travis-CI deploy cannot support all of these. But, here is how I solved it.

**Travis-CI**

Not using the "deploy" option. It is for much simpler use case. Instead using the "after_success" hook to run custom scripts. You can have a look at the [.travis.yml][8] that I am using. Also, make sure that you have configured GIT\_NAME, GIT\_EMAIL, GH\_TOKEN, NPM\_USER, NPM_PASSWORD, etc. environment variable in your travis-ci repository settings. I really don't like having them in config file, even as encrypted.

**Bower**

It is obvious that making the releases available in bower the way I want wasn't possible using a single repository. So, I have created another [repository][9] which will hold the bower publishing artifacts only. All I had to do is push the updated build to this repository from Travis-CI and along with a proper tag. That is not a difficult thing to do. Have look at the bower_publish() method of [common.sh][10] file in [_scripts/bower][11] directory. It uses couple of [utility][12] and [github][13] related functions.

**Npm**

Publishing to npm seemed simpler than bower. All I had to do is prepare a repository with the files and a proper package.json. Then, run "npm publish". Sounds too simple. Only then, I realized that to run "npm publish", you should run "npm adduser" first. And, this call to adduser is, unfortunately, interactive. That is, you cannot really pass-in your npm username and password with adduser command. You have to type it in. Now, where would I find an "interactive" user in automated CI environment? Then, having done the researches on npm cli, when I am about to write a wrapper around it, I fond out this small yet cool utility called [ci-npm-publish][14]. Only important thing it does is allow you to pass-in npm username and password in a programmatic way. That's all I needed. Rest is as simple as copying required files to a temporary directory, preparing the package.json and running the command to publish. You have a look at what I did in publish_npm() method of the [common.sh][15] file inside [_scripts/npm][16] directory.

**GitHub Releases**

The simplest one. Only action needed is for major releases. Use the [github releases api][17] to create one. Also, it would be better to add the published javascript files from build. I am working on adding external files currently and hope to be done very soon.

It was quite a nice experience making Travis-CI do things that it does not really do. I came to know about few things that I did not know about previously. In summary it was a pleasant learning experience. I do realize that the requirements specified above may not be realistic to some (or, all) of you. But, it was set to make things complicated and allow exploration of various other tools and scripting. I am documenting it so that I can help (even a little) to those who are trying to do things a bit "differently".

***P.S.*** While developing the build/publishing process, not only I learned few tricks in shell scripts but also realized that I don't really like it (no disrespect to those who are hurt). So, another TODO is to convert the shell scripts in [_scripts][1] folder into NodeJS (read- Javascript) as soon as I can.

 [1]: https://github.com/zpbappi/angular-autowrap/tree/master/_scripts
 [2]: https://github.com/zpbappi/angular-autowrap
 [3]: http://docs.travis-ci.com/user/customizing-the-build/#Customizing-the-Build-Step
 [4]: http://docs.travis-ci.com/user/deployment/
 [5]: http://bower.io/docs/creating-packages/#register
 [6]: https://docs.npmjs.com/cli/publish
 [7]: https://github.com/zpbappi/angular-autowrap/blob/master/package.json
 [8]: https://github.com/zpbappi/angular-autowrap/blob/master/.travis.yml
 [9]: https://github.com/zpbappi/angular-autowrap-bower
 [10]: https://github.com/zpbappi/angular-autowrap/blob/master/_scripts/bower/common.sh
 [11]: https://github.com/zpbappi/angular-autowrap/tree/master/_scripts/bower
 [12]: https://github.com/zpbappi/angular-autowrap/blob/master/_scripts/utility.sh
 [13]: https://github.com/zpbappi/angular-autowrap/blob/master/_scripts/github.sh
 [14]: https://www.npmjs.com/package/ci-npm-publish
 [15]: https://github.com/zpbappi/angular-autowrap/blob/master/_scripts/npm/common.sh
 [16]: https://github.com/zpbappi/angular-autowrap/tree/master/_scripts/npm
 [17]: https://developer.github.com/v3/repos/releases/
