const quote = (value) => `"${String(value).replace(/"/g, '\\"')}"`;

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
  clipPath,
  timelineName,
  outputPath,
  exportOverride,
  args,
}) => {
  const exportValue = exportOverride || `resolve:name=${quote(timelineName)}`;
  let command = `auto-editor ${quote(clipPath)} --export ${exportValue}`;
  if (args) {
    command = `${command} ${args}`;
  }
  command = `${command} --output ${quote(outputPath)}`;
  return command;
};

export const buildPreviewCommand = ({
  clipLabel,
  timelineName,
  exportOverride,
  outputOverride,
  args,
}) => {
  const clipToken = clipLabel ? quote(clipLabel) : "<clip>";
  const exportValue = exportOverride || `resolve:name=${quote(timelineName)}`;
  let preview = `auto-editor ${clipToken} --export ${exportValue}`;
  if (args) {
    preview = `${preview} ${args}`;
  }
  preview = `${preview} --output ${outputOverride || "<path>.fcpxml"}`;
  return preview;
};
