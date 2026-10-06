// Keep a running development preview intact when validating production builds.
export default function config(phase) {
  return {
    distDir: phase === "phase-development-server" ? ".next-dev" : ".next",
  };
}
