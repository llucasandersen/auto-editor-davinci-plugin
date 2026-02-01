#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
output_path=${1:-"${repo_root}/dist/auto-editor-resolve-plugin.zip"}

mkdir -p "$(dirname "${output_path}")"

work_dir=$(mktemp -d)
trap 'rm -rf "${work_dir}"' EXIT

cp -R "${repo_root}/resources/resolve-plugin" "${work_dir}/auto-editor-resolve-plugin"

(
  cd "${work_dir}"
  zip -r "${output_path}" "auto-editor-resolve-plugin"
)

echo "Wrote ${output_path}"
