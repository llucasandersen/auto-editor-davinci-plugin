import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const pluginDir = path.resolve(rootDir, "plugin");
const srcDir = path.resolve(pluginDir, "src");
const distDir = path.resolve(pluginDir, "dist", "com.autoeditor.workflowintegration");

const sdkSampleDir = process.env.RESOLVE_SDK_SAMPLE_DIR || "";
const sdkDir = process.env.RESOLVE_SDK_DIR || "";

const excludedExtensions = new Set([
  ".a",
  ".dylib",
  ".dll",
  ".lib",
  ".so",
  ".h",
  ".hpp",
]);

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const copyFile = async (source, destination) => {
  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
};

const copyTree = async (sourceDir, destinationDir, { skip } = {}) => {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await ensureDir(destinationDir);

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    if (skip && skip(sourcePath, entry)) {
      continue;
    }
    if (entry.isDirectory()) {
      await copyTree(sourcePath, destinationPath, { skip });
    } else {
      await copyFile(sourcePath, destinationPath);
    }
  }
};

const resolveSdkSample = async () => {
  if (sdkSampleDir) {
    return sdkSampleDir;
  }
  if (!sdkDir) {
    return null;
  }

  const candidateDirs = [
    path.join(sdkDir, "WorkflowIntegration", "SamplePlugin"),
    path.join(sdkDir, "WorkflowIntegration", "CompatibleSamplePlugin"),
    path.join(sdkDir, "WorkflowIntegrationSamplePlugin"),
    path.join(sdkDir, "CompatibleSamplePlugin"),
  ];

  for (const candidate of candidateDirs) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch (error) {
      // ignore
    }
  }

  return null;
};

const cleanDist = async () => {
  await fs.rm(distDir, { recursive: true, force: true });
  await ensureDir(distDir);
};

const copySdkTemplate = async (sampleDir) => {
  if (!sampleDir) {
    return;
  }

  await copyTree(sampleDir, distDir, {
    skip: (sourcePath) => {
      const ext = path.extname(sourcePath).toLowerCase();
      if (excludedExtensions.has(ext)) {
        return true;
      }
      const base = path.basename(sourcePath);
      return ["index.html", "app.js", "styles.css"].includes(base);
    },
  });
};

const copySource = async () => {
  await copyTree(srcDir, distDir, {
    skip: (sourcePath) => {
      const relative = path.relative(srcDir, sourcePath);
      return relative.startsWith(".") || relative === "";
    },
  });
};

const main = async () => {
  await cleanDist();
  const sampleDir = await resolveSdkSample();
  await copySdkTemplate(sampleDir);
  await copySource();

  if (!sampleDir) {
    console.warn(
      "SDK sample not found. Build output contains only Auto-Editor sources. " +
        "Set RESOLVE_SDK_DIR or RESOLVE_SDK_SAMPLE_DIR to copy the official template files.",
    );
  }
};

main();
