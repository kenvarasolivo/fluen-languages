// Runs `next dev` and opens the browser at the Local URL once the server is
// ready. Parses Next's own startup output so it uses whatever port it lands
// on (e.g. 3001 if 3000 is taken). Cross-platform, no extra dependencies.
import { spawn } from "node:child_process";

const child = spawn("next", ["dev", ...process.argv.slice(2)], {
  stdio: ["inherit", "pipe", "inherit"],
  shell: true,
});

let opened = false;

function open(url) {
  if (opened) return;
  opened = true;
  const cmd =
    process.platform === "win32"
      ? "start"
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";
  // On Windows `start` needs an (empty) title argument first.
  const args = process.platform === "win32" ? ["", url] : [url];
  spawn(cmd, args, { stdio: "ignore", shell: true, detached: true }).unref();
}

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  const match = text.match(/Local:\s+(http:\/\/\S+)/);
  if (match) open(match[1]);
});

child.on("exit", (code) => process.exit(code ?? 0));
