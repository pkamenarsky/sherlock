// http://stackoverflow.com/a/30503290/634020
function snapshot(obj) {
  if(obj == null || typeof(obj) != 'object') {
    return obj;
  }

  var temp = new obj.constructor();

  for(var key in obj) {
    if (obj.hasOwnProperty(key)) {
      temp[key] = snapshot(obj[key]);
    }
  }

  return temp;
}

// http://stackoverflow.com/a/25859853/634020
function evalInContext(js, context) {
  //# Return the results of the in-line anonymous function we .call with the passed context
  try {
    return { success: function() { with(context) { return eval(js) } }.call(context) };
  }
  catch(e) {
    return { error: e };
  }
}

function render(log, query) {
  var main = document.getElementById('main');
  var error = document.getElementById('error');
  var frag = document.createDocumentFragment();

  var islog  = function(e) { return e.log_data },
      maplog = function(e) { return { log_data: e} };

  var rerender = false;

  var log_;
  var result = query !== '' ? evalInContext(query, { $: log.map(function(e) {return snapshot(e);}).filter(islog).map(islog) }) : { error: '' };

  if (result.success) {
    log_ = result.success.map(maplog);
    error.textContent = '';
    rerender = true;
  }
  else {
    log_ = log;
    error.textContent = result.error;

    rerender = error !== '';
  }

  main.innerHTML = '';

  if (rerender) {
    log_.forEach(function(msg) {
      var item = document.createElement("div");
      item.className = 'item';

      if (msg.log_delimiter) {
        item.className = 'delimiter';
      }
      else {
        if (msg.log_data.log_level) {
          item.className = 'item ' + msg.log_data.log_level;
        }

        if (msg.log_data.log_color) {
          item.style.color = msg.log_data.log_color;
        }

        if (msg.log_data.log_type) {
            var kv = document.createElement("div");
            kv.className = 'kv log-type';
            item.appendChild(kv);

            var v = document.createElement("div");
            v.className = 'v';
            v.textContent = msg.log_data.log_type;
            kv.appendChild(v);
        }

        for (var key in msg.log_data) {
          if (key !== 'log_type'
              && key !== 'log_level'
              && key !== 'log_color'
              && msg.log_data.hasOwnProperty(key)) {
            var kv = document.createElement("div");
            kv.className = 'kv';
            item.appendChild(kv);

            var k = document.createElement("div");
            k.className = 'k';
            k.textContent = key;
            kv.appendChild(k);

            var v = document.createElement("div");
            v.className = 'v';
            v.textContent = msg.log_data[key];
            kv.appendChild(v);
          }
        }
      }

      frag.appendChild(item);
    });

    main.appendChild(frag);
  }
}

function main() {
  var s = new WebSocket("ws://localhost:1667");

  var id = 0;
  var log = [];
  var query = '';

  s.onopen = function() {
  };

  s.onmessage = function(msg) {
    var data = JSON.parse(msg.data);
    log.unshift({log_id: id++, log_data: data});
    render(log, query);
  };

  s.onerror = function(msg) {
  };

  window.onkeyup = function(e) {
    var queryElement = document.getElementById("query");
    var key = e.keyCode ? e.keyCode : e.which;

    if (e.target == queryElement) {
      if (queryElement.value !== query) {
        query = queryElement.value;
        render(log, query);
      }

      return;
    }

    // h
    if (key == 72) {
      if (!log[0] || (log[0] && !log[0].log_delimiter)) {
        log.unshift({log_id: id++, log_delimiter: true });
        render(log, query);
      }
    }
    // l
    else if (key == 76) {
      console.log(JSON.stringify(log));
    }
    // w
    else if (key == 87) {
      localStorage.setItem('log', JSON.stringify(log));
    }
    // e
    else if (key == 69) {
      try {
        log = JSON.parse(localStorage.getItem('log'));
      }
      catch(e) {
        console.log(e);
      }
      render(log, query);
    }
  }
}
