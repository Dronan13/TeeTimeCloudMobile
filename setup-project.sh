#!/bin/bash

# TeeTime Cloud Mobile - Project Setup Script
# This script creates the complete project structure and all files

echo "🏌️ Setting up TeeTime Cloud Mobile..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/{components,hooks,lib,navigation,screens,services,types,utils}

# Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "teetime-cloud-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.9",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "dayjs": "^1.11.10",
    "expo": "~50.0.6",
    "expo-status-bar": "~1.11.1",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-url-polyfill": "^2.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.7",
    "@types/react": "~18.2.45",
    "@types/react-native": "^0.72.8",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@testing-library/react-native": "^12.4.3",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "prettier": "^3.2.4",
    "typescript": "^5.3.3"
  },
  "private": true
}
EOF

# Create tsconfig.json
echo "⚙️ Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@lib/*": ["src/lib/*"],
      "@navigation/*": ["src/navigation/*"]
    }
  }
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# Create .eslintrc.js
cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  extends: ['eslint:recommended', '@react-native-community', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
EOF

# Create .prettierrc.js
cat > .prettierrc.js << 'EOF'
module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  semi: true,
  tabWidth: 2,
  printWidth: 90,
};
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
EOF

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. cd nowhere"
echo "2. Copy your supabase.ts file to src/types/"
echo "3. Create .env file from .env.example and add your Supabase credentials"
echo "4. Run: npm install"
echo "5. Download remaining files from the artifacts I created"
echo "6. Run: npm start"
echo ""
echo "📚 See SETUP_GUIDE.md for detailed instructions"
EOF

chmod +x setup-project.sh

echo "✅ Script created! Run with: bash setup-project.sh"