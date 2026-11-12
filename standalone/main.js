import { mount } from 'svelte';
import App from './App.svelte';
import '../src/routes/layout.css';

const target = document.getElementById('app');

if (!target) {
	throw new Error('Élément #app introuvable dans index.html');
}

mount(App, { target });
