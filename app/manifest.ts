import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fluen — Language in action",
    short_name: "Fluen",
    description: "Practice German and Chinese through writing and conversation.",
    start_url: "/write",
    scope: "/",
    display: "standalone",
    background_color: "#e7f7ff",
    theme_color: "#72d1f4",
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Writing practice", url: "/write" },
      { name: "Conversation", url: "/speak" },
      { name: "My words", url: "/words" },
    ],
  };
}
