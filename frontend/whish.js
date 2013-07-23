
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

var cmd_history = [''];
var cmd_history_idx = 0;

// Run a command.
function cmd(event){
    var term_input = event.target;
    if (event.keyCode == 38) {
        // up arrow
        cmd_history_idx = Math.max(0, cmd_history_idx - 1);
        if (cmd_history_idx > 0) {
            term_input.value = cmd_history[cmd_history_idx];
        }
        return;
    } else if (event.keyCode == 40) {
        // down arrow
        cmd_history_idx = Math.min(cmd_history.length, cmd_history_idx + 1);
        if (cmd_history_idx < cmd_history.length) {
            term_input.value = cmd_history[cmd_history_idx];
        } else if (cmd_history_idx == cmd_history.length) {
            term_input.value = '';
        }
        return;
    }
    // Make sure we've pressed enter on a non-empty input.
    if (event.keyCode != 13 || term_input.value.length === 0) return;
    // Send the request.
    new Ajax.Updater('terminal', '/command', {
        parameters: { cmd: term_input.value },
        insertion: 'bottom',
        onComplete: function() {
            var t = document.getElementById('terminal');
            // Scroll the terminal to the bottom.
            t.scrollTop = t.scrollHeight;
        }
    });
    // Add to history and clear the prompt.
    cmd_history.push(term_input.value);
    cmd_history_idx = cmd_history.length;
    term_input.value = '';
}
