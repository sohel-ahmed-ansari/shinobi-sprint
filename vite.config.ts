import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/shinobi-sprint/",
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "title.png",
        "music-icon.svg",
        "music-icon-muted.svg",
        "sound-effects-icon.svg",
        "sound-effects-icon-muted.svg",
      ],
      workbox: {
        // Precache the built app shell + game assets so it runs offline.
        globPatterns: ["**/*.{js,css,html,png,svg,mp3,wav,woff2}"],
        // Game/audio assets can be large; raise the precache size limit.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Skip terser minification of the generated SW to avoid a
        // worker-thread hang in workbox-build with rollup 4 / terser.
        mode: "development",
      },
      manifest: {
        name: "Shinobi Sprint",
        short_name: "Shinobi",
        description: "Endless ninja runner — jump, dash and throw shurikens to survive!",
        theme_color: "#87ceeb",
        background_color: "#87ceeb",
        display: "standalone",
        orientation: "landscape",
        categories: ["games", "entertainment"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
