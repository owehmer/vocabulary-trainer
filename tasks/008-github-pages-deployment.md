# 008 - GitHub Pages Deployment Pipeline

## Task Description
Add a GitHub Actions workflow that automatically deploys the Angular application to GitHub Pages when pushing to the `main` branch.

## Requirements
- Trigger deployment on push to `main` branch
- Build Angular app in production mode
- Deploy to GitHub Pages
- Configure correct base href for GitHub Pages subdirectory

## Implementation

### GitHub Actions Workflow
Created `.github/workflows/deploy-gh-pages.yml` with the following configuration:

1. **Trigger**: Push to `main` branch
2. **Build Job**:
   - Checkout repository
   - Setup Node.js v22 with npm cache
   - Install dependencies with `npm ci`
   - Build Angular app with `--base-href /vokabel/` for GitHub Pages
   - Upload build artifacts from `dist/vokabel/browser`

3. **Deploy Job**:
   - Deploys artifacts to GitHub Pages
   - Depends on successful build job

### Permissions
- `contents: read` - To checkout the repository
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For OIDC token authentication

### Concurrency
- Only one deployment runs at a time
- Queued deployments are cancelled in favor of the latest

## GitHub Repository Setup Required
After pushing this workflow, enable GitHub Pages in your repository settings:
1. Go to repository **Settings** > **Pages**
2. Under "Build and deployment", select **GitHub Actions** as the source

## Deployment URL
Once deployed, the app will be available at:
`https://<username>.github.io/vokabel/`

## Notes
- The `--base-href /vokabel/` flag ensures Angular routing works correctly on GitHub Pages
- The workflow uses the latest stable versions of GitHub Actions
- Node.js 22 is used (LTS version compatible with Angular 21)

