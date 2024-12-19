import { PlyElement, PlyFile, getDataType, shNames } from './ply';

// wraps ply file data and adds helpers accessors
class Splat {
    plyFile: PlyFile;
    vertex: PlyElement;
    properties: { [key: string]: { type: string, offset: number } } = {};

    constructor(plyFile: PlyFile) {
        this.plyFile = plyFile;

        // find vertex element and populate property offsets
        let offset = 0;
        for (let i = 0; i < plyFile.header.elements.length; ++i) {
            const element = plyFile.header.elements[i];
            if (element.name === 'vertex') {
                this.vertex = element;
            }

            for (let j = 0; j < element.properties.length; ++j) {
                const property = element.properties[j];
                if (element === this.vertex) {
                    this.properties[property.name] = {
                        type: property.type,
                        offset
                    };
                }
                offset += getDataType(property.type).BYTES_PER_ELEMENT;
            }
        }
    }

    // return the total number of splats
    get numSplats() {
        return this.vertex?.count;
    }

    // return the number of spherical harmonic bands present in the data
    get numSHBands() {
        return { '9': 1, '24': 2, '-1': 3 }[shNames.findIndex(v => !this.properties.hasOwnProperty(v))] ?? 0;
    }

    // simple iterator that assumes input data is float32
    createIterator(fields: string[], result: number[]) {
        const offsets = fields.map(f => this.properties[f].offset / 4);
        const float32 = new Float32Array(this.plyFile.data.buffer);
        return (index: number) => {
            const base = index * this.vertex.properties.length;
            for (let i = 0; i < fields.length; ++i) {
                result[i] = float32[base + offsets[i]];
            }
        };
    }
}

export { Splat };
