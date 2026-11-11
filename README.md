# Affiche Generator

**Affiche Generator** est une application web permettant de créer et de personnaliser facilement des affiches composées de plusieurs pages et événements.

L'application offre une interface de création interactive avec aperçu en temps réel, personnalisation graphique et export au format PDF.

## Fonctionnalités

- **Gestion des pages** : ajouter et organiser plusieurs pages.
- **Gestion des événements** : créer, modifier et personnaliser les événements affichés.
- **Personnalisation graphique** : modifier les couleurs et choisir parmi plusieurs thèmes visuels.
- **Gestion des images** : associer des images aux événements.
- **Décorations** : ajouter des éléments décoratifs à l'affiche.
- **Aperçu dynamique** : visualiser les modifications en temps réel.
- **Zoom** : ajuster l'affichage de l'affiche.
- **Sauvegarde automatique** : retrouver son travail après avoir fermé et rouvert l'application.
- **Export PDF** : générer un document PDF à partir de l'affiche.

## Technologies utilisées

- [Svelte 5](https://svelte.dev/) – interface réactive et composants.
- [SvelteKit](https://svelte.dev/docs/kit) – framework applicatif.
- [Tailwind CSS](https://tailwindcss.com/) – styles et mise en page.
- [DaisyUI](https://daisyui.com/) – composants et thèmes.
- [IndexedDB](https://developer.mozilla.org/fr/docs/Web/API/IndexedDB_API) – stockage des images.
- `localStorage` – sauvegarde des données de l'application.
- [jsPDF](https://github.com/parallax/jsPDF) et [html2canvas-pro](https://github.com/yorickshan/html2canvas-pro) – génération des PDF.
- [Lucide](https://lucide.dev/) – icônes.

## Installation

Cloner le dépôt :

```bash
git clone https://github.com/Manucadaux/affiche_generator_svelte.git
```

Accéder au dossier :

```bash
cd affiche_generator_svelte
```

Installer les dépendances :

```bash
npm install
```

## Développement

Lancer le serveur de développement :

```bash
npm run dev
```

Pour ouvrir automatiquement l'application dans le navigateur :

```bash
npm run dev -- --open
```

## Production

Construire l'application :

```bash
npm run build
```

Prévisualiser la version de production :

```bash
npm run preview
```

## Stockage des données

L'application utilise deux mécanismes de stockage côté navigateur :

- **localStorage** pour conserver les données et les paramètres de l'affiche.
- **IndexedDB** pour stocker les images associées aux événements.

Les données sont conservées localement dans le navigateur. Elles ne sont donc pas automatiquement synchronisées entre plusieurs appareils ou navigateurs.

## Licence

Projet personnel.
