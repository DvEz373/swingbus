// The download the page offers: the newest release of this repository. Change the version here
// when a new one is published; the files keep these names (Swingbus-Setup-<version>.exe, Swingbus-<version>-portable.exe)
export const VERSION = "0.9.6";

const BASE = `https://github.com/DvEz373/swingbus/releases/download/v${VERSION}`;

export const DOWNLOAD = {
  installer: `${BASE}/Swingbus-Setup-${VERSION}.exe`,
  portable: `${BASE}/Swingbus-${VERSION}-portable.exe`,
  release: `https://github.com/DvEz373/swingbus/releases/tag/v${VERSION}`,
};
