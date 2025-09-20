import { open, unlink, FileHandle } from 'node:fs/promises';
import os from 'node:os';

import { html, css, js } from '@playcanvas/supersplat-viewer';
import { Vec3 } from 'playcanvas';

import { writeCompressedPly } from './write-compressed-ply';
import { writeSog } from './write-sog';
import { PlyData } from '../readers/read-ply';


const pad = (text: string, spaces: number) => {
    const whitespace = ' '.repeat(spaces);
    return text.split('\n').map(line => whitespace + line).join('\n');
};
const encodeBase64 = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return Buffer.from(binary, 'binary').toString('base64');
};


const generateEncodedContent = async (plyData: PlyData, fileType: 'sog' | 'ply', iterations: number, gpu: string) => {
    const tempPath = `${os.tmpdir()}/temp.${fileType}`;
    const tempFile = await open(tempPath, 'w+');
    switch (fileType) {
        case 'sog':
            await writeSog(tempFile, plyData.elements[0].dataTable, 'temp.sog', iterations, gpu ? 'gpu' : 'cpu');
            break;
        case 'ply':
            await writeCompressedPly(tempFile, plyData.elements[0].dataTable);
            break;
    }
    const openFile = await open(tempPath, 'r');
    const compressedContent = encodeBase64(await openFile.readFile());
    await openFile.close();
    await unlink(tempPath);
    return `fetch("data:application/zip;base64,${compressedContent}")`;
};

const writeHtml = async (fileHandle: FileHandle, plyData: PlyData, camera: Vec3, target: Vec3, fileType: 'sog' | 'ply', iterations: number, gpu: string) => {

    const experienceSettings = {
        camera: {
            fov: 50,
            position: [camera.x, camera.y, camera.z],
            target: [target.x, target.y, target.z],
            startAnim: 'none',
            animTrack: undefined as unknown as string | undefined
        },
        background: {
            color: [0.4, 0.4, 0.4]
        },
        animTracks: [] as unknown[]
    };

    const requiredFileType = fileType === 'sog' ? 'sog' : 'ply';

    const encodedContent = await generateEncodedContent(plyData, requiredFileType, iterations, gpu);

    const style = '<link rel="stylesheet" href="./index.css">';
    const script = '<script type="module" src="./index.js"></script>';
    const contentUrl = './scene.compressed.ply';
    const settings = 'settings: fetch(settingsUrl).then(response => response.json())';
    const content = 'fetch(contentUrl)';

    const generatedHtml = html
    .replace(style, `<style>\n${pad(css, 12)}\n        </style>`)
    .replace(script, `<script type="module">\n${pad(js, 12)}\n        </script>`)
    .replace(settings, `settings: ${JSON.stringify(experienceSettings)}`)
    .replace(contentUrl, `./scene.compressed.${requiredFileType}`)
    .replace(content, `${encodedContent}`);

    await fileHandle.write(new TextEncoder().encode(generatedHtml));

};

export { writeHtml };
