
{
  description = "Dish Dial Delight - A meal planning and nutrition tracking application";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js and npm
            nodejs_18
            nodePackages.npm

            # TypeScript tools
            nodePackages.typescript
            nodePackages.typescript-language-server

            # Linting and formatting
            nodePackages.eslint
            nodePackages.prettier

            # Tailwind CSS support
            #nodePackages.tailwindcss # to be installed via npm

            # Other useful tools
            git
          ];

          shellHook = ''
            echo "Welcome to Dish Dial Delight development environment!"
            echo "To get started, run: npm install && npm run dev"
          '';
        };
      }
    );
}
