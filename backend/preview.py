import os
import os.path
from tornado.escape import xhtml_escape
from pygments import highlight, util as pyg_util
from pygments.lexers import get_lexer_for_filename
from pygments.formatters import HtmlFormatter


def preview(path, filesize, mimetype):
  major,minor = mimetype.split('/',1)
  if major not in mime_handlers:
    return mime_handlers['*'](path, filesize, mimetype)
  handlers = mime_handlers[major]
  if minor not in handlers:
    return handlers['*'](path, filesize, mimetype)
  return handlers[minor](path, filesize, mimetype)


def preview_plain_text(path, filesize, mimetype):
  with open(path) as fh:
    try:  # attempt to syntax highlight
      lexer = get_lexer_for_filename(path)
      formatter = HtmlFormatter(linenos=True, cssclass="source")
      yield '<style type="text/css">'
      yield formatter.get_style_defs()
      yield '</style>'
      yield highlight(''.join(fh),lexer,formatter)
    except pyg_util.ClassNotFound:
      #TODO: buffer this, use async
      # http://www.tornadoweb.org/documentation/ioloop.html
      for line in fh:
        yield xhtml_escape(line)


def preview_image(path, filesize, mimetype):
  name = os.path.basename(path)
  tmp_img = os.path.join(os.path.dirname(__file__), '../frontend/img_links', name)
  if not os.path.lexists(tmp_img):  # lol hax
    os.symlink(path,tmp_img)
  yield '<img src="/static/img_links/%s"></img>'%name


def preview_pdf(path, filesize, mimetype):
  name = os.path.basename(path)
  yield 'PDF file: %s' % name
  yield 'TODO: inline PDF viewer'


def preview_binary(path, filesize, mimetype):
  name = os.path.basename(path)
  yield 'Binary file: %s (%s), %d bytes' % (name,mimetype,filesize)

# Map of mime types to handler functions. Dispatched on by preview().
mime_handlers = {
    'text': {
        '*': preview_plain_text,
    },
    'image': {
        '*': preview_image,
    },
    'application': {
        'pdf': preview_pdf,
        '*': preview_binary,
    },
    '*': preview_binary,
}
