import os
import pwd
from datetime import datetime
from magic import Magic
from tornado.escape import url_escape

type_magic = Magic(mime=True)

colors = {
    'symlink': 'pink',
    'directory': 'cyan',
    'executable': 'red',
    'regular': 'white',
}


class File(object):
  """Convenient wrapper for information about files"""
  def __init__(self,path):
    self.full_path = os.path.abspath(path)
    self._mimetype = None  # computed on the fly

  def name(self):
    return os.path.basename(self.full_path)

  def type(self):
    if self._mimetype is None:
      self._mimetype = type_magic.from_file(self.full_path)
    return self._mimetype

  def color(self):
    if os.path.islink(self.full_path):
      return colors['symlink']
    elif os.path.isdir(self.full_path):
      return colors['directory']
    elif os.access(self.full_path, os.X_OK):
      return colors['executable']
    else:
      return colors['regular']

  def size(self,pretty=False):
    nbytes = os.path.getsize(self.full_path)
    if not pretty:
      return nbytes
    for scale in ['','K','M','G','T','P']:
      if nbytes < 1024.0:
        return "%3.1f%sB" % (nbytes, scale)
      nbytes /= 1024.0

  def mtime(self,pretty=False):
    mtime = datetime.fromtimestamp(os.path.getmtime(self.full_path))
    if not pretty:
      return mtime
    now = datetime.now()
    if mtime.year != now.year:
      return mtime.strftime("%b %d, %Y")
    return mtime.strftime("%b %d %I:%M %p")

  def owners(self):
    stat = os.stat(self.full_path)
    owners = [stat.st_uid, stat.st_gid]
    for i in xrange(len(owners)):
      try:
        owners[i] = pwd.getpwuid(owners[i]).pw_name
      except KeyError:
        pass
    return owners

  def info(self):
    owner, group = self.owners()
    size = self.size(True)
    mtime = self.mtime(True).replace(' ', '&nbsp;')
    return "%s<br>%s<br>%s:%s" % (mtime, size, owner, group)

  def link(self):
    if os.path.isdir(self.full_path):
      return '<a href="/?p=%s" class="dirlink">%s</a>' % (
          url_escape(self.full_path), self.name() + '/')
    onclick = "show_preview('%s',%d,'%s')" % (self.full_path, self.size(),
                                              self.type())
    return '<a onclick="%s">%s</a>' % (onclick, self.name())
