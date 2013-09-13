import os
import subprocess
from file_info import File


def ls(path):
  dotfiles = []
  regulars = []
  for fname in os.listdir(path):
    f = File(os.path.join(path,fname))
    if fname.startswith('.'):
      dotfiles.append(f)
    else:
      regulars.append(f)
  return regulars,dotfiles


def shell(cmd, cwd=None):
  # TODO: keep stdin and stdout separate, but stream both.
  p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE,
                       stderr=subprocess.STDOUT, bufsize=1, cwd=cwd)
  for line in iter(p.stdout.readline, b''):
    yield line
  p.communicate()  # close p.stdout, wait for the subprocess to exit
