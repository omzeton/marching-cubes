import * as THREE from "three";
import SimplexNoise from "simplex-noise";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointCoords, FieldArea, a1DArr, a2DArr, a3DArr } from "./types";

const map = (value: number, x1: number, y1: number, x2: number, y2: number): number => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
const lerp = (start: number, end: number, amt: number): number => (1 - amt) * start + amt * end;

class Renderer {
    readonly _camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
    readonly _scene: THREE.Scene = new THREE.Scene();
    readonly _renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    readonly _controls: OrbitControls = new OrbitControls(this._camera, this._renderer.domElement);
    readonly _dimensions: FieldArea = { height: 20, width: 20, depth: 20 };
    _shapeGroup: THREE.Group = new THREE.Group();
    _noise: SimplexNoise = new SimplexNoise(Date.now().toString());
    _res: number = 2;
    _time: number = 0;
    _field: a3DArr = [];

    constructor() {
        this.init();
        this.setup();
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
        this._renderer.render(this._scene, this._camera);
        this._time += 0.1;
        window.requestAnimationFrame(this.animation.bind(this));
    }

    private onResize() {
        window.addEventListener("resize", () => {
            this._camera.aspect = window.innerWidth / window.innerHeight;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    private setup() {
        this.generateNoiseField();
        this.populateField();
    }

    private generateNoiseField() {
        const { height, width, depth } = this._dimensions;
        const zArr: a3DArr = [];
        for (let x = 0; x < width; x += this._res) {
            let xArr: a2DArr = [];
            for (let y = 0; y < height; y += this._res) {
                let yArr: a1DArr = [];
                for (let z = 0; z < depth; z += this._res) {
                    const final = this._noise.noise3D(x, y, z);
                    yArr.push(final);
                }
                xArr.push(yArr);
            }
            zArr.push(xArr);
        }
        this._field = zArr;
    }

    private populateField() {
        const { height, width, depth } = this._dimensions;
        for (let x = 0; x < width - 1; x += this._res) {
            for (let y = 0; y < height - 1; y += this._res) {
                for (let z = 0; z < depth - 1; z += this._res) {
                    this.processSingleCell({
                        noiseVal: this._field[x / this._res][y / this._res][z / this._res],
                        position: {
                            x,
                            y,
                            z,
                        },
                    });
                }
            }
        }
        this._shapeGroup.position.set(-width / 2, -height / 2, -depth / 2);
        this._scene.add(this._shapeGroup!);
    }

    private processSingleCell({ noiseVal, position }: { noiseVal: number; position: PointCoords }) {
        const c = map(noiseVal, -1, 1, 0, 1);
        const color = new THREE.Color(c, c, c);
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(position.x, position.y, position.z);
        this._shapeGroup.add(cube);
    }
}

new Renderer();
