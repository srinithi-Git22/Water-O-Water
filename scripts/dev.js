const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");

function run(name, file) {
  const child = spawn(process.execPath, [file], {
    cwd: root,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    console.log(name + " exited", code);
  });

  return child;
}

run(
  "api",
  path.join(root, "apps/api/src/server.js")
);