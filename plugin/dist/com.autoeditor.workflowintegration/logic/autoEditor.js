const quote = (value) => `"${String(value).replace(/"/g, '\\"')}"`;

export const buildAutoEditorArgs = ({
  edit,
  margin,
  whenSilent,
  whenNormal,
  cutOut,
  addIn,
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
  if (extraArgs) {
    args.push(extraArgs);
  }

  return args.join(" ");
};

export const buildAutoEditorCommand = ({
  clipPath,
  timelineName,
  outputPath,
  args,
}) => {
  let command = `auto-editor ${quote(clipPath)} --export resolve:name=${quote(timelineName)}`;
  if (args) {
    command = `${command} ${args}`;
  }
  command = `${command} --output ${quote(outputPath)}`;
  return command;
};

export const buildPreviewCommand = ({
  clipLabel,
  timelineName,
  args,
}) => {
  const clipToken = clipLabel ? quote(clipLabel) : "<clip>";
  let preview = `auto-editor ${clipToken} --export resolve:name=${quote(timelineName)}`;
  if (args) {
    preview = `${preview} ${args}`;
  }
  preview = `${preview} --output <path>.fcpxml`;
  return preview;
};
