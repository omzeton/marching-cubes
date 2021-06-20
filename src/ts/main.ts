import * as THREE from "three";
import * as dat from "dat.gui";
import SimplexNoise from "simplex-noise";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FieldArea, GUISettings } from "./types";

const map = (value: number, x1: number, y1: number, x2: number, y2: number): number => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
const lerp = (start: number, end: number, amt: number): number => (1 - amt) * start + amt * end;

class Renderer {
    readonly _camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
    readonly _scene: THREE.Scene = new THREE.Scene();
    readonly _renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    readonly _controls: OrbitControls = new OrbitControls(this._camera, this._renderer.domElement);
    readonly _dimensions: FieldArea = { height: 20, width: 20, depth: 20 };
    readonly _gui: dat.GUI = new dat.GUI();
    _settings: GUISettings = { sRange: 0 };
    _shapeGroup: THREE.Group = new THREE.Group();
    _noise: SimplexNoise = new SimplexNoise(Date.now().toString());
    _res: number = 2;
    _time: number = 0;

    constructor() {
        this.init();
        this.setup();
        this.settings();
        this.animation();
        this.onResize();
    }

    private init() {
        this._camera.position.z = 40;
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setClearColor(0x313131, 1);
        document.body.appendChild(this._renderer.domElement);
    }

    private animation() {
        this._time += 0.1;
        this.applyNoiseValues();
        this._renderer.render(this._scene, this._camera);
        window.requestAnimationFrame(this.animation.bind(this));
    }

    private onResize() {
        window.addEventListener("resize", () => {
            this._camera.aspect = window.innerWidth / window.innerHeight;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    private settings() {
        this._gui.add(this._settings, "sRange", 0, 1, 0.05);
    }

    private setup() {
        this.createField();
        this.applyNoiseValues();
    }

    private createField() {
        const { height, width, depth } = this._dimensions;
        for (let x = 0; x < width; x += this._res) {
            for (let y = 0; y < height; y += this._res) {
                for (let z = 0; z < depth; z += this._res) {
                    const color = new THREE.Color("rgb(255, 255, 255)");
                    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                    const material = new THREE.MeshBasicMaterial({ color });
                    material.transparent = true;
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(x, y, z);
                    this._shapeGroup.add(cube);
                }
            }
        }
        this._shapeGroup.position.set(-width / 2, -height / 2, -depth / 2);
        this._scene.add(this._shapeGroup);
    }

    private applyNoiseValues() {
        const { height, width, depth } = this._dimensions;
        for (let x = 0; x < width; x += this._res) {
            for (let y = 0; y < height; y += this._res) {
                for (let z = 0; z < depth; z += this._res) {
                    const frequency = 0.05;
                    const final = this._noise.noise3D((x + this._time) * frequency, (y + this._time) * frequency, (z + this._time) * frequency);
                    const c = Math.floor(map(final, -1, 1, 0, 255));
                    const color = new THREE.Color(`rgb(${c}, ${c}, ${c})`);
                    const meshes = this._shapeGroup.children as any[]; // THREE.js types are wrong :((
                    meshes.forEach(mesh => {
                        if (mesh.position.x === x && mesh.position.y === y && mesh.position.z === z) {
                            mesh.material.color = color;
                            if (mesh.material.color.r <= this._settings.sRange) {
                                mesh.material.opacity = 0;
                            } else {
                                mesh.material.opacity = 1;
                            }
                        }
                    });
                }
            }
        }
    }
}

new Renderer();
