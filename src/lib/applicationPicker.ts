/**
 * macOS native file-dialog options for choosing installed .app bundles.
 *
 * Without defaultPath, macOS can reuse a previous location that differs
 * between development and installed app instances.
 */
export const MACOS_APPLICATIONS_DIRECTORY = "/Applications";

export function applicationPickerOptions(title: string) {
  return {
    title,
    directory: false,
    multiple: false,
    defaultPath: MACOS_APPLICATIONS_DIRECTORY,
  } as const;
}
