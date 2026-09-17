import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cohort",
    short_name: "Cohort",
    description: "A shared workspace for people and agents.",
    start_url: "/",
    display: "standalone",
    background_color: "#24262f",
    theme_color: "#24262f",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
