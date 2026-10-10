import { spawn, spawnSync } from "node:child_process";

process.env.NODE_ENV ??= "development";
process.env.PORT ??= "8787";

const build = spawnSync(process.execPath, ["./build.mjs"], {
  stdio: "inherit",
  env: process.env,
});

if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn(process.execPath, ["--enable-source-maps", "./dist/index.mjs"], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
