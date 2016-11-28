# Sherlock

Sherlock connects to your server/application on port 1667 and listens for
raw JSON messages, which it then displays.

![](https://github.com/pkamenarsky/sherlock/raw/master/demo.gif)

## JSON structure

    { log_type: ...        // displayed in the left-most column
    , log_level: 'warning'
               | 'error'
               | 'info'
    , log_color: '#aabbcc' // custom color
    , ...                  // additional fields are displayed unaltered
    }

## Filtering

`$` is bound to the message array. To filter all messages with `log_level === 'error'`:

    $.filter(function(e) { return e.log_level === 'error' })

## Keys

* `h` - insert a horizontal ruler.
* `l` - dump all messages to console
* `w` - save messages to local storage
* `e` - load messages from local storage
