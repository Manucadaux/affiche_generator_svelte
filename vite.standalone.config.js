import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
	root: 'standalone',
	base: './',
	publicDir: '../static',
	plugins: [tailwindcss(), svelte(), viteSingleFile()],
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		cssCodeSplit: false,
		rolldownOptions: {
			output: {
				codeSplitting: false
			}
		}
	}
});
