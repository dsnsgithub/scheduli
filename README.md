# Scheduli

<img src="https://github.com/user-attachments/assets/6d9937b6-a3eb-4bd0-b7ac-a7dbe51725a2" />

Scheduli keeps you informed about your daily schedule, even during the most chaotic days.

You can find the website at https://scheduli.dsns.dev/, as well as on [iOS](https://apps.apple.com/us/app/scheduli/id6470429917) and [Android](https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile).

## Technologies Used

Scheduli is structured as a Next.js and Expo monorepo, enabling shared code, tooling, and configuration to support both web and mobile platforms.

**Core:**

- **[TypeScript](https://www.typescriptlang.org/)**: For type-safe JavaScript development.
- **[Bun](https://bun.sh/)**: For installing and managing dependencies across the monorepo.
- **[Turborepo](https://turbo.build/repo)**: For high-performance monorepo management.

**CI/CD:**

- **[Playwright](https://playwright.dev/)**: For E2E testing of web applications.
- **[Maestro](https://maestro.dev/)**: For E2E mobile app testing.

**Mobile (`apps/mobile`):**

- **[React Native](https://reactnative.dev/)**: For building native mobile apps with React.
- **[Expo](https://expo.dev/)**: To streamline React Native development, building, and deployment.
- **[Expo Router](https://docs.expo.dev/router/introduction/)**: For file-based routing in Expo apps.
- **[Nativewind](https://www.nativewind.dev/)**: For styling the mobile application.
- **[Notifee](https://notifee.app/)**: For rich notifications.
- **[Swift](https://developer.apple.com/swift/)**: For native iOS widgets.

**Web (`apps/web`):**

- **[Next.js](https://nextjs.org/)**: For the React-based web application.
- **[React](https://reactjs.org/)**: For building the user interface.
- **[Tailwind CSS](https://tailwindcss.com/)**: For styling the web application.

## Getting Started

### Prerequisites

Install the following tools before starting development:

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/en) (required by Expo tooling)
- [Android Studio](https://developer.android.com/studio) (required for Android development)
  - Ensure the latest SDK and an Android emulator are installed
- [Xcode](https://developer.apple.com/xcode/) (required for iOS development, macOS only)
  - Ensure that iOS platform support is installed.

### Create Development Environment

```bash
git clone https://github.com/dsnsgithub/scheduli-unified
bun install
bun run dev
```

If you have Expo Credentials, run

```bash
bun run --filter @scheduli/mobile env:dev
```

If not, load environment variables into `./apps/mobile/.env.local`

```bash
# Environment: development

EXPO_PUBLIC_API_URL=http://localhost:3000/ # iOS
# EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/ # Android
EXPO_PUBLIC_APP_VARIANT=development
```

## Mobile Development Builds

Create a development build using:

```bash
bun run --filter @scheduli/mobile ios
```

or

```bash
bun run --filter @scheduli/mobile android
```
