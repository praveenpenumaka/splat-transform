# Splat Transform - 3D Gaussian Splat Converter

Splat Transform is an open source CLI tool for converting PLY gaussian splat scenes to compressed.ply format.

## Installation
First install the package globally:
```
npm install -g @playcanvas/splat-transform
```

Then you can invoke the CLI from anywhere as follows:
```
splat-transform input.ply output.compressed.ply
```

## Note
This very first version supports the following:
- reading gaussian splat ply files containing only float32 data
- writing PlayCanvas' compressed.ply format
