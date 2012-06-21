Unobtrusive scripting adapter for jqMobi
========================================

This is a port of [jquery-ujs][jquery-ujs] to [jqMobi][jqmobi].

This unobtrusive scripting support file is developed for the Ruby on Rails framework, but is not strictly tied to any specific backend. You can drop this into any application to:

- force confirmation dialogs for various actions;
- make non-GET requests from hyperlinks;
- make forms or hyperlinks submit data asynchronously with Ajax;
- have submit buttons become automatically disabled on form submit to prevent double-clicking.

Requirements
------------

- [jqMobi 1.0][jqmobi] or later;

Installation
------------

For automated installation in Rails, use the "jqmobi-rails" gem. Place this in your Gemfile:

```ruby
gem 'jqmobi-rails', :git => 'git://github.com/mshibuya/jqmobi-rails.git'
```

And run:

    $ bundle install

Add these lines to the top of your app/assets/javascripts/application.js file:

```javascript
//= require jq.mobi
//= require jq.mobi_ujs
```

[jquery-ujs]: https://github.com/rails/jquery-ujs
[jqmobi]: http://www.jqmobi.com/
