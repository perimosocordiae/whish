# whish

The Web-Human Interface SHell:
Bringing the discoverability and interactivity of web content to your shell.

## Getting Started

  1. Install Python 2.7 (version 2.6 is ok).
  2. Install the required Python libraries:
     `pip install python-magic tornado pygments jupyter`
  3. Run the server: `python server.py`

## Features / TODO

*Bold items are completed, other items are TODOs.*

 - **click on directories, change page**
 - **allow page change by url (with back history)**
 - **hide/show dotfiles**
 - **link the title for easy nav**
 - **click on files, preview contents in lower pane**
  - **syntax highlighting**
  - **inline images**
  - **fail cleanly on binary data**
  - support Unicode
  - support inline PDFs
 - incorporate a shell
  - **run simple shell commands**
  - **keep command history**
   - make it viewable and clickable
  - syntax-highlight commands in the prompt
  - persist history/scrollback across directory changes!
 - make options editable and pervasive
 - make the styling easier on the eyes
  - **"Options" link**
  - hide preview box when not in use?
  - all the other visual horribleness
