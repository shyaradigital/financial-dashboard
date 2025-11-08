# GitHub Repository Setup Guide

This guide will help you set up the Financial Dashboard repository on GitHub under the `shyaradigital` organization.

## Prerequisites

1. **GitHub Account** with access to `shyaradigital` organization
2. **Git** installed on your system
3. **GitHub CLI** (optional, but recommended) or use GitHub web interface

## Step 1: Create the Repository on GitHub

### Option A: Using GitHub Web Interface

1. Go to [github.com/shyaradigital](https://github.com/shyaradigital)
2. Click on **"New repository"** or go to [github.com/organizations/shyaradigital/repositories/new](https://github.com/organizations/shyaradigital/repositories/new)
3. Fill in the details:
   - **Repository name**: `financial-dashboard`
   - **Description**: `Local-First Privacy-Focused Financial Management Dashboard`
   - **Visibility**: Choose **Public** or **Private** (as per your preference)
   - **Initialize repository**: 
     - ❌ Do NOT check "Add a README file" (we already have one)
     - ❌ Do NOT check "Add .gitignore" (we already have one)
     - ❌ Do NOT check "Choose a license" (we'll add it later if needed)
4. Click **"Create repository"**

### Option B: Using GitHub CLI

```bash
gh repo create shyaradigital/financial-dashboard \
  --public \
  --description "Local-First Privacy-Focused Financial Management Dashboard" \
  --source=. \
  --remote=origin \
  --push
```

## Step 2: Initialize Git in Your Project (if not already done)

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

## Step 3: Add Remote Repository

```bash
# Add the remote repository
git remote add origin https://github.com/shyaradigital/financial-dashboard.git

# Or if using SSH:
git remote add origin git@github.com:shyaradigital/financial-dashboard.git

# Verify remote
git remote -v
```

## Step 4: Stage and Commit Files

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Financial Dashboard - Local-First Financial Management"

# Or with more details:
git commit -m "Initial commit: Financial Dashboard

- Local-first financial management application
- Built with Electron, React, and TypeScript
- Features: Expense tracking, Income tracking, Bank vault, Investment tracker, Goals, Budget planner, Financial metrics, Predictive insights
- Full encryption and privacy protection
- Cross-platform support (Windows, Linux)"
```

## Step 5: Push to GitHub

```bash
# Push to main branch (or master, depending on your default)
git branch -M main
git push -u origin main
```

If you get authentication errors:
- **HTTPS**: You'll be prompted for username and password (use a Personal Access Token, not your password)
- **SSH**: Make sure your SSH key is added to GitHub

## Step 6: Create Personal Access Token (if using HTTPS)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Financial Dashboard"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when pushing

## Step 7: Set Up Repository Settings

### Add Repository Topics/Tags

1. Go to repository → Settings → Topics
2. Add topics: `finance`, `electron`, `react`, `typescript`, `local-first`, `privacy`, `financial-management`, `dashboard`

### Add Repository Description

Update the description to:
```
Local-First Privacy-Focused Financial Management Dashboard built with Electron, React, and TypeScript. All your financial data stays on your device, encrypted with your master password.
```

### Enable Issues and Discussions (Optional)

1. Go to Settings → Features
2. Enable "Issues" and "Discussions" if you want community contributions

## Step 8: Create First Release

### Prepare Release Notes

Create a file `RELEASE_NOTES.md`:

```markdown
# Release Notes

## Version 1.0.0 - Initial Release

### Features
- Complete financial dashboard with 9 modules
- Local-first architecture with encrypted storage
- Master password protection
- Cross-platform support (Windows, Linux)
- Password-protected bank vault
- Financial health metrics
- Predictive insights

### Installation
See README.md for detailed installation instructions.

### Security
- AES-256 encryption
- bcrypt password hashing
- No cloud dependencies
- Complete privacy protection
```

### Create Release on GitHub

1. Go to repository → **Releases** → **Create a new release**
2. **Tag version**: `v1.0.0`
3. **Release title**: `Financial Dashboard v1.0.0 - Initial Release`
4. **Description**: Copy from RELEASE_NOTES.md
5. **Attach binaries** (if you've built them):
   - `Financial Dashboard Setup 1.0.0.exe` (Windows installer)
   - `financial-dashboard-1.0.0.AppImage` (Linux AppImage)
   - `financial-dashboard-1.0.0.deb` (Linux Debian package)
6. Click **"Publish release"**

## Step 9: Add Additional Files (Optional)

### Add LICENSE File

If you want to add a license:

```bash
# Create LICENSE file (ISC License example)
cat > LICENSE << EOF
ISC License

Copyright (c) 2024, Shyara Digital

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
EOF

git add LICENSE
git commit -m "Add ISC License"
git push
```

### Add CONTRIBUTING.md (Optional)

```bash
cat > CONTRIBUTING.md << EOF
# Contributing to Financial Dashboard

Thank you for your interest in contributing!

## How to Contribute

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## Code Style

- Follow existing code style
- Use TypeScript for type safety
- Add comments for complex logic
- Test your changes before submitting

## Reporting Issues

Please include:
- OS version
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
EOF

git add CONTRIBUTING.md
git commit -m "Add contributing guidelines"
git push
```

## Step 10: Verify Everything is Set Up

1. **Check repository**: Visit `https://github.com/shyaradigital/financial-dashboard`
2. **Verify README**: Make sure it displays correctly
3. **Check files**: All important files should be visible
4. **Test clone**: Try cloning in a new directory:
   ```bash
   git clone https://github.com/shyaradigital/financial-dashboard.git test-clone
   cd test-clone
   npm install
   npm run build
   ```

## Quick Reference Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your commit message"

# Push
git push origin main

# Pull latest
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# View remote
git remote -v

# Update remote URL (if needed)
git remote set-url origin https://github.com/shyaradigital/financial-dashboard.git
```

## Troubleshooting

### Authentication Issues

**Problem**: `fatal: Authentication failed`

**Solution**:
- Use Personal Access Token instead of password
- Or set up SSH keys
- Or use GitHub CLI: `gh auth login`

### Push Rejected

**Problem**: `! [rejected] main -> main (non-fast-forward)`

**Solution**:
```bash
git pull origin main --rebase
git push origin main
```

### Large Files

**Problem**: File too large for GitHub

**Solution**:
- Use Git LFS for large files
- Or exclude from repository (add to .gitignore)

## Next Steps

1. ✅ Repository created and pushed
2. ✅ README with installation instructions
3. ✅ .gitignore configured
4. ⬜ Create first release with binaries
5. ⬜ Set up CI/CD (optional)
6. ⬜ Add badges to README (optional)
7. ⬜ Create GitHub Pages documentation (optional)

---

**Your repository is now ready to share!** 🎉

Share the link: `https://github.com/shyaradigital/financial-dashboard`

