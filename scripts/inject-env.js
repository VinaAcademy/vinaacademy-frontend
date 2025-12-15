#!/usr/bin/env node

/**
 * Runtime Environment Variable Injection Script
 * Replaces placeholder values in built Next.js files with actual runtime environment variables
 */

const fs = require('fs')
const path = require('path')

const ENV_VARS = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
}

// Define placeholder patterns (both formats for compatibility)
const PLACEHOLDERS = {
  NEXT_PUBLIC_API_URL: [
    'http://PLACEHOLDER_API_URL/api/v1',
    '__NEXT_PUBLIC_API_URL__',
  ],
  NEXT_PUBLIC_SITE_URL: [
    'http://PLACEHOLDER_SITE_URL',
    '__NEXT_PUBLIC_SITE_URL__',
  ],
  NEXT_PUBLIC_WS_URL: [
    'http://PLACEHOLDER_WS_URL/ws',
    '__NEXT_PUBLIC_WS_URL__',
  ],
}

// Validate required environment variables
const missingVars = Object.entries(ENV_VARS)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:')
  missingVars.forEach((varName) => console.error(`   - ${varName}`))
  process.exit(1)
}

console.log('🔧 Injecting runtime environment variables...')

/**
 * Recursively find and process files
 */
function processDirectory(dir, extensions = ['.js', '.html']) {
  if (!fs.existsSync(dir)) {
    return
  }

  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      processDirectory(filePath, extensions)
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      processFile(filePath)
    }
  })
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false

    Object.entries(ENV_VARS).forEach(([key, value]) => {
      const placeholders = PLACEHOLDERS[key]

      placeholders.forEach((placeholder) => {
        if (content.includes(placeholder)) {
          // Replace all occurrences
          const regex = new RegExp(
            placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'g',
          )
          content = content.replace(regex, value)
          modified = true
        }
      })
    })

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`   ✓ Updated: ${path.relative(process.cwd(), filePath)}`)
    }
  } catch (error) {
    console.error(`   ✗ Error processing ${filePath}:`, error.message)
  }
}

// Process server.js
console.log('\n📦 Processing server files...')
if (fs.existsSync('server.js')) {
  processFile('server.js')
}

// Process .next directory
console.log('\n📦 Processing .next directory...')
if (fs.existsSync('.next')) {
  processDirectory('.next', ['.js', '.html', '.json'])
}

console.log('\n✅ Environment variable injection complete!')
console.log('\n📋 Injected values:')
Object.entries(ENV_VARS).forEach(([key, value]) => {
  console.log(`   ${key}=${value}`)
})
