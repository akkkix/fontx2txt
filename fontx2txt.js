const fs = require("fs");
var fnt = fs.readFileSync(process.argv[2]);

var fontx = {};
fontx.magic = ""
for(var i = 0;i<6;i++){
    fontx.magic += String.fromCharCode(fnt.readUInt8(i))
}
fontx.fontname = ""
for(var i = 0;i<8;i++){
    fontx.fontname += String.fromCharCode(fnt.readUInt8(6+i))
}
fontx.xsize = fnt.readUInt8(14)
fontx.ysize = fnt.readUInt8(15)
fontx.codetype = fnt.readUInt8(16)

var skip;
var total;
if(fontx.codetype == 1){
    fontx.tnum = fnt.readUInt8(17)
    fontx.block = []
    for(var i =0;i<fontx.tnum;i++){
        fontx.block.push({startcode: fnt.readUInt16LE(18+i*4),endcode:fnt.readUInt16LE(18+i*4+2) })
    }
    total = 0
    for(blk of fontx.block){
        total += blk.endcode - blk.startcode + 1
    }
    skip = 17+fontx.tnum*4
}else if(fontx.codetype == 0){
    fontx.tnum = 1
    fontx.block = [{startcode: 0 ,endcode: 255}]
    total = 256
    skip = 16
}

fontx.bitmap = []
for(var i = 0;i<total;i++){
    var bmp = []
    for(var j = 0;j < Math.ceil(fontx.xsize/8)*fontx.ysize;j++){
        bmp.push(fnt.readUInt8(skip+1+Math.ceil(fontx.xsize/8)*fontx.ysize*i+j))
    }
    fontx.bitmap.push(bmp)
}

console.log("fontname: " + fontx.fontname)
console.log("xsize: " + fontx.xsize)
console.log("ysize: " + fontx.ysize)
console.log("codetype: " + fontx.codetype)

console.log("len: " + fontx.bitmap.length)
console.log("")

var str = ""

var pos = 0;

for(blk of fontx.block){
    for(var offset = 0;offset < (blk.endcode - blk.startcode);offset++){
        console.log("code: 0x" + (blk.startcode + offset).toString(16))
        for(var row = 0;row<fontx.ysize;row++){
            str = ""
            for(var col=0;col<Math.ceil((fontx.xsize)/8);col++){
                str += fontx.bitmap[pos+offset][col+Math.ceil(fontx.xsize/8)*row].toString(2).padStart(8,"0")
            }
            console.log(str.replaceAll("0","□").replaceAll("1","■"))

        }
        console.log("")
    }
    pos += blk.endcode - blk.startcode + 1
}
