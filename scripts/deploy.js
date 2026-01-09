#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync, writeFileSync } from 'fs';
import { join } from 'path';

const BUILD_DIR = 'build';
const GH_PAGES_DIR = 'gh-pages';
const GH_PAGES_BRANCH = 'gh-pages';

console.log('🚀 Starting deployment to GitHub Pages...\n');

// Step 1: Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build complete!\n');
} catch (error) {
  console.error('❌ Build failed!');
  process.exit(1);
}

// Step 2: Check if build directory exists
if (!existsSync(BUILD_DIR)) {
  console.error(`❌ Build directory "${BUILD_DIR}" not found!`);
  process.exit(1);
}

// Step 3: Setup gh-pages branch/worktree
console.log('🌿 Setting up gh-pages branch...');
try {
  // Remove existing worktree if it exists
  if (existsSync(GH_PAGES_DIR)) {
    console.log(`   Removing existing ${GH_PAGES_DIR} worktree...`);
    try {
      execSync(`git worktree remove ${GH_PAGES_DIR} --force`, { stdio: 'ignore' });
    } catch {
      // If worktree remove fails, just delete the directory manually
      rmSync(GH_PAGES_DIR, { recursive: true, force: true });
    }
  }

  // Prune stale worktree registrations
  try {
    execSync(`git worktree prune`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }

  // Check if gh-pages branch exists remotely
  let branchExists = false;
  try {
    const result = execSync(`git ls-remote --heads origin ${GH_PAGES_BRANCH}`, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    if (result.trim()) {
      branchExists = true;
      console.log(`   Found existing ${GH_PAGES_BRANCH} branch on remote`);
    }
  } catch {
    // Command failed or branch doesn't exist
    console.log(`   ${GH_PAGES_BRANCH} branch doesn't exist yet, will create it`);
  }

  // Create worktree
  if (branchExists) {
    // Branch exists remotely, fetch and create worktree
    try {
      execSync(`git fetch origin ${GH_PAGES_BRANCH}:${GH_PAGES_BRANCH}`, { stdio: 'ignore' });
    } catch {
      // If fetch fails, try to create worktree anyway
    }
    // Use -f flag to override stale registration
    execSync(`git worktree add -f ${GH_PAGES_DIR} ${GH_PAGES_BRANCH}`, { stdio: 'inherit' });
    console.log(`   Created worktree at ${GH_PAGES_DIR}`);
  } else {
    // Branch doesn't exist, create orphan branch in worktree
    execSync(`git worktree add --detach ${GH_PAGES_DIR}`, { stdio: 'inherit' });
    execSync(`cd ${GH_PAGES_DIR} && git checkout --orphan ${GH_PAGES_BRANCH}`, { stdio: 'inherit' });
    execSync(`cd ${GH_PAGES_DIR} && git rm -rf . 2>/dev/null || true`, { shell: true, stdio: 'ignore' });
    console.log(`   Created new orphan ${GH_PAGES_BRANCH} branch`);
  }
} catch (error) {
  console.error('❌ Failed to setup gh-pages branch:', error.message);
  process.exit(1);
}

// Step 4: Copy build files to gh-pages directory
console.log(`📋 Copying build files to ${GH_PAGES_DIR}...`);
try {
  // Remove everything in gh-pages except .git
  const files = execSync(`ls -A ${GH_PAGES_DIR}`, { encoding: 'utf-8' }).trim().split('\n');
  files.forEach(file => {
    if (file !== '.git') {
      rmSync(join(GH_PAGES_DIR, file), { recursive: true, force: true });
    }
  });

  // Copy build files
  cpSync(BUILD_DIR, GH_PAGES_DIR, { recursive: true });
  
  // Create .nojekyll file to prevent GitHub Pages from processing with Jekyll
  // This is critical for SPA routing and asset paths
  writeFileSync(join(GH_PAGES_DIR, '.nojekyll'), '');
  console.log('✅ Files copied and .nojekyll created!\n');
} catch (error) {
  console.error('❌ Failed to copy files:', error.message);
  process.exit(1);
}

// Step 5: Commit and push to gh-pages
console.log('📤 Committing and pushing to GitHub...');
try {
  execSync(`cd ${GH_PAGES_DIR} && git add -A`, { stdio: 'inherit' });
  
  const commitMessage = process.argv[2] || `Deploy: ${new Date().toISOString()}`;
  execSync(`cd ${GH_PAGES_DIR} && git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  execSync(`cd ${GH_PAGES_DIR} && git push origin ${GH_PAGES_BRANCH}`, { stdio: 'inherit' });
  
  console.log('\n✅ Deployment complete!');
  console.log(`🌐 Your site should be live at: https://thelittlewonder.github.io/recharge/`);
} catch (error) {
  console.error('❌ Failed to commit/push:', error.message);
  console.log('\n💡 Tip: Make sure you have committed your changes to the main branch first!');
  process.exit(1);
}

