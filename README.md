# Splat Transform - 3D Gaussian Splat Converter

Splat Transform is an open source CLI tool for reading gaussian splat PLY files and writing them to PLY, compressed.ply and SOGS format.

Multiple files may be combined and transformed before being written to the output.

## Installation
First install the package globally:
```
npm install -g @playcanvas/splat-transform
```

Then invoke the CLI from anywhere as follows:
```bash
# combine input_a.ply and input_b.ply and write the result to compressed ply format
splat-transform input_a.ply input_b.ply output.compressed.ply

# read input_a.ply and input_b.ply and write the result in SOGS format
splat-transform input_a.ply input_b.ply output/meta.json
```

The input and output files can optionally be transformed. For example:
```
# load input.ply and translate it by (1, 0, 0) and write the result to output.ply
splat-transform input.ply --t 1,0,0 output.ply

# remove entries containing NaN and Inf and bands larger than 2
splat-transform input.ply output.ply --filterNaN --filterBands 2
```

The full list of possible actions are as follows:
```
-translate     -t x,y,z                     Translate splats by (x, y, z)
-rotate        -r x,y,z                     Rotate splats by euler angles (x, y, z) (in degrees)
-scale         -s x                         Scale splats by x (uniform scaling)
-filterNaN     -n                           Remove gaussians containing any NaN or Inf value
-filterByValue -c name,comparator,value     Filter gaussians by a value. Specify the value name, comparator (lt, lte, gt, gte, eq, neq) and value
-filterBands   -h 1                         Filter spherical harmonic band data. Value must be 0, 1, 2 or 3.
```

## Note
This very first version supports the following:
- reading gaussian splat ply files containing only float32 data
- writing PlayCanvas' compressed.ply format
