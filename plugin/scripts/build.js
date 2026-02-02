import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(pluginDir, "src");
const pluginFolderName = "com.autoeditor.workflowintegration";
const pluginName = "Auto-Editor";
const pluginVersion = "1.0.0";
const pluginDescription = "Auto-Editor Workflow Integration plugin for DaVinci Resolve Studio.";
const distDir = path.resolve(pluginDir, "dist", pluginFolderName);

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const copyFile = async (source, destination) => {
  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
};

const copyTree = async (sourceDir, destinationDir) => {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await ensureDir(destinationDir);

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    if (entry.isDirectory()) {
      await copyTree(sourcePath, destinationPath);
    } else {
      await copyFile(sourcePath, destinationPath);
    }
  }
};

const cleanDist = async () => {
  await fs.rm(distDir, { recursive: true, force: true });
  await ensureDir(distDir);
};

const writeManifest = async () => {
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<BlackmagicDesign>
  <Plugin>
    <Id>${pluginFolderName}</Id>
    <Name>${pluginName}</Name>
    <Version>${pluginVersion}</Version>
    <Description>${pluginDescription}</Description>
    <FilePath>main.js</FilePath>
  </Plugin>
</BlackmagicDesign>
`;
  await fs.writeFile(path.join(distDir, "manifest.xml"), manifest, "utf8");
};

const writePackageJson = async () => {
  const packageJson = {
    name: pluginName,
    version: pluginVersion,
    description: pluginDescription,
    main: "main.js",
  };
  await fs.writeFile(
    path.join(distDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
    "utf8",
  );
};

const main = async () => {
  await cleanDist();
  await copyTree(srcDir, distDir);
  await writeManifest();
  await writePackageJson();
};

main();
