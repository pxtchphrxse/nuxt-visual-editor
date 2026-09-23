// Minimal typing for the `#imports` virtual module as used by this package's runtime files.
// In a real Nuxt/Nitro build the virtual module provides these at build time.
export { defineNuxtPlugin, useRuntimeConfig, useNuxtApp } from 'nuxt/app'
export declare function defineNitroPlugin(
  plugin: (nitroApp: unknown) => void,
): (nitroApp: unknown) => void
