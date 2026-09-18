import * as pty from 'node-pty';
import * as os from 'os';
import type { TerminalSize } from './types.js';

export function getDefaultShell(): string {
  if (os.platform() === 'win32') {
    // If SHELL is set to a Windows path or executable name, use it;
    // avoid POSIX paths like /bin/bash that Git Bash exports into the Windows environment.
    if (process.env.SHELL && !process.env.SHELL.startsWith('/')) {
      return process.env.SHELL;
    }
    return process.env.COMSPEC ? 'powershell.exe' : 'cmd.exe';
  }
  return process.env.SHELL || '/bin/bash';
}

export class PTYManager {
  private ptyProcess: pty.IPty | null = null;

  spawn(onData: (data: string) => void, onExit: (code: number) => void): void {
    // Detect user's shell
    const shell = getDefaultShell();

    // Get user's home directory
    const cwd = process.env.HOME || process.env.USERPROFILE || os.homedir();

    console.log(`Spawning terminal: ${shell} in ${cwd}`);

    // Spawn PTY with user's shell
    this.ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
      cwd,
      env: process.env as { [key: string]: string },
    });

    // Handle data from PTY
    this.ptyProcess.onData((data) => {
      onData(data);
    });

    // Handle PTY exit
    this.ptyProcess.onExit(({ exitCode }) => {
      console.log(`Terminal exited with code: ${exitCode}`);
      this.ptyProcess = null;
      onExit(exitCode);
    });
  }

  write(data: string): void {
    if (this.ptyProcess) {
      try {
        this.ptyProcess.write(data);
      } catch (err) {
        console.warn('Error writing to PTY process:', err);
      }
    }
  }

  resize(size: TerminalSize): void {
    if (this.ptyProcess) {
      try {
        this.ptyProcess.resize(size.cols, size.rows);
      } catch (err) {
        console.warn('Error resizing PTY process:', err);
      }
    }
  }

  kill(): void {
    if (this.ptyProcess) {
      try {
        this.ptyProcess.kill();
      } catch (err) {
        console.warn('Error killing PTY process:', err);
      } finally {
        this.ptyProcess = null;
      }
    }
  }
}
