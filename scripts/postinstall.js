const fs = require('fs');
const path = require('path');

// 1. Ensure spawn-helper on macOS has executable permissions
if (process.platform === 'darwin') {
  const darwinDirs = ['darwin-arm64', 'darwin-x64'];
  for (const dir of darwinDirs) {
    const helperPath = path.join(__dirname, '..', 'node_modules', 'node-pty', 'prebuilds', dir, 'spawn-helper');
    try {
      if (fs.existsSync(helperPath)) {
        fs.chmodSync(helperPath, 0o755);
      }
    } catch (err) {
      // Ignore permission errors if not writable
    }
  }
}

// 2. Patch node-pty conpty_console_list_agent to prevent "AttachConsole failed" crash on Windows
function patchNodePtyAgent() {
  const libAgentPath = path.join(__dirname, '..', 'node_modules', 'node-pty', 'lib', 'conpty_console_list_agent.js');
  if (fs.existsSync(libAgentPath)) {
    try {
      let content = fs.readFileSync(libAgentPath, 'utf8');
      if (!content.includes('catch')) {
        content = content.replace(
          /var\s+consoleProcessList\s*=\s*getConsoleProcessList\(shellPid\);\s*process\.send\(\{\s*consoleProcessList:\s*consoleProcessList\s*\}\);/,
          'var consoleProcessList;\ntry {\n  consoleProcessList = getConsoleProcessList(shellPid);\n} catch (e) {\n  consoleProcessList = [shellPid];\n}\nif (process.send) {\n  process.send({ consoleProcessList: consoleProcessList });\n}'
        );
        fs.writeFileSync(libAgentPath, content, 'utf8');
      }
    } catch (err) {
      console.warn('Warning: Could not patch node-pty lib agent:', err.message);
    }
  }

  const srcAgentPath = path.join(__dirname, '..', 'node_modules', 'node-pty', 'src', 'conpty_console_list_agent.ts');
  if (fs.existsSync(srcAgentPath)) {
    try {
      let content = fs.readFileSync(srcAgentPath, 'utf8');
      if (!content.includes('catch')) {
        content = content.replace(
          /const\s+consoleProcessList\s*=\s*getConsoleProcessList\(shellPid\);\s*process\.send!\(\{\s*consoleProcessList\s*\}\);/,
          'let consoleProcessList: number[];\ntry {\n  consoleProcessList = getConsoleProcessList(shellPid);\n} catch (e) {\n  consoleProcessList = [shellPid];\n}\nif (process.send) {\n  process.send({ consoleProcessList });\n}'
        );
        fs.writeFileSync(srcAgentPath, content, 'utf8');
      }
    } catch (err) {
      console.warn('Warning: Could not patch node-pty src agent:', err.message);
    }
  }
}

patchNodePtyAgent();
