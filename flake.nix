{
  description = "SuperApp - PrefRio Citizen Portal Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "superapp-dev";

          buildInputs = with pkgs; [
            # k6 for load testing (main requirement)
            k6

            # Python for analytics and charting
            python311
            python311Packages.pandas
            python311Packages.numpy
            python311Packages.matplotlib
            python311Packages.seaborn
            python311Packages.tabulate

            # Utilities
            curl
            jq
            just

            # Git
            git
          ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
            # Browser for k6 browser tests (Chromium - Linux only)
            chromium
          ];

          # Use system Node.js instead of Nix's to avoid long builds
          # Users should have Node.js 23+ installed via nvm, homebrew, or official installer

          shellHook = ''
            echo "🏛️  SuperApp Development Environment"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            # Check for Node.js
            if command -v node &> /dev/null; then
              echo "Node.js: $(node --version)"
              echo "npm: $(npm --version 2>/dev/null || echo 'not found')"
            else
              echo "⚠️  Node.js not found - please install Node.js 23+"
            fi

            echo "k6: $(k6 version)"
            echo "just: $(just --version)"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "📦 Install dependencies: npm install"
            echo "🚀 Start dev server: npm run dev"
            echo "🏗️  Build: npm run build"
            echo "🧪 Load test: just load-test"
            echo "📊 Analyze results: just analyze-results"
            echo ""

            # Load .env files if they exist
            if [ -f .env ]; then
              echo "Loading .env file..."
              set -a
              source .env
              set +a
            fi

            if [ -f .env.local ]; then
              echo "Loading .env.local file..."
              set -a
              source .env.local
              set +a
            fi

            if [ -f k6/.env.loadtest ]; then
              echo "Loading k6/.env.loadtest file..."
              set -a
              source k6/.env.loadtest
              set +a
            fi

            # Set Chromium path for k6 browser tests (Linux only)
            ${pkgs.lib.optionalString pkgs.stdenv.isLinux ''
              export PLAYWRIGHT_BROWSERS_PATH=${pkgs.chromium}
              export K6_BROWSER_ENABLED=true
            ''}

            # On macOS, k6 browser tests will use system Chrome/Chromium if available
            ${pkgs.lib.optionalString pkgs.stdenv.isDarwin ''
              echo "⚠️  Note: k6 browser tests require Chrome/Chromium on macOS"
              echo "   Install via: brew install --cask chromium"
            ''}
          '';
        };
      }
    );
}
