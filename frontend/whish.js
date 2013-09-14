
// Hide/show hidden files in the 'ls' pane.
function toggle_hidden() {
    var s = document.getElementById('hidden').style;
    s.display = (s.display=='block'?'none':'block');
    var t = document.getElementById('toggle');
    t.value = (t.value=='v'?'^':'v');
}

// Show a preview of the clicked file.
function show_preview(path, size, mime){
    new Ajax.Updater('preview', '/preview', {
        parameters: { p: path, t: mime, s: size }
    });
}

// Borrowed from http://stackoverflow.com/a/1099670/10601
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
}

var cmd_history = [''];
var cmd_history_idx = 0;

// Run a command.
function cmd(event){
    var term_input = event.target.value;
    if (event.keyCode == 38) {
        // up arrow
        cmd_history_idx = Math.max(0, cmd_history_idx - 1);
        if (cmd_history_idx > 0) {
            event.target.value = cmd_history[cmd_history_idx];
        }
        return;
    } else if (event.keyCode == 40) {
        // down arrow
        cmd_history_idx = Math.min(cmd_history.length, cmd_history_idx + 1);
        if (cmd_history_idx < cmd_history.length) {
            event.target.value = cmd_history[cmd_history_idx];
        } else if (cmd_history_idx == cmd_history.length) {
            event.target.value = '';
        }
        return;
    }
    // Make sure we've pressed enter on a non-empty input.
    if (event.keyCode != 13 || term_input.length === 0) return;
    // Hack: Check to see if it's a `cd` command. We can handle that here.
    var parts = shellquote.parse(term_input);
    if (parts[0] === 'cd') {
        var dest = parts[1] || '.';
        if (dest[0] !== '/') {
            // Hacky sort of abspath.
            // The / handler normalizes though, so we're good.
            dest = getQueryParams(location.search).p + '/' + dest;
        }
        location.href = '/?p=' + encodeURIComponent(dest);
    } else {
        // Send the request.
        new Ajax.Updater('terminal', '/command', {
            parameters: { cmd: term_input, p: getQueryParams(location.search).p },
            insertion: 'bottom',
            onComplete: function() {
                var t = document.getElementById('terminal-container');
                // Scroll the terminal to the bottom.
                t.scrollTop = t.scrollHeight;
            }
        });
    }
    // Add to history and clear the prompt.
    cmd_history.push(term_input);
    cmd_history_idx = cmd_history.length;
    event.target.value = '';
}
