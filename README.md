# Personal Website with Retro 90s OS Window Manager

A personal portfolio website designed with a nostalgic 90s operating system aesthetic, featuring an interactive window manager where visitors can navigate between different sections (About, Projects, Contact) as draggable, resizable windows.

## 🚀 Project Structure

The project follows modern React conventions with kebab-case naming for all files:

```text
/
├── public/
├── src
│   ├── components/        # React components (kebab-case naming)
│   │   ├── desktop.tsx
│   │   ├── window.tsx
│   │   ├── title-bar.tsx
│   │   ├── window-controls.tsx
│   │   ├── resize-handles.tsx
│   │   └── menu-bar/
│   │       ├── index.tsx
│   │       └── theme-toggle.tsx
│   ├── stores/           # Zustand stores (kebab-case naming)
│   │   └── window-store.ts
│   ├── hooks/            # Custom React hooks (kebab-case naming)
│   │   ├── use-window-drag.ts
│   │   ├── use-window-resize.ts
│   │   ├── use-window-persistence.ts
│   │   ├── use-window-content.ts
│   │   └── use-url-sync.ts
│   ├── utils/            # Pure utility functions (kebab-case naming)
│   │   ├── window-utils.ts
│   │   ├── viewport-constraints.ts
│   │   └── date-time.ts
│   ├── data/             # Static data (kebab-case naming)
│   │   └── windows.ts
│   ├── styles/           # SCSS files (CSS Modules)
│   │   ├── index.scss
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── _base.scss
│   ├── layouts/          # Astro layouts
│   │   ├── BaseLayout.astro
│   │   └── Layout.astro
│   └── pages/            # Astro pages (static content)
│       ├── index.astro
│       ├── about.astro
│       ├── projects.astro
│       └── contact.astro
├── .cursor/
│   └── rules/            # Cursor IDE rules (including naming conventions)
└── package.json
```

## 📋 Naming Conventions

All files use **kebab-case** naming convention:

- Components: `desktop.tsx`, `window.tsx`, `title-bar.tsx`
- Hooks: `use-window-drag.ts`, `use-url-sync.ts`
- Utils: `window-utils.ts`, `viewport-constraints.ts`
- Stores: `window-store.ts`
- Data: `windows.ts`

See `.cursor/rules/11-naming-conventions.mdc` for complete naming guidelines.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 🛠️ Tech Stack

- **Framework**: Astro (static site generation)
- **UI Framework**: React (for interactive components)
- **State Management**: Zustand
- **Styling**: CSS Modules with Sass/SCSS
- **Type Safety**: TypeScript (strict mode)
- **Animation**: Framer Motion (via Motion)
- **Build Tool**: Vite (via Astro)

## 📚 Documentation

For detailed project progress and features, see [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md).

## 👀 Want to learn more?

- [Astro Documentation](https://docs.astro.build)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Documentation](https://react.dev)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Sass Documentation](https://sass-lang.com/documentation)
