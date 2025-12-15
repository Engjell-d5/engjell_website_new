# Google Analytics Docker Fix

## Problem

Google Analytics tags are not being detected because `NEXT_PUBLIC_GA_ID` environment variable needs to be available at **build time**, not just runtime.

In Next.js, all `NEXT_PUBLIC_*` environment variables are embedded into the JavaScript bundle during the build process. If the variable isn't set during `docker build`, it won't be included in the bundle.

## Solution

The Dockerfile has been updated to accept `NEXT_PUBLIC_GA_ID` as a build argument, and `docker-compose.yml` has been updated to pass it.

## How to Fix

1. **Set the environment variable** in your `.env` file or environment:
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

2. **Rebuild the Docker image** (required because build-time variables are needed):
   ```bash
   docker-compose build --no-cache app
   ```

   Or rebuild everything:
   ```bash
   docker-compose build --no-cache
   ```

3. **Restart the containers**:
   ```bash
   docker-compose up -d
   ```

## Verify It's Working

1. Open your website in a browser
2. Open Developer Tools → Console
3. Look for Google Analytics script loading (should see requests to `googletagmanager.com` or `google-analytics.com`)
4. Use Google Tag Assistant browser extension to verify tags are detected

## Alternative: Runtime Loading (Not Recommended)

If you need to change the GA ID without rebuilding, you would need to modify the code to load Google Analytics dynamically at runtime using a client-side script. However, this is less optimal than the build-time approach.

## Troubleshooting

- **Tags still not detected**: Make sure you rebuilt the image after setting `NEXT_PUBLIC_GA_ID`
- **CSP errors**: The CSP has been updated to allow Google domains - check middleware.ts
- **Environment variable not found**: Ensure `.env` file is in the project root and contains `NEXT_PUBLIC_GA_ID`

