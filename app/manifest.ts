import type { MetadataRoute } from "next";

// NatureMe is web first: this makes it installable to the home screen from the
// browser, so there is no app store download standing between a listener and a walk.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NatureMe",
    short_name: "NatureMe",
    description: "The home of nature audio, mapped to where you are.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#17281F",
    theme_color: "#17281F",
    categories: ["music", "education", "health", "travel"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
