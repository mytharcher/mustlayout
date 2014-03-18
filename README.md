MustLayout
==========

[简体中文](http://mytharcher.github.io/posts/npm-mustlayout.html)

This package is for express.js 3.0+ users who want to use layout and partial in mustache based ([mustache](http://mustache.github.io/), [hogan](https://github.com/twitter/hogan.js), [handlebars](http://handlebarsjs.com/)) template engines, with only a really simple configuration.

A few features:

* Same usage to render template in your controller as before.
* Never need to manage partial and layout variable when render.
* Compatible for all mustache based template engines.

Installation
------------

    $ npm install --save mustlayout

Usage
-----

In your express application main file `app.js`:

```javascript
var express = require('express');

var app = express();

require('mustlayout').engine(app, {
    engine: require('hogan'),
    ext: '.tpl',
    views: '/views',
    partials: '/views/partials', // optional, default to '/views'
    layouts: '/views/layouts', // optional, default to '/views'
    cache: '/views/cache' // optional, default to '/views/cache'
});

app.get('/', function (req, res, next) {
    res.render('index');
});

app.listen(6060);
```

By using MustLayout, you never need to write the native view engine configuration of express.

For more infomation just look into the example folder.

### Syntax ###

MustLayout use handlebars' syntax `{{!<layoutName}}` for layout definition in a template file. Ordinarily, you should place this line at the beginning of your template file.

Then use `{{:blockName}}...{{/blockName}}` to define a extensible layout block like in Smarty.

An example for template `index.tpl` which extended layout `page.tpl`:

    {{!<page}}
    {{:header}}
    <h1>My Title</h1>
    {{/header}}

    {{:body}}
    ...
    {{/body}}

And in layout `page.tpl`:

    <!DOCTYPE html>
    <html>
    <head>
    <title>MustLayout</title>
    </head>
    <body>
    <div id="header">
    {{:header}}Just Header{{/header}}
    </div>
    <div id="main">
    {{:body}}Nothing{{/body}}
    </div>
    {{> footer }}
    </body>
    </html>

After you invoke `res.render('index')` in a controller, you will get this in browser:

    <!DOCTYPE html>
    <html>
    <head>
    <title>MustLayout</title>
    </head>
    <body>
    <div id="header">
    <h1>My Title</h1>
    </div>
    <div id="main">
    ...
    </div>
    <!-- something in footer.tpl -->
    </body>
    </html>

### cache ###

MustLayout build all your templates to a target cache folder (`cache` for default) in `/views`. So you must make sure that `/views` should be writable for everyone:

    $ chmod 777 views/

And by building, layout and partial syntax will be pre-compiled into common mustache based templates in that folder before server starting. You should never worried about the performance of rendering layouts, because it only depends on what mustache engine you are using.

Troubleshooting
---------------

0. Gmail me: mytharcher
0. Write a [issue](https://github.com/mytharcher/mustlayout/issues)
0. Send your pull request to me.

## MIT Licensed ##

-EOF-
