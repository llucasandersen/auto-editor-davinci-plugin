import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.resolve(__dirname, "..");
const distDir = path.resolve(pluginDir, "dist", "com.autoeditor.workflowintegration");
const outputZip = path.resolve(pluginDir, "dist", "auto-editor-workflow-plugin.zip");

const run = (command) => {
  execSync(command, { stdio: "inherit", cwd: pluginDir });
};

const ensureDist = async () => {
  const stat = await fs.stat(distDir).catch(() => null);
  if (!stat) {
    throw new Error("dist output not found. Run npm run build first.");
  }
};

const main = async () => {
  await ensureDist();

  if (process.platform === "win32") {
    const psCommand = `powershell -Command "Compress-Archive -Path '${distDir}' -DestinationPath '${outputZip}' -Force"`;
    run(psCommand);
    return;
  }

  run(`zip -r '${outputZip}' '${distDir}'`);
};

main();
