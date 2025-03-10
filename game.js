const RAD = Math.PI / 180;
const scrn = document.getElementById('canvas');
const sctx = scrn.getContext("2d");
scrn.tabIndex = 1;
scrn.addEventListener("click", () => {
    switch (state.curr) {
        case state.getReady:
            state.curr = state.Play;
            formula.changeFormula();
            SFX.start.play();
            break;
        case state.Play:
            bird.flap();
            break;
        case state.gameOver:
            state.curr = state.getReady;
            bird.speed = 0;
            bird.y = 100;
            pipe.pipes = [];
            UI.score.curr = 0;
            SFX.played = false;
            break;
    }
})

scrn.onkeydown = function keyDown(e) {
    if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38)   // Space Key or W key or arrow up
    {
        switch (state.curr) {
            case state.getReady:
                state.curr = state.Play;
                SFX.start.play();
                break;
            case state.Play:
                bird.flap();
                break;
            case state.gameOver:
                state.curr = state.getReady;
                bird.speed = 0;
                bird.y = 100;
                pipe.pipes = [];
                UI.score.curr = 0;
                SFX.played = false;
                break;
        }
    }
}



let frames = 0;
let dx = 2;
const state = {
    curr: 0,
    getReady: 0,
    Play: 1,
    gameOver: 2,

}
const SFX = {
    start: new Audio(),
    flap: new Audio(),
    score: new Audio(),
    hit: new Audio(),
    die: new Audio(),
    played: false
}
const gnd = {
    sprite: new Image(),
    x: 0,
    y: 0,
    draw: function () {
        this.y = parseFloat(scrn.height - this.sprite.height) + 80;
        sctx.drawImage(this.sprite, this.x, this.y);
    },
    update: function () {
        if (state.curr != state.Play) return;
        this.x -= dx;
        this.x = this.x % (this.sprite.width / 3)  ;
    }
};
const bg = {
    sprite: new Image(),
    x: 0,
    y: 0,
    draw: function () {
        y = parseFloat(scrn.height - this.sprite.height + 40);
        sctx.drawImage(this.sprite, this.x, y);
    }
};
const pipe = {
    top: { sprite: new Image() },
    bot: { sprite: new Image() },
    acid: { sprite: new Image() },
    base: { sprite: new Image() },
    gap: 200,
    moved: true,
    pipes: [],
    draw: function () {
        let indice = parseInt(Math.random() * 10 % 2)
        for (let i = 0; i < this.pipes.length; i++) {
            let p = this.pipes[i];
            let elements = [this.acid.sprite, this.base.sprite]
            p.acid.x = p.x - 3
            p.acid.y = p.y + 400
            sctx.drawImage(this.top.sprite, p.x, p.y)
            sctx.drawImage(elements[0], p.acid.x, p.acid.y)

            p.base.x = p.x - 3
            p.base.y = p.y + parseFloat(this.top.sprite.height) + this.gap - 64
            sctx.drawImage(elements[1], p.base.x, p.base.y)
            sctx.drawImage(this.bot.sprite, p.x, p.y + parseFloat(this.top.sprite.height) + this.gap)

            // sctx.lineWidth = "1";
            // sctx.font = "50px Squada One";
            // sctx.fillStyle = "#FFFFFF";
            // sctx.strokeStyle = "#000000";
            // sctx.fillText("-------", p.acid.x, p.acid.y+65);
            // sctx.strokeText("-------", p.acid.x, p.acid.y+65);
            // sctx.lineWidth = "1";
            // sctx.font = "50px Squada One";
            // sctx.fillStyle = "#FFFFFF";
            // sctx.strokeStyle = "#000000";
            // sctx.fillText("-------", p.base.x, p.base.y+20);
            // sctx.strokeText("-------", p.base.x, p.base.y+20);

        }
    },
    update: function () {
        if (state.curr != state.Play) return;
        //Gera os pipes
        if (frames % 100 == 0) {
            this.pipes.push({ x: parseFloat(scrn.width), y: -210 * Math.min(Math.random() + 1, 1.8), acid: { x: 0, y: 0 }, base: { x: 0, y: 0 } });
        }
        //Diminui dx do pipe
        this.pipes.forEach(pipe => {
            pipe.x -= dx;
        })
        //Diminui dx do pipe
        if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
            this.pipes.shift();
            this.moved = true;
        }

    }

};
const bird = {
    animations:
        [
            { sprite: new Image() },
            { sprite: new Image() },
            { sprite: new Image() },
            { sprite: new Image() },
        ],
    rotatation: 0,
    x: 50,
    y: 100,
    speed: 0,
    gravity: .125,
    thrust: 3.6,
    frame: 0,
    draw: function () {
        let h = this.animations[this.frame].sprite.height;
        let w = this.animations[this.frame].sprite.width;
        sctx.save();
        sctx.translate(this.x, this.y);
        sctx.rotate(this.rotatation * RAD);
        sctx.drawImage(this.animations[this.frame].sprite, -w / 2, -h / 2);
        sctx.restore();
    },
    update: function () {
        let r = parseFloat(this.animations[0].sprite.width) / 2;
        switch (state.curr) {
            case state.getReady:
                this.rotatation = 0;
                this.y += (frames % 10 == 0) ? Math.sin(frames * RAD) : 0;
                this.frame += (frames % 10 == 0) ? 1 : 0;
                break;
            case state.Play:
                this.frame += (frames % 5 == 0) ? 1 : 0;
                this.y += this.speed;
                this.setRotation()
                this.speed += this.gravity;
                if (this.y + r >= gnd.y || this.collisioned()) {
                    state.curr = state.gameOver;
                }

                break;
            case state.gameOver:
                this.frame = 1;
                if (this.y + r < gnd.y) {
                    this.y += this.speed;
                    this.setRotation()
                    this.speed += this.gravity * 2;
                }
                else {
                    this.speed = 0;
                    this.y = gnd.y - r;
                    this.rotatation = 90;
                    if (!SFX.played) {
                        SFX.die.play();
                        SFX.played = true;
                    }
                }

                break;
        }
        this.frame = this.frame % this.animations.length;
    },
    flap: function () {
        if (this.y > 0) {
            SFX.flap.play();
            this.speed = -this.thrust;
        }
    },
    setRotation: function () {
        if (this.speed <= 0) {

            this.rotatation = Math.max(-25, -25 * this.speed / (-1 * this.thrust));
        }
        else if (this.speed > 0) {
            this.rotatation = Math.min(90, 90 * this.speed / (this.thrust * 2));
        }
    },
    collisioned: function () {
        if (!pipe.pipes.length) return;

        let bird = this.animations[0].sprite;
        let x = pipe.pipes[0].x;
        let y = pipe.pipes[0].y;
        let acid = pipe.pipes[0].acid;
        let base = pipe.pipes[0].base;
        let r = bird.height / 4 + bird.width / 4;
        let roof = y + parseFloat(pipe.top.sprite.height);
        let floor = roof + pipe.gap;
        let w = parseFloat(pipe.top.sprite.width);
        if (this.x + r >= x) {
            if (this.x + r < x + w) {
                if (this.y - r <= roof || this.y + r >= floor) {
                    SFX.hit.play();
                    return true;
                }

            } else if (pipe.moved) {
                if (acid.y + 75 > this.y) {
                    if(formula.current == "acid"){
                        UI.score.curr+=5;
                        SFX.score.play();
                    }else{
                        SFX.hit.play();
                        return true;
                    }
                    
                }else if (base.y - 10 < this.y) {
                    if(formula.current == "base"){
                        UI.score.curr+=5;
                        SFX.score.play();
                    }else{
                        SFX.hit.play();
                        return true;
                    }
                } else {
                    UI.score.curr++;
                    SFX.score.play();
                }
                formula.changeFormula();
                pipe.moved = false;

            }

        }

    }
};

const formula = {
    base: ["Ca(OH)\u2082", "Mg(OH)\u2082", "Mg(OH)\u2082", "NH\u2084OH", "KOH", "Ba(OH)\u2082", "Al(OH)\u2083", "Zn(OH)\u2082", "AgOH", "Fe(OH)\u2082", "Fe(OH)\u2083"],
    acid: ["HF", "HCI", "HBr", "HI", "H\u2082S", "H\u2082SO\u2084", "H\u2082 SO\u2083", "H\u2083PO\u2084", "H\u2082PO\u2083" , "HCIO", "HCIO\u2082"/*, "HCIO\u2084"*/],
    current: "",
    currentFormula: "",
    changeFormula: function() {
        this.current = parseInt(Math.random() * 10 % 2)%2 ==0?"acid":"base";
        this.currentFormula = this[this.current][parseInt(Math.random() * 10)]
    },
    draw: function () {
        //Draw formula
        sctx.lineWidth = "1";
        sctx.font = "45px Squada One";
        sctx.fillStyle = "#FFFFFF";
        sctx.strokeStyle = "#000000";
        sctx.fillText(this.currentFormula, 0, 50);
        sctx.strokeText(this.currentFormula, 0, 50);
    }
}

const UI = {
    getReady: { sprite: new Image() },
    gameOver: { sprite: new Image() },
    tap: [{ sprite: new Image() },
    { sprite: new Image() }],
    score: {
        curr: 0,
        best: 0,
    },
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    frame: 0,
    draw: function () {
        switch (state.curr) {
            case state.getReady:
                this.y = parseFloat(scrn.height - this.getReady.sprite.height) / 2;
                this.x = parseFloat(scrn.width - this.getReady.sprite.width) / 2;
                this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
                this.ty = this.y + this.getReady.sprite.height - this.tap[0].sprite.height;
                sctx.drawImage(this.getReady.sprite, this.x, this.y);
                sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty)
                break;
            case state.gameOver:
                this.y = parseFloat(scrn.height - this.gameOver.sprite.height) / 2;
                this.x = parseFloat(scrn.width - this.gameOver.sprite.width) / 2;
                this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
                this.ty = this.y + this.gameOver.sprite.height - this.tap[0].sprite.height;
                sctx.drawImage(this.gameOver.sprite, this.x, this.y);
                sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty)
                break;
        }
        this.drawScore();
    },
    drawScore: function () {
        sctx.fillStyle = "#FFFFFF";
        sctx.strokeStyle = "#000000";
        switch (state.curr) {
            case state.Play:
                sctx.lineWidth = "2";
                sctx.font = "35px Squada One";
                sctx.fillText(this.score.curr, scrn.width / 2 - 5, 50);
                sctx.strokeText(this.score.curr, scrn.width / 2 - 5, 50);
                formula.draw()
                break;
            case state.gameOver:
                sctx.lineWidth = "2";
                sctx.font = "40px Squada One";
                let sc = `PONTOS:     ${this.score.curr}`;
                try {
                    this.score.best = Math.max(this.score.curr, localStorage.getItem("best"));
                    localStorage.setItem("best", this.score.best);
                    let bs = `MELHOR:    ${this.score.best}`;
                    sctx.fillText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0);
                    sctx.strokeText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0);
                    sctx.fillText(bs, scrn.width / 2 - 80, scrn.height / 2 + 30);
                    sctx.strokeText(bs, scrn.width / 2 - 80, scrn.height / 2 + 30);
                }
                catch (e) {
                    sctx.fillText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15);
                    sctx.strokeText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15);
                }

                break;
        }
    },
    update: function () {
        if (state.curr == state.Play) return;
        this.frame += (frames % 10 == 0) ? 1 : 0;
        this.frame = this.frame % this.tap.length;
    }

};

gnd.sprite.src = "img/ground.png";
bg.sprite.src = "img/BG.png";
pipe.acid.sprite.src = "img/potionGreen.png"
pipe.base.sprite.src = "img/potionPurple.png"
pipe.top.sprite.src = "img/toppipe.png";
pipe.bot.sprite.src = "img/botpipe.png";
UI.gameOver.sprite.src = "img/go.png";
UI.getReady.sprite.src = "img/getready.png";
UI.tap[0].sprite.src = "img/tap/t0.png";
UI.tap[1].sprite.src = "img/tap/t1.png";
bird.animations[0].sprite.src = "img/bird/b0.png";
bird.animations[1].sprite.src = "img/bird/b1.png";
bird.animations[2].sprite.src = "img/bird/b2.png";
bird.animations[3].sprite.src = "img/bird/b0.png";
SFX.start.src = "sfx/start.wav"
SFX.flap.src = "sfx/flap.wav"
SFX.score.src = "sfx/score.wav"
SFX.hit.src = "sfx/hit.wav"
SFX.die.src = "sfx/die.wav"

gameLoop();

function gameLoop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(gameLoop);
}

function update() {
    bird.update();
    gnd.update();
    pipe.update();
    UI.update();
}
function draw() {
    sctx.fillStyle = "#30c0df";
    sctx.fillRect(0, 0, scrn.width, scrn.height)
    bg.draw();
    pipe.draw();

    bird.draw();
    gnd.draw();
    UI.draw();
}

