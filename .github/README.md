# CI version pinning

Everything CI touches is pinned to an exact version. The goal is blunt: a run
that is green today should still be green in a year with no changes to this
repo. If a build breaks, it should be because someone changed the code — not
because an upstream release happened.

Nothing in CI may use `latest`, a floating major tag (`@v4`), a caret/tilde
range, or "whatever the runner image ships".

## Where the pins live

| What | Pinned to | File |
| --- | --- | --- |
| Runner image | `macos-26`, `ubuntu-24.04` | `.github/workflows/*.yml` |
| Third-party actions | full commit SHA (`# vX.Y.Z` comment) | `.github/workflows/*.yml` |
| Bun | `1.3.14` | `.github/actions/setup/action.yml`, `packageManager` in `package.json` |
| Node.js | `24.18.0` (macOS), `22.23.2` (Ubuntu) | `.github/actions/setup/action.yml` |
| Temurin JDK | `21.0.11+10` | `.github/actions/setup/action.yml` |
| Xcode | `26.6` | `.github/actions/setup/action.yml` |
| CocoaPods | `1.17.0` | `.github/actions/setup/action.yml` |
| Maestro | `2.8.0` | `.github/actions/setup/action.yml` |
| iOS simulator | `iPhone 17 Pro`, iOS `26.5` | `.github/workflows/test-ios.yml` |
| EAS CLI | `22.0.0` | `apps/mobile/package.json` scripts, `apps/mobile/eas.json` |
| npm dependencies | exact versions, no ranges | `package.json`, `apps/*/package.json` |
| Transitive npm deps | resolved tree | `bun.lock` (CI runs `bun ci`, which is frozen-lockfile) |
| Native iOS pods | `MMKVCore` / `MMKVAppExtension` `2.4.0` | `apps/mobile/plugins/withAddPodDepsToTargets.ts` |
| `react-native-mmkv` patch | `3.3.3` | `apps/mobile/patches/`, `patchedDependencies` |

Most of the toolchain lives in one file, `.github/actions/setup/action.yml`, so
a bump is a one-line edit there and CI proves it.

## Why exact npm versions, when `bun.lock` already exists

`bun ci` is frozen, so CI installs exactly what the lockfile says. Ranges still
bite in two places:

- Anyone running plain `bun install` locally silently drifts off the lockfile,
  and then commits the drift.
- `patchedDependencies` keys are exact (`react-native-mmkv@3.3.3`). If the
  range floats to `3.3.4`, the patch stops applying **silently** — the app-group
  MMKV path fix just disappears, and nothing fails until a widget misbehaves.

Exact versions make both impossible.

## Why the CocoaPods shim

`pod` is resolved from `PATH` by the EAS build, so `gem install cocoapods -v X`
is not enough — a newer CocoaPods preinstalled on a future runner image would
still win. The setup action writes a small `pod` shim that always calls the
pinned gem version explicitly.

## Bumping something

1. Change the version in the one place listed above.
2. Open a PR and let CI run.
3. If it's green, merge. If not, you found out on your terms rather than on a
   random Tuesday.

For npm dependencies, bump the exact version in the relevant `package.json`,
run `bun install` to refresh `bun.lock`, and commit both.

## What still isn't fully pinnable

Worth knowing about, because these can still break a build that never changed:

- **Runner images are eventually retired.** `macos-26` and `ubuntu-24.04` will
  be removed by GitHub in time. When that happens, the job fails immediately
  and loudly with an unknown-label error rather than drifting — that's the
  point. Move to the next image and re-pin Xcode, Node and CocoaPods to
  whatever it ships.
- **GitHub retires action runtimes.** Actions declaring `node20` (such as
  `futureware-tech/simulator-action`) will eventually be forced onto a newer
  Node by the runner regardless of the SHA pin.
- **The Android SDK components** Gradle downloads during a build come from the
  versions the generated `android/` project requests, which are set by the
  pinned Expo/React Native versions.
- **EAS Build's server-side behaviour.** `eas build --local` still talks to
  Expo's servers for credentials and project config.
