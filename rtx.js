const v = require('vec3');
const sharp = require('sharp');

const Color = require('./color');
const {Sphere,Cube} = require('./shapes');
const {GlowPoint} = require('./objects');

// SETTINGS

var camerapos = v(0,0,3);
var camerasize = 5; // the size of the camera aperture
var cameralength = 2; // the focal length of the camera
var resolution = '200x200';
var precision = 10; // how detailed the raytracing will be (less is worse, more is better)
var maxrange = 50; // maximum range for the raycasts
var voidcolor = 0x600000; // the color to display when the ray did ont hit anything

// All of the shapes  of the scene
var shapes = [
    new Sphere(v(0,0,8), 1, 0x0000ff),
    new Sphere(v(-1.5,-0.5,7), 0.5, 0xff0000),
    new Cube(  v(0,-10,0), v(30,4,30), 0x00ff00),
    new Sphere( v(2,0,7), 1, 0xffffff )
]
shapes[0].reflective = 1; // sets the first shape to be reflective

// All the objects of the scene
var objects = [ ];

// render settings
var enable_shadows = true;
var enable_reflections = true;
var max_reflections = 10;
var lightpos = v(0,5,3);

// END OF SETTINGS

let [_,rw,rh] = resolution.match(/^(\d+)x(\d+)$/).map(r=>Number(r));
console.log(rh,rw,precision);

function calculateColor(source,direction,bouncesLeft) {
    ray = source.clone();
    let i = 0;
    while (true) {
        if (i > precision * maxrange) break;
        ray = ray.offset(direction.x/precision,direction.y/precision,direction.z/precision);
        for (let obj of shapes) {
            // shadow calculation
            if (obj.type == 'shape' && obj.intersects(ray)) {
                let hit = false;
                let color = Color(obj.color);
                if (enable_shadows) {
                    let ld = v(lightpos.x-ray.x,lightpos.y-ray.y,lightpos.z-ray.z).unit();
                    let rr = ray.clone();
                    rr = rr.offset(ld.x/precision,ld.y/precision,ld.z/precision);
                    while (true) {
                        rr = rr.offset(ld.x/precision,ld.y/precision,ld.z/precision);
                        if (lightpos.distanceTo(rr)<1/precision*1.5) break;
                        let dd = false;
                        for (let objj of shapes) {
                            if (objj.intersects(rr)) {
                                hit = true;
                                dd = true;
                                break;
                            }
                        }
                        if (dd) break;
                    }
                }
                // reflection calculation
                if (enable_reflections&&obj.reflective>0&&bouncesLeft>0) {
                    let n = v(ray.x-obj.pos.x,ray.y-obj.pos.y,ray.z-obj.pos.z).unit();
                    let p = 2*direction.dot(n.unit());
                    try {
                        let m = n.unit().scale(v);
                        let rd = direction.minus(v(m,m,m));
                        color = Color(obj.color).blend(Color(calculateColor(ray.clone(),rd,bouncesLeft-1)),obj.reflective);
                    } catch (e) {
                        console.error(`\x1b[31m`,e,`\x1b[m`);
                    }
                }
                // new color to apply if the point is in shadow
                if (hit)
                    color = Color(color).map(c=>c/4);
                return Color(color);
            }
        }
        for (let obj of objects) {
            if (obj.intersects(ray)) {
                let {color,blend} = obj.blend(ray);
                return Color(calculateColor(ray.clone(),direction,bouncesLeft)).blend(color,blend);
            }
        }
        i++;
    }
    return voidcolor;
}

let imageArray = Array(rh).fill().map(p=>Array(rw).fill().map(p=>voidcolor));

let progress = ``;
let begin = Date.now();
let l = -Infinity;
for (let px = 0; px < rw; px++) for (let py = 0; py < rh; py++) {
    let direction = v(
        camerasize/2-px/rw*camerasize,
        camerasize/2-py/rh*camerasize,
        cameralength
    ).unit();
    let ray = camerapos.clone();
    imageArray[py][px] = Color(calculateColor(ray,direction,max_reflections)).toNumber();
    op = progress;
    progress = `${(Math.round(px/rw*100*100)/100).toFixed(2)}%`;
    if (Date.now()-l > 100) {
        process.stdout.write(`\x1b[1G\x1b[2K${progress} ETA: ${Math.floor(Math.round((((rw/(px?px:1)*(Date.now()-begin)))-(Date.now()-begin))/1000)/60)}:${Math.round((((rw/(px?px:1)*(Date.now()-begin)))-(begin-Date.now()))/1000)%60}`);
        l = Date.now();
    }
}

let end = Date.now();
console.log();

function fmtTime(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    } else
    if (ms < 60000) {
        return `${ms/1000}s`;
    } else
    if (ms < 3600000) {
        return `${Math.floor(ms/60000)}m ${Math.floor(ms/1000)%60}s`;
    } else
    if (ms < 86400000) {
        return `${Math.floor(ms/3600000)}h ${Math.floor(ms/60000)%60}m`;
    } else {
        return `${Math.floor(ms/86400000)}d ${Math.floor(ms/3600000)%24}h`
    }
}

let diff = end-begin;
console.log(`Done in ${fmtTime(diff)}`);

let imageBuffer = Buffer.from(imageArray.flat().map(p=>[(p&0x0000ff),(p&0x00ff00)>>8,(p&0xff0000)>>16,]).flat());
let fn = `${resolution}_${precision}_${Date.now().toString(36)}.png`;
sharp(imageBuffer,{'raw':{channels:3,width:rw,height:rh}})
    .png()
    .toFile(fn);

console.log(`saved as ${fn}`);