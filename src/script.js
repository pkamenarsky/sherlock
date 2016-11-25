function render(log) {
  var main = document.getElementById('main');
  var frag = document.createDocumentFragment();

  log.forEach(function(msg) {
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

  main.innerHTML = '';
  main.appendChild(frag);
}

function main() {
  var s = new WebSocket("ws://localhost:1667");

  var id = 0;
  var log = [];

  s.onopen = function() {
  };

  s.onmessage = function(msg) {
    var data = JSON.parse(msg.data);
    log.unshift({log_id: id++, log_data: data});
    render(log);
  };

  s.onerror = function(msg) {
  };

  window.onkeyup = function(e) {
     var key = e.keyCode ? e.keyCode : e.which;

     // h
     if (key == 72) {
       if (!log[0] || (log[0] && !log[0].log_delimiter)) {
         log.unshift({log_id: id++, log_delimiter: true});
         render(log);
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
       }
       render(log);
     }
  }
}
