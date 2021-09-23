
function nextSeed(seed) {
    return (seed*10)%1 + (Math.floor(seed*10) * Math.pow(10, -10));
}

function randomS(a, b, s) {
    return a + s*(b-a);
}

function colorBetween(c1, c2, percentage) {
    let newColor = [];
    
    
    for (let i = 0; i < c1.length; i++) {
        newColor.push(c1[i] + (c2[i] - c1[i]) * percentage);
    }

    return newColor;
}

// папратово листо - конструктор
function Tree(params)
{
    pushMatrix();

    this.length = params.len || 1;
    this.seed = params.seed || Math.random();
    this.growth = params.growth || 0.95;
    this.minLen = params.minLen || 0.03;
    this.straddle = params.straddle || 60;
    this.wiggle = params.wiggle || 10;
    this.growthFalloff = params.growthFalloff || 0.93;
    this.spread = params.spread || 0.4;
    this.center = params.center || [0,0,0];
    this.color = params.color || [0.4,0.2,0];
    this.leafColor = params.leafColor || [0, 1, 0];
    this.colorOffset = params.colorOffset || 1;
    this.branchRotations = params.branchRotations || 0;
    this.minBranching = params.minBranching || 2;
    this.maxBranching = params.maxBranching || 2;

    this.data = [];

    const F = (d) => {
        this.data.push(glmat[12],glmat[13],glmat[14]);
        this.data.push(col[0],col[1],col[2]);
        translate([d,0,0]);
        this.data.push(glmat[12],glmat[13],glmat[14]);
        this.data.push(col[0],col[1],col[2]);
    }

    const branch = (n,len,seed) =>
    {
        if (!n) return;
        if (len < this.minLen) return;
        if (n<6) n=6;
        for (var i=0; i<n; i++)
        {

            let rot = seed*360;
            let nextLen = len*this.spread*Math.pow(this.growthFalloff,i);
            
            col = colorBetween(this.leafColor, this.color, Math.min(1, len  / (this.length * this.colorOffset))); 
            // col = [len/3,0.8-5*len,0];

            seed = nextSeed(seed);
            zRotate(randomS(-this.wiggle, this.wiggle, seed));
            F(len*2); 
            
            seed = nextSeed(seed);
            let branches = Math.round(randomS(this.minBranching, this.maxBranching, seed));

            for (let i = 0; i < branches; i++) {
                seed = nextSeed(seed);
                pushMatrix();
                    xRotate(rot + i*360/branches + randomS(-this.branchRotations, this.branchRotations, seed));
                    seed = nextSeed(seed);
                    yRotate(this.straddle);
                    branch(n-i, nextLen, seed);
                popMatrix();
            }
            
            len = len * this.growth;
        }
        F(len/2);
        branch(n-3,len/4, seed);
    }


    identity();
    zRotate(-90)
    branch(6, this.length, this.seed);
    
    this.buf = gl.createBuffer();
    this.n = this.data.length/6;
    this.size = 1;

    popMatrix();
}

Tree.prototype.draw = function()
{
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
    gl.enableVertexAttribArray(aXYZ);
    gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,6*FLOATS,0*FLOATS);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,6*FLOATS,3*FLOATS);

    identity();
    xRotate(-90);
    pushMatrix();
        translate(this.center);
        scale([this.size,this.size,this.size]);
        useMatrix();
        gl.drawArrays(gl.LINES,0,this.n);
    popMatrix();
}

Tree.prototype.free = function()
{
    gl.deleteBuffer(this.buf);
}

////

function Tree3D(params)
{
    this.length = params.len || 1;
    this.seed = params.seed || Math.random();
    this.growth = params.growth || 0.95;
    this.minLen = params.minLen || 0.03;
    this.straddle = params.straddle || 60;
    this.wiggle = params.wiggle || 10;
    this.growthFalloff = params.growthFalloff || 0.93;
    this.spread = params.spread || 0.4;
    this.center = params.center || [0,0,0];
    this.color = params.color || [0.4,0.2,0];
    this.leafColor = params.leafColor || [0, 1, 0];
    this.colorOffset = params.colorOffset || 1;
    this.branchRotations = params.branchRotations || 0;
    this.minBranching = params.minBranching || 2;
    this.maxBranching = params.maxBranching || 2;
    this.width = params.width || 10;

    this.data = [];
    this.cylinder = new Cylinder([0,0,0], 0.1, 1);
    this.cylinder.color = [1 ,0 ,0]

    const F = (d) => {
        this.cylinder.color = [col[0],col[1],col[2]];
        this.cylinder.height = d;
        this.cylinder.size = this.width * d / 50;
        this.cylinder.draw();
        translate([0, 0, d]);
    }

    this.branch = (n,len,seed) =>
    {
        if (!n) return;
        if (len < this.minLen) return;
        if (n<6) n=6;
        for (var i=0; i<n; i++)
        {

            let rot = seed*360;
            let nextLen = len*this.spread*Math.pow(this.growthFalloff,i);
            
            col = colorBetween(this.leafColor, this.color, Math.min(1, len  / (this.length * this.colorOffset))); 
            // col = [len/3,0.8-5*len,0];

            seed = nextSeed(seed);
            yRotate(randomS(-this.wiggle, this.wiggle, seed));
            F(len*2); 
            
            seed = nextSeed(seed);
            let branches = Math.round(randomS(this.minBranching, this.maxBranching, seed));

            for (let i = 0; i < branches; i++) {
                seed = nextSeed(seed);
                pushMatrix();
                    zRotate(rot + i*360/branches + randomS(-this.branchRotations, this.branchRotations, seed));
                    seed = nextSeed(seed);
                    xRotate(this.straddle);
                    this.branch(n-i, nextLen, seed);
                popMatrix();
            }
            len = len * this.growth;
        }
        F(len/2);
        this.branch(n-3,len/4, seed);
    }

    this.size = 1;

}

// папратово листо - рисуване
Tree3D.prototype.draw = function()
{
    identity();
    this.branch(6, this.length, this.seed);
}

// папратово листо - деструктор
Tree3D.prototype.free = function()
{
    gl.deleteBuffer(this.buf);
}