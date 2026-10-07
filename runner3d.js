import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const canvas = document.querySelector('#runner-canvas');
const sceneHost = document.querySelector('.scene');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(26, 1, .1, 100);
camera.position.set(0, 1.15, 4.8);
camera.lookAt(0, 1.1, 0);
const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xaed9ff, 0x152536, 2.2));
const key = new THREE.DirectionalLight(0xffd3b0, 2.3); key.position.set(-2,4,3); scene.add(key);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({color:0x152833, transparent:true, opacity:.78}));
ground.rotation.x = -Math.PI/2; ground.position.y = .02; scene.add(ground);

let model, mixer, activeAction, clock = new THREE.Clock(), rig = {};
new FBXLoader().load('Rose.fbx', object => {
  model = object;
  const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const scale = 2.05 / Math.max(size.y, .01); model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  model.traverse(part => { if (part.isMesh) { part.castShadow = true; part.material.transparent = true; } });
  model.traverse(part => { if (part.isBone) rig[part.name] = part; });
  scene.add(model);
  if (object.animations?.length) {
    mixer = new THREE.AnimationMixer(model);
    // This FBX contains a clip named FreeRunning; the first clip is a bind/pose clip.
    const runClip = object.animations.find(clip => /free.?running|run|jog|walk/i.test(clip.name)) || object.animations[object.animations.length - 1];
    activeAction = mixer.clipAction(runClip);
    activeAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
  }
}, undefined, error => console.warn('Runner FBX could not load:', error));

function resize(){const r=sceneHost.getBoundingClientRect(); renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(sceneHost); resize();
function loop(){
  requestAnimationFrame(loop);
  const dt=clock.getDelta(), now=performance.now()*.001;
  const mode=(document.querySelector('#activeMode')?.textContent||'WALK').toLowerCase();
  const speed=mode==='sprint'?8:mode==='run'?6.5:mode==='jog'?4.8:2.8, swing=Math.sin(now*speed), opposite=-swing;
  if(mixer){mixer.timeScale=mode==='sprint'?1.35:mode==='run'?1.15:mode==='jog'?1:.78; mixer.update(dt)}
  // Procedural fallback/overlay: guarantees a visible running gait for this rig.
  if(rig.J_Bip_L_UpperArm){rig.J_Bip_L_UpperArm.rotation.x=swing*.72; rig.J_Bip_L_UpperArm.rotation.z=swing*.42; rig.J_Bip_L_LowerArm.rotation.x=swing*.35;}
  if(rig.J_Bip_R_UpperArm){rig.J_Bip_R_UpperArm.rotation.x=opposite*.72; rig.J_Bip_R_UpperArm.rotation.z=opposite*.42; rig.J_Bip_R_LowerArm.rotation.x=opposite*.35;}
  if(rig.J_Bip_L_UpperLeg){rig.J_Bip_L_UpperLeg.rotation.x=opposite*.5; rig.J_Bip_L_LowerLeg.rotation.x=Math.max(0,-opposite)*.45;}
  if(rig.J_Bip_R_UpperLeg){rig.J_Bip_R_UpperLeg.rotation.x=swing*.5; rig.J_Bip_R_LowerLeg.rotation.x=Math.max(0,-swing)*.45;}
  if(model){model.rotation.y=Math.sin(now*.45)*.08; model.position.x=Math.sin(now*1.2)*.06; model.position.y=Math.abs(Math.sin(now*speed))*.035}
  renderer.render(scene,camera)
} loop();
