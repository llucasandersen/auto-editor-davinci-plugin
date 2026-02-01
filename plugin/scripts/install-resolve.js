import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.resolve(__dirname, "..");
const pluginFolderName = "com.autoeditor.workflowintegration";
const pluginName = "Auto-Editor";
const distDir = path.resolve(pluginDir, "dist", pluginFolderName);

const ensureDist = async () => {
  const stat = await fs.stat(distDir).catch(() => null);
  if (!stat) {
    throw new Error("dist output not found. Run npm run build first.");
  }
};

const resolveInstallRoot = () => {
  const programData = process.env.ProgramData || "C:\\ProgramData";
  return path.join(
    programData,
    "Blackmagic Design",
    "DaVinci Resolve",
    "Support",
    "Workflow Integration Plugins",
  );
};

const main = async () => {
  await ensureDist();
  const installRoot = resolveInstallRoot();
  const destination = path.join(installRoot, pluginFolderName);
  await fs.mkdir(installRoot, { recursive: true });
  await fs.rm(destination, { recursive: true, force: true });
  await fs.cp(distDir, destination, { recursive: true });
  console.log(
    `Restart Resolve \u2192 Workspace \u2192 Workflow Integrations \u2192 ${pluginName}`,
  );
};

main();
