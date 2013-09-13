#!/usr/bin/env python

'''
Usage: ./server.py - Serves localhost:8888
'''

import os
import os.path
import tornado.ioloop
import tornado.web

from backend.file_info import File
from backend.preview import preview
from backend.commands import ls, shell

options = {
    'max_filesize_for_preview': (525000, int),  # ~0.5 MB
}


def set_option(key, value, func=lambda x: x):
  options[key] = func(value)


class MainHandler(tornado.web.RequestHandler):
  def get(self):
    path = os.path.expanduser(self.get_argument('p',default='~'))
    files,hidden = ls(path)
    parts = filter(None,path.split('/'))
    cwd_parts = [File('/'+'/'.join(parts[:i])) for i in xrange(len(parts)+1)]
    values = {
        'files': files,
        'hidden': hidden,
        'cwd': path,
        'cwd_parts': cwd_parts,
    }
    self.render('index.html', **values)


class PreviewHandler(tornado.web.RequestHandler):
  def post(self):
    path = os.path.expanduser(self.get_argument('p',default='~'))
    fsize = int(self.get_argument('s', default=0))
    mime = self.get_argument('t')
    max_bytes = options['max_filesize_for_preview']
    total_bytes = 0
    for line in preview(path,fsize,mime):
      self.write(line)
      total_bytes += len(line)
      if total_bytes >= max_bytes:
        break


class OptionHandler(tornado.web.RequestHandler):
  def post(self):
    for key, (value, func) in options.iteritems():
      new_value = self.get_argument(key, default=None)
      if new_value is not None:
        set_option(key, new_value, func)

  def get(self):
    # TODO: make this editable
    for key, (value, _) in options.iteritems():
      self.write("%s: %s" % (key, value))


class CommandHandler(tornado.web.RequestHandler):
  def post(self):
    path = os.path.expanduser(self.get_argument('p',default='~'))
    cmd = self.get_argument('cmd')
    for line in shell(cmd, cwd=path):
      self.write(line)


def run(port):
  static = os.path.join(os.path.dirname(__file__), 'frontend')
  app = tornado.web.Application([
      (r"/", MainHandler),
      (r"/preview", PreviewHandler),
      (r"/options", OptionHandler),
      (r"/command", CommandHandler),
  ], static_path=static)
  app.listen(port)
  print "listening at http://localhost:%d/" % port


if __name__ == "__main__":
  run(8888)
  try:
    tornado.ioloop.IOLoop.instance().start()
  except:
    # Remove the symlinks we created before exiting.
    img_links = os.path.join(os.path.dirname(__file__), 'frontend/img_links')
    for f in os.listdir(img_links):
      os.unlink(os.path.join(img_links, f))
