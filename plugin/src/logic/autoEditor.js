const quote = (value) => `"${String(value).replace(/"/g, '\\"')}"`;

const normalizeBinary = (binary) => {
  const trimmed = String(binary || "").trim();
  if (!trimmed) {
    return "auto-editor";
  }
  return /\s/.test(trimmed) ? quote(trimmed) : trimmed;
};

export const buildAutoEditorArgs = ({
  edit,
  margin,
  whenSilent,
  whenNormal,
  cutOut,
  addIn,
  advancedOptions = [],
  extraArgs,
}) => {
  const args = [];

  if (edit) {
    args.push(`--edit ${edit}`);
  }
  if (margin) {
    args.push(`--margin ${margin}`);
  }
  if (whenSilent) {
    args.push(`--when-silent ${whenSilent}`);
  }
  if (whenNormal) {
    args.push(`--when-normal ${whenNormal}`);
  }
  if (cutOut) {
    args.push(`--cut-out ${cutOut}`);
  }
  if (addIn) {
    args.push(`--add-in ${addIn}`);
  }
  advancedOptions.forEach((option) => {
    if (option.hasValue) {
      args.push(`${option.flag} ${option.value}`);
    } else {
      args.push(option.flag);
    }
  });
  if (extraArgs) {
    args.push(extraArgs);
  }

  return args.join(" ");
};

export const buildAutoEditorCommand = ({
  binary,
  clipPath,
  exportValue,
  outputPath,
  args,
}) => {
  const bin = normalizeBinary(binary);
  let command = `${bin} ${quote(clipPath)}`;
  if (exportValue) {
    command = `${command} --export ${exportValue}`;
  }
  if (args) {
    command = `${command} ${args}`;
  }
  if (outputPath) {
    command = `${command} --output ${quote(outputPath)}`;
  }
  return command;
};

export const buildPreviewCommand = ({
  binary,
  clipLabel,
  exportValue,
  outputPath,
  args,
}) => {
  const bin = normalizeBinary(binary);
  const clipToken = clipLabel ? quote(clipLabel) : "<clip>";
  let preview = `${bin} ${clipToken}`;
  if (exportValue) {
    preview = `${preview} --export ${exportValue}`;
  }
  if (args) {
    preview = `${preview} ${args}`;
  }
  if (outputPath) {
    preview = `${preview} --output ${quote(outputPath)}`;
  }
  return preview;
};
