# Theme Implementation Guide

## Overview

The POS-ATK frontend now supports dark/light theme switching using `next-themes` and Tailwind CSS dark mode.

## Components Added

### 1. Theme Provider (`src/components/theme-provider.tsx`)

- Wraps the app with `next-themes` ThemeProvider
- Configured with class-based theme switching
- Supports system theme detection

### 2. Theme Toggle (`src/components/ui/theme-toggle.tsx`)

- Button component for switching themes
- Cycles through: Light → Dark → System → Light
- Uses Lucide icons (Sun, Moon, Monitor)
- Handles hydration properly with mounted state

### 3. Layout Components

- **Sidebar** (`src/components/layout/sidebar.tsx`): Navigation sidebar with dark mode support
- **Navbar** (`src/components/layout/navbar.tsx`): Top navigation with theme toggle and logout
- **NavigationMenuItem** (`src/components/layout/navigation-menu-item.tsx`): Individual nav items with active states
- **NavigationConfig** (`src/components/layout/navigation-config.tsx`): Shared navigation configuration

## Usage

### Theme Toggle

The theme toggle button is automatically included in the navbar. Users can click it to cycle through themes:

- **Light Mode**: Sun icon
- **Dark Mode**: Moon icon
- **System Mode**: Monitor icon (follows OS preference)

### Adding Dark Mode to Components

Use Tailwind's `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content that adapts to theme
</div>
```

### Theme Detection in Components

```tsx
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("light")}>Light</button>
    </div>
  );
}
```

### Navigation Configuration

The navigation menu is now centralized in `navigation-config.tsx`:

```tsx
import {
  navigation,
  NavigationItem,
} from "@/components/layout/navigation-config";

// Use the shared navigation configuration
// Add new menu items by editing the navigation array
```

## Configuration

### Tailwind CSS

The theme uses Tailwind's built-in dark mode with class strategy:

- Dark mode is enabled via the `.dark` class on the root element
- CSS variables are defined for both light and dark themes in `globals.css`

### Next.js App

The ThemeProvider is configured in `src/components/providers.tsx`:

- `attribute="class"`: Uses class-based theme switching
- `defaultTheme="system"`: Defaults to system preference
- `enableSystem`: Allows system theme detection
- `disableTransitionOnChange`: Prevents flash during theme changes

## File Structure

```
src/
├── components/
│   ├── theme-provider.tsx          # Theme provider wrapper
│   ├── layout/
│   │   ├── navigation-config.tsx   # Shared navigation configuration
│   │   ├── sidebar.tsx            # Navigation sidebar
│   │   ├── navbar.tsx             # Top navigation bar
│   │   └── navigation-menu-item.tsx # Navigation menu items
│   └── ui/
│       └── theme-toggle.tsx       # Theme toggle button
├── app/
│   ├── globals.css               # Theme CSS variables
│   └── (protected)/
│       └── layout.tsx            # Protected layout using components
└── lib/
    └── utils.ts                  # Utility functions (cn)
```

## Theme Colors

The theme uses CSS custom properties defined in `globals.css`:

- Light theme: Clean whites and grays
- Dark theme: Dark grays and whites with proper contrast
- All shadcn/ui components automatically support both themes

## Navigation Management

Navigation items are centrally managed in `navigation-config.tsx`:

- **NavigationItem interface**: Defines the structure for menu items
- **navigation array**: Contains all menu items with role-based access
- **Role-based filtering**: Sidebar automatically filters items based on user roles

### Adding New Navigation Items

```tsx
// In navigation-config.tsx
export const navigation: NavigationItem[] = [
  // ... existing items
  {
    name: "New Feature",
    href: "/new-feature",
    roles: ["super-admin", "manager"],
  },
];
```

## Best Practices

1. Always provide dark mode variants for custom colors
2. Use semantic color classes when possible (e.g., `text-foreground` instead of `text-gray-900`)
3. Test components in both light and dark modes
4. Use the theme toggle to verify theme switching works correctly
5. Add new navigation items to the central config file
6. Use absolute imports (`@/components/...`) for better maintainability
