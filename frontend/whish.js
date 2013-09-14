
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

// Hack: get current directory listing by scraping the DOM.
function list_dir() {
    var listing = [];
    var links = document.getElementById('ls').getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        listing.push(links[i].textContent);
    }
    return listing;
}

// use the awesome greedy regex hack, from http://stackoverflow.com/a/1922153/10601
function longestCommmonPrefix(lst) {
    return lst.join(' ').match(/^(\S*)\S*(?: \1\S*)*$/i)[1];
}

function tabComplete(text, cursor_pos) {
    var parts = shellquote.parse(text);
    var current_part = parts[parts.length-1];
    // TODO: find the current_part based on cursor_pos.
    if (cursor_pos != text.length) {
        console.warn('Mid-text tabcomplete is NYI.');
    }
    console.log(current_part);
    var completions = [];
    var ls = list_dir();
    for (var i = 0; i < ls.length; i++) {
        var name = ls[i];
        if (name.indexOf(current_part) === 0) {
            completions.push(name);
        }
    }
    console.log(completions);
    // prefix includes current_part
    var prefix = longestCommmonPrefix(completions);
    console.log(prefix);
    if (prefix === '' || prefix === current_part) {
        // We've no more sure completions to give, so show them all.
        autocomplete_showing = true;
        document.getElementById('autocomplete-container').style.display = 'table-row';
        var autocomplete_display = document.getElementById('autocomplete-options');
        autocomplete_display.innerHTML = '';
        for (i = 0; i < completions.length; i++) {
            autocomplete_display.innerHTML += completions[i] + ' ';
        }
        return text;
    }
    // Delete existing text so we can do case correction.
    return text.substr(0, text.length -  current_part.length) + prefix;
}

var cmd_history = [''];
var cmd_history_idx = 0;
var autocomplete_showing = false;

// Run a command.
function cmd(event){
    // Hides the autocomplete on every keystroke.
    // TODO: This is a little overzealous, I think. Needs work.
    if (autocomplete_showing) {
        document.getElementById('autocomplete-container').style.display = 'none';
        autocomplete_showing = false;
    }
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
    } else if (event.keyCode == 9) {
        // tab
        event.target.value = tabComplete(term_input, event.target.selectionStart);
        event.preventDefault();
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
