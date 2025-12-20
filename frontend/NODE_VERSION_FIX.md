# Node.js Version Compatibility Fix

## Issue
If you're encountering the `cross-spawn` error with Node.js v24.6.0, this is a known compatibility issue.

## Solutions

### Option 1: Use Node.js LTS (Recommended)
Install and use Node.js v18 or v20 LTS instead of v24:

```powershell
# If you have nvm-windows installed:
nvm install 18.20.4
nvm use 18.20.4

# Or download from: https://nodejs.org/
```

### Option 2: Use the Updated Start Script
The `package.json` has been updated with a workaround. Try:

```powershell
cd frontend
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

### Option 3: Manual Fix
If the above doesn't work, try:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm start
```

### Option 4: Patch cross-spawn (Advanced)
If you must use Node.js v24, you may need to patch cross-spawn:

```powershell
cd frontend
npm install patch-package --save-dev
# Then manually fix the cross-spawn module
```

## Recommended Node.js Versions
- **Node.js v18.20.4 LTS** (Recommended)
- **Node.js v20.11.0 LTS** (Also works)
- **Node.js v24.x** (May have compatibility issues)

## Check Your Node Version
```powershell
node --version
```

If it shows v24.x, consider downgrading to v18 or v20 LTS for better compatibility with react-scripts 5.0.1.

