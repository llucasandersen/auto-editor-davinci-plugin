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
  timelineName,
  outputPath,
  exportOverride,
  args,
}) => {
  const bin = normalizeBinary(binary);
  const exportValue = exportOverride || `resolve:name=${quote(timelineName)}`;
  let command = `${bin} ${quote(clipPath)} --export ${exportValue}`;
  if (args) {
    command = `${command} ${args}`;
  }
  command = `${command} --output ${quote(outputPath)}`;
  return command;
};

export const buildPreviewCommand = ({
  binary,
  clipLabel,
  timelineName,
  exportOverride,
  outputOverride,
  args,
}) => {
  const bin = normalizeBinary(binary);
  const clipToken = clipLabel ? quote(clipLabel) : "<clip>";
  const exportValue = exportOverride || `resolve:name=${quote(timelineName)}`;
  let preview = `${bin} ${clipToken} --export ${exportValue}`;
  if (args) {
    preview = `${preview} ${args}`;
  }
  preview = `${preview} --output ${outputOverride || "<path>.fcpxml"}`;
  return preview;
};
