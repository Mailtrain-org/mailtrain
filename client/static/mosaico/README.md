# Mosaico - Responsive Email Template Editor

Mosaico is a JavaScript library (or maybe a single page application) supporting the editing of email templates.
The great thing is that Mosaico itself does not define what you can edit or what styles you can change: this is defined by the template. This makes Mosaico very flexible.


![Mosaico Screenshot](res/img/screenshot.png)


At this time we provide a single "production ready" template to illustrate some best practice examples: more templates will come soon! Have a look at [Template Language](https://github.com/voidlabs/mosaico/wiki/Template-language) and get in touch with us if you want to make your email html template "Mosaico ready".

### Live demo

On https://mosaico.io you can see a live demo of Mosaico: the live deploy has a custom backend (you don't see it) and some customization (custom Moxiemanager integration for image editing, customized onboarding slideshow, contextual menu, and some other small bits), but 95% of what you see is provided by this opensource library. You will also see a second working template there (versafluid) that is not part of the opensource distribution.

#### News

Subscribe to our newsletter to get updates: https://mosaico.voxmail.it/user/register

### More Docs from the Wiki

[Mosaico Basics](https://github.com/voidlabs/mosaico/wiki)

[Developer Notes](https://github.com/voidlabs/mosaico/wiki/Developers)

### Build/Run with the development backend [![Build Status](https://travis-ci.org/voidlabs/mosaico.svg)](https://travis-ci.org/voidlabs/mosaico)

You need NodeJS v6.0 or higher + ImageMagick

Download/install the dependencies (run again if you get an error, as it probably is a race issues in npm)
```
  npm install
```
if you don't have it, install grunt-cli globally
```
  npm install -g grunt-cli
```
compile and run a local webserver (http://127.0.0.1:9006) with incremental build and livereload
```
  grunt
```
*IMPORTANT* in order to use image uploading/processing feature in Node you need imageMagick installed in your environment.
e.g. running "convert" and "identify" on the command line should output imageMagick command line help (if you are on Windows and install imageMagick 7.x then make sure to install ["legacy utilities"](https://github.com/aheckmann/gm/issues/559)).

*NOTE* we have reports that default Ubuntu node package have issues with building Mosaico via Grunt. If you see a ```Fatal error: watch ENOSPC``` then have a look at https://github.com/voidlabs/mosaico/issues/82

### Docker

We bundle a Dockerfile based on Alpine linux and another based on Centos 7 to test mosaico with no need to install dependencies.
```
docker build -t mosaico/mosaico .
docker run -p 9006:9006 mosaico/mosaico
```
then open a browser to point to the port 9006 of your docker machine IP.

### Deploying Mosaico via Apache PHP or Django or something else?

First you have to build it using grunt, then you MUST read [Serving Mosaico](https://github.com/voidlabs/mosaico/wiki/Serving-Mosaico).

### OpenSource projects including/using Mosaico

[MailTrain](https://github.com/Mailtrain-org/mailtrain) is a full featured newsletter web application written in Node and support email editing via Mosaico since their 1.23.0 release.

[GoodEnough's Mosaico](https://github.com/goodenough/mosaico-backend) born as a Mosaico fork, now have become a full web application product built around Mosaico editing targeting agencies.

### Are you having issues with Mosaico?

See the [CONTRIBUTING file](https://github.com/voidlabs/mosaico/blob/master/CONTRIBUTING.md)

### Contact Us

Please contact us if you have ideas, suggestions or, even better, you want to collaborate on this project ( feedback at mosaico.io ) or you need COMMERCIAL support ( sales at mosaico.io ) . Please DON'T write to this email to get free support: use Git issues for that, start the issue subject with "[help] " prefix, and write something to let us know you already read the CONTRIBUTING file.
