// What a feedback message can be about, as the form sends it and as the Sheet shows it

export const TYPES: Record<string, string> = {
  feedback: "Feedback",
  bug: "Bug report",
  feature: "Feature request",
  question: "Question",
};

export const AREAS: Record<string, string> = {
  plotter: "Grid Plotter",
  calculator: "Grid Calculator",
  files: "Opening files",
  website: "This website",
  other: "Something else",
};

export const SETUPS: Record<string, string> = {
  windows: "Windows app",
  html: "HTML file in a browser",
  unsure: "Not sure",
};
