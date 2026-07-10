{
  description = "A Nix-flake-based transcendence development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-26.05";
  };

  outputs = { self , nixpkgs ,... }: let
    # system should match the system you are running on
    system = "x86_64-linux";
  in {
    devShells."${system}".default = let
      pkgs = import nixpkgs { inherit system; };
    in pkgs.mkShell {
      packages = with pkgs; [
        gh
        gnumake
        nodejs
        docker
        prettier
        eslint
        typescript-language-server
        vscode-langservers-extracted
      ];

      shellHook = ''
        echo "draw a card."
      '';
    };
  };
}
