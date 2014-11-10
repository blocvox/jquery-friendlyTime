jQuery.friendlyTime
===================

A relative time jQuery plugin that transforms cold-hearted websites into warm, fuzzy ones.

## Quick Start

Use jQuery.friendlyTime to render timestamps as relative text snippets that update periodically.

```html
<span class="date" date-time="2014-11-09T06:53:39Z"></span>
  
<script type="text/javascript">
  $('.date').friendlyTime();
</script>
```
  
This will cause `.date` to have content along the lines of "12 Minutes Ago", which by default will update every 60 seconds. The element will also have a `title` attribute containing the result of `timestamp.toUTCString()` (typically in RFC-1123 format).

## Installation

Old school, in the document `head`:

```html
<head>
  <script src="jQuery.js"></script>
  <script src="jQuery.friendlyTime.js"></script>
</head>
```

New school with an AMD loader such as RequireJS, in some module script:

```js
define(
  [ 'jquery', 'jquery.friendlyTime' ],
  function($) {
    // use $.friendlyTime
  }
);
```

jQuery.friendlyTime has AMD support so it can be referenced by relative pathname like any other AMD module.

## Usage

`$(selector).friendlyTime(opts)` where `opts` is an optional Object argument.

The selected elements must have a `data-time` attribute containing a timestamp in ISO8601 format. The plugin is idempotent; you can repeatedly initialize (or terminate with `stopUpdates`) the same elements without ill effect. Textual content is rendered in title case, which can easily be overridden in CSS for lower- or uppercase.

`opts` can contain any of the following:

<table>
<tr><td><code>skipInit:Boolean</code></td><td>Skips the initial population of content. Normally, the elements will have empty contents and when jQuery.friendlyTime initializes them, content flashes into place. This creates an experience analogous to <a href="http://en.wikipedia.org/wiki/Flash_of_unstyled_content">FOUC</a>. Rather, the server can pre-render equivalent content (functionality not included, but it's easy enough to replicate from this source) and then specify <code>skipInit: true</code> to avoid some initial processing.</td></tr>
<tr><td><code>stopUpdates:Boolean</code></td><td>Removes the elements from the set being periodically updated. Idempotent.</td></tr>
<tr><td><code>nowWindow:Number</code></td><td>The number of seconds before and after the specified timestamp defining the window that qualifies as "Just Now". This accounts for the offset between server and client time. For example, a user might submit a comment at local time 11:00:00, server time 11:00:05. Given a low-latency round-trip, the server might respond with an HTML rendering of the comment timestamp in the future with respect to the client. In this case, a <code>nowWindow</code> of 5 would resolve the issue.</td></tr>
<tr><td><code>suppressFuture:Boolean</code></td><td>Indicates if future timestamps should collapse into "Just Now". This is another way of resolving the issue described in <code>nowWindow</code>. The advantage in this case is that 1-second resolution remains intact for very recent (sub-minute) timestamps.</td></tr>
</table>

The property `$.fn.friendlyTime.DURATION` can be set to a Number to indicate the number of milliseconds between updates. Defaults to 60000.
