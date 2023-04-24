const PSON = require('pson');
const { raw } = require('body-parser');
const bytebuffer = require('bytebuffer');
const LZString = require('lz-string');

function mapDecodeData(rawdata){
    bytebuffer.prototype.readBoolean = function() {
        return this.readByte() > 0
    }
    
    bytebuffer.prototype.readUTF = function() {
        return this.readString(this.readShort())
    }
    
    bytebuffer.prototype.readUint = bytebuffer.prototype.readUint32
    
    decodeFromDatabase = function(map) { /* arg previously named R5H*/
        var a8k = [arguments];
        b64mapdata = LZString.decompressFromEncodedURIComponent(map);
        binaryReader = bytebuffer.fromBase64(b64mapdata, false);//after this is the important bit
        map = { "v": 1, "s": { "re": false, "nc": false, "pq": 1, "gd": 25, "fl": false }, "physics": { "shapes": [], "fixtures": [], "bodies": [], "bro": [], "joints": [], "ppm": 12 }, "spawns": [], "capZones": [], "m": { "a": "noauthor", "n": "noname", "dbv": 2, "dbid": -1, "authid": -1, "date": "", "rxid": 0, "rxn": "", "rxa": "", "rxdb": 1, "cr": [], "pub": false, "mo": "" } }
        map.v = binaryReader.readShort();
        if (map.v > 13) {
            throw new Error("New map format, this script needs to be updated.");
        }
        map.s.re = binaryReader.readBoolean();
        map.s.nc = binaryReader.readBoolean();
        if (map.v >= 3) {
            map.s.pq = binaryReader.readShort();
        }
        if (map.v >= 4 && map.v <= 12) {
            map.s.gd = binaryReader.readShort();
        } else if (map.v >= 13) {
            map.s.gd = binaryReader.readFloat();
        }
        if (map.v >= 9) {
            map.s.fl = binaryReader.readBoolean();
        }
        map.m.rxn = binaryReader.readUTF();
        map.m.rxa = binaryReader.readUTF();
        map.m.rxid = binaryReader.readUint();
        map.m.rxdb = binaryReader.readShort();
        map.m.n = binaryReader.readUTF();
        map.m.a = binaryReader.readUTF();
        if (map.v >= 10) {
            map.m.vu = binaryReader.readUint();
            map.m.vd = binaryReader.readUint();
        }
        if (map.v >= 4) {
            cr_count = binaryReader.readShort();
            for (cr_iterator = 0; cr_iterator < cr_count; cr_iterator++) {
                map.m.cr.push(binaryReader.readUTF());
            }
        }
        if (map.v >= 5) {
            map.m.mo = binaryReader.readUTF();
            map.m.dbid = binaryReader.readInt();
        }
        if (map.v >= 7) {
            map.m.pub = binaryReader.readBoolean();
        }
        if (map.v >= 8) {
            map.m.dbv = binaryReader.readInt();
        }
        map.physics.ppm = binaryReader.readShort();
        bro_count = binaryReader.readShort();
        for (bro_iterator = 0; bro_iterator < bro_count; bro_iterator++) {
            map.physics.bro[bro_iterator] = binaryReader.readShort();
        }
        shape_count = binaryReader.readShort();
        for (shape_iterator = 0; shape_iterator < shape_count; shape_iterator++) {
            shape_type = binaryReader.readShort();
            if (shape_type == 1) {
                map.physics.shapes[shape_iterator] = {"type":"bx","w":10,"h":40,"c":[0,0],"a":0,"sk":false}
                map.physics.shapes[shape_iterator].w = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].h = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                map.physics.shapes[shape_iterator].a = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].sk = binaryReader.readBoolean();
            }
            if (shape_type == 2) {
                map.physics.shapes[shape_iterator] = {"type":"ci","r":25,"c":[0,0],"sk":false}
                map.physics.shapes[shape_iterator].r = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                map.physics.shapes[shape_iterator].sk = binaryReader.readBoolean();
            }
            if (shape_type == 3) {
                map.physics.shapes[shape_iterator] = {"type":"po","v":[],"s":1,"a":0,"c":[0,0]}
                map.physics.shapes[shape_iterator].s = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].a = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                point_count = binaryReader.readShort();
                map.physics.shapes[shape_iterator].v = [];
                for (point_iterator = 0; point_iterator < point_count; point_iterator++) {
                    map.physics.shapes[shape_iterator].v.push([binaryReader.readDouble(), binaryReader.readDouble()]);
                }
            }
        }
        a8k[31] = binaryReader.readShort();
        for (a8k[89] = 0; a8k[89] < a8k[31]; a8k[89]++) {
            map.physics.fixtures[a8k[89]] = {"n":"Def Fix","fr":0.3,"fp":null,"re":0.8,"de":0.3,"f":5209260,"d":false,"np":false,"ng":false}
            map.physics.fixtures[a8k[89]].sh = binaryReader.readShort();
            map.physics.fixtures[a8k[89]].n = binaryReader.readUTF();
            map.physics.fixtures[a8k[89]].fr = binaryReader.readDouble();
            if (map.physics.fixtures[a8k[89]].fr == Number.MAX_VALUE) {
                map.physics.fixtures[a8k[89]].fr = null;
            }
            a8k[22] = binaryReader.readShort();
            if (a8k[22] == 0) {
                map.physics.fixtures[a8k[89]].fp = null;
            }
            if (a8k[22] == 1) {
                map.physics.fixtures[a8k[89]].fp = false;
            }
            if (a8k[22] == 2) {
                map.physics.fixtures[a8k[89]].fp = true;
            }
            map.physics.fixtures[a8k[89]].re = binaryReader.readDouble();
            if (map.physics.fixtures[a8k[89]].re == Number.MAX_VALUE) {
                map.physics.fixtures[a8k[89]].re = null;
            }
            map.physics.fixtures[a8k[89]].de = binaryReader.readDouble();
            if (map.physics.fixtures[a8k[89]].de == Number.MAX_VALUE) {
                map.physics.fixtures[a8k[89]].de = null;
            }
            map.physics.fixtures[a8k[89]].f = binaryReader.readUint();
            map.physics.fixtures[a8k[89]].d = binaryReader.readBoolean();
            map.physics.fixtures[a8k[89]].np = binaryReader.readBoolean();
            if (map.v >= 11) {
                map.physics.fixtures[a8k[89]].ng = binaryReader.readBoolean();
            }
            if (map.v >= 12) {
                map.physics.fixtures[a8k[89]].ig = binaryReader.readBoolean();
            }
        }
        a8k[41] = binaryReader.readShort();
        for (a8k[20] = 0; a8k[20] < a8k[41]; a8k[20]++) {
            map.physics.bodies[a8k[20]] = {"type":"s","n":"Unnamed","p":[0,0],"a":0,"fric":0.3,"fricp":false,"re":0.8,"de":0.3,"lv":[0,0],"av":0,"ld":0,"ad":0,"fr":false,"bu":false,"cf":{"x":0,"y":0,"w":true,"ct":0},"fx":[],"f_c":1,"f_p":true,"f_1":true,"f_2":true,"f_3":true,"f_4":true} // this returns:
            // {'type': 's', 'n': 'Unnamed', 'p': [0, 0], 'a': 0, 'fric': 0.3, 'fricp': False, 're': 0.8, 'de': 0.3, 'lv': [0, 0], 'av': 0, 'ld': 0, 'ad': 0, 'fr': False, 'bu': False, 'cf': {'x': 0, 'y': 0, 'w': True, 'ct': 0}, 'fx': [], 'f_c': 1, 'f_p': True, 'f_1': True, 'f_2': True, 'f_3': True, 'f_4': True}
            map.physics.bodies[a8k[20]].type = binaryReader.readUTF();
            map.physics.bodies[a8k[20]].n = binaryReader.readUTF();
            map.physics.bodies[a8k[20]].p = [binaryReader.readDouble(), binaryReader.readDouble()];
            map.physics.bodies[a8k[20]].a = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].fric = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].fricp = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].re = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].de = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].lv = [binaryReader.readDouble(), binaryReader.readDouble()];
            map.physics.bodies[a8k[20]].av = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].ld = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].ad = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].fr = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].bu = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].cf.x = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].cf.y = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].cf.ct = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].cf.w = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_c = binaryReader.readShort();
            map.physics.bodies[a8k[20]].f_1 = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_2 = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_3 = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_4 = binaryReader.readBoolean();
            if (map.v >= 2) {
                map.physics.bodies[a8k[20]].f_p = binaryReader.readBoolean();
            }
            a8k[50] = binaryReader.readShort();
            for (a8k[66] = 0; a8k[66] < a8k[50]; a8k[66]++) {
                map.physics.bodies[a8k[20]].fx.push(binaryReader.readShort());
            }
        }
        a8k[48] = binaryReader.readShort();
        for (a8k[36] = 0; a8k[36] < a8k[48]; a8k[36]++) {
            map.spawns[a8k[36]] = {"x":400,"y":300,"xv":0,"yv":0,"priority":5,"r":true,"f":true,"b":true,"gr":false,"ye":false,"n":"Spawn"};
            a8k[80] = map.spawns[a8k[36]];
            a8k[80].x = binaryReader.readDouble();
            a8k[80].y = binaryReader.readDouble();
            a8k[80].xv = binaryReader.readDouble();
            a8k[80].yv = binaryReader.readDouble();
            a8k[80].priority = binaryReader.readShort();
            a8k[80].r = binaryReader.readBoolean();
            a8k[80].f = binaryReader.readBoolean();
            a8k[80].b = binaryReader.readBoolean();
            a8k[80].gr = binaryReader.readBoolean();
            a8k[80].ye = binaryReader.readBoolean();
            a8k[80].n = binaryReader.readUTF();
        }
        a8k[40] = binaryReader.readShort();
        for (a8k[18] = 0; a8k[18] < a8k[40]; a8k[18]++) {
            map.capZones[a8k[18]] = {"n":"Cap Zone","ty":1,"l":10,"i":-1}
            map.capZones[a8k[18]].n = binaryReader.readUTF();
            map.capZones[a8k[18]].l = binaryReader.readDouble();
            map.capZones[a8k[18]].i = binaryReader.readShort();
            if (map.v >= 6) {
                map.capZones[a8k[18]].ty = binaryReader.readShort();
            }
        }
        a8k[39] = binaryReader.readShort();
        for (a8k[94] = 0; a8k[94] < a8k[39]; a8k[94]++) {
            a8k[75] = binaryReader.readShort();
            if (a8k[75] == 1) {
                map.physics.joints[a8k[94]] = {"type":"rv","d":{"la":0,"ua":0,"mmt":0,"ms":0,"el":false,"em":false,"cc":false,"bf":0,"dl":true},"aa":[0,0]}
                a8k[53] = map.physics.joints[a8k[94]];
                a8k[53].d.la = binaryReader.readDouble();
                a8k[53].d.ua = binaryReader.readDouble();
                a8k[53].d.mmt = binaryReader.readDouble();
                a8k[53].d.ms = binaryReader.readDouble();
                a8k[53].d.el = binaryReader.readBoolean();
                a8k[53].d.em = binaryReader.readBoolean();
                a8k[53].aa = [binaryReader.readDouble(), binaryReader.readDouble()];
            }
            if (a8k[75] == 2) {
                map.physics.joints[a8k[94]] = {"type":"d","d":{"fh":0,"dr":0,"cc":false,"bf":0,"dl":true},"aa":[0,0],"ab":[0,0]}
                a8k[27] = map.physics.joints[a8k[94]];
                a8k[27].d.fh = binaryReader.readDouble();
                a8k[27].d.dr = binaryReader.readDouble();
                a8k[27].aa = [binaryReader.readDouble(), binaryReader.readDouble()];
                a8k[27].ab = [binaryReader.readDouble(), binaryReader.readDouble()];
            }
            if (a8k[75] == 3) {
                map.physics.joints[a8k[94]] = {"type":"lpj","d":{"cc":false,"bf":0,"dl":true},"pax":0,"pay":0,"pa":0,"pf":0,"pl":0,"pu":0,"plen":0,"pms":0}
                a8k[23] = map.physics.joints[a8k[94]];
                a8k[23].pax = binaryReader.readDouble();
                a8k[23].pay = binaryReader.readDouble();
                a8k[23].pa = binaryReader.readDouble();
                a8k[23].pf = binaryReader.readDouble();
                a8k[23].pl = binaryReader.readDouble();
                a8k[23].pu = binaryReader.readDouble();
                a8k[23].plen = binaryReader.readDouble();
                a8k[23].pms = binaryReader.readDouble();
            }
            if (a8k[75] == 4) {
                map.physics.joints[a8k[94]] = {"type":"lsj","d":{"cc":false,"bf":0,"dl":true},"sax":0,"say":0,"sf":0,"slen":0}
                a8k[47] = map.physics.joints[a8k[94]];
                a8k[47].sax = binaryReader.readDouble();
                a8k[47].say = binaryReader.readDouble();
                a8k[47].sf = binaryReader.readDouble();
                a8k[47].slen = binaryReader.readDouble();
            }
            map.physics.joints[a8k[94]].ba = binaryReader.readShort();
            map.physics.joints[a8k[94]].bb = binaryReader.readShort();
            map.physics.joints[a8k[94]].d.cc = binaryReader.readBoolean();
            map.physics.joints[a8k[94]].d.bf = binaryReader.readDouble();
            map.physics.joints[a8k[94]].d.dl = binaryReader.readBoolean();
            ;
        }
        return map;
    }
    return decodeFromDatabase(rawdata);
}

function mapDecode(mapdata){
    try {
        let decodedmap = mapDecodeData(mapdata);
        return decodedmap;
    } catch (error) {
        console.error(error);
        return false;
    }
}


// IS

var ISpsonpair = new PSON.StaticPair(["physics", "shapes", "fixtures", "bodies", "bro", "joints", "ppm", "lights", "spawns", "lasers", "capZones", "type", "w", "h", "c", "a", "v", "l", "s", "sh", "fr", "re", "de", "sn", "fc", "fm", "f", "d", "n", "bg", "lv", "av", "ld", "ad", "fr", "bu", "cf", "rv", "p", "d", "bf", "ba", "bb", "aa", "ab", "axa", "dr", "em", "mmt", "mms", "ms", "ut", "lt", "New body", "Box Shape", "Circle Shape", "Polygon Shape", "EdgeChain Shape", "priority", "Light", "Laser", "Cap Zone", "BG Shape", "Background Layer", "Rotate Joint", "Slider Joint", "Rod Joint", "Gear Joint", 65535, 16777215])

function ISdecode (rawdata) {
    rawdata_caseflipped = ""
    for (i = 0; i < rawdata.length; i++) {
      if (i <= 100 && rawdata.charAt(i) === rawdata.charAt(i).toLowerCase()) {
        rawdata_caseflipped += rawdata.charAt(i).toUpperCase();
      } else if (i <= 100 && rawdata.charAt(i) === rawdata.charAt(i).toUpperCase()) {
        rawdata_caseflipped += rawdata.charAt(i).toLowerCase();
      } else {
        rawdata_caseflipped += rawdata.charAt(i);
      }
    }
    //next lines
    
    data_deLZd = LZString.decompressFromEncodedURIComponent(rawdata_caseflipped);
    databuffer = bytebuffer.fromBase64(data_deLZd);
    data = ISpsonpair.decode(databuffer.buffer)
    return data
}

// decode the thigie

function ISencode(obj) {
    data = ISpsonpair.encode(obj)
    b64 = data.toBase64()
    lzd = LZString.compressToEncodedURIComponent(b64)
    
    caseflipped = ""
    for (i = 0; i < lzd.length; i++) {
      if (i <= 100 && lzd.charAt(i) === lzd.charAt(i).toLowerCase()) {
        caseflipped += lzd.charAt(i).toUpperCase();
      } else if (i <= 100 && lzd.charAt(i) === lzd.charAt(i).toUpperCase()) {
        caseflipped += lzd.charAt(i).toLowerCase();
      } else {
        caseflipped += lzd.charAt(i);
      }
    }

    
    return caseflipped
}

module.exports = {
    mapDecode,
    ISdecode,
    ISencode,
}