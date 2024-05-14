{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  name = "mcas";
  packages = with pkgs; [ imagemagick ];
}
