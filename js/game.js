// game.js – orquestra alavanca + roleta + física de giro
import { Wheel } from '../js/wheel.js';
import { Lever } from '../js/lever.js';


const segments = [
    'óculos de sol', 'Garrafa de Agua', 'óculos de sol 2', 'Bolsa termica', 'Caneca', 'Pockt cel',
    '20% off', 'óculos de sol 3', 'Avaliação Gratis', 'Sorvete', 'Lenço Magico', 'óculos de Sol 4', 'Tente de novo', 'Sorvete 2'
];


let wheelEl, canvasEl, resultEl;
let rotation = 0; // graus atuais
let angularVel = 0; // graus/seg
let spinning = false;
//let played = false; // 1 jogada por pessoa (local)
let lastTickIndex = -1; // para som de clique por divisão


let sndTick, sndWin;


function init() {
    wheelEl = document.getElementById('wheel');
    canvasEl = document.getElementById('wheelCanvas');
    resultEl = document.getElementById('result');
    sndTick = document.getElementById('sndTick');
    sndWin = document.getElementById('sndWin');


    Wheel.init(canvasEl, segments);
    window.addEventListener('resize', () => Wheel.resize());


    // Alavanca
    const knob = document.getElementById('leverKnob');
    const fill = document.getElementById('leverFill');
    Lever.init(knob, fill, {
        max: 220,
        onRelease: onLeverRelease
    });

    gsap.ticker.add(update);
    announce('Puxe a alavanca para jogar');
}


function onLeverRelease(force) {
    //if (played) { announce('Você já jogou 🙂'); return; }
    if (spinning) return;
    // Mapear força (0..1) -> velocidade inicial (deg/s)
    const min = 500; // velocidade mínima perceptível
    const max = 2600; // máxima (tablet)
    angularVel = min + (max - min) * force;
    spinning = true;
    //played = true;
}


function update(time, delta) {
    // delta ~ 16ms; converte para segundos
    const dt = gsap.ticker.deltaRatio(60) / 60; // normaliza
    if (spinning) {
        // atrito proporcional + mínimo (evita giro infinito)
        const friction = 0.995; // fator de multiplicação por frame
        angularVel *= Math.pow(friction, gsap.ticker.deltaRatio());
        angularVel -= 10 * dt; // pequeno arrasto
        if (angularVel < 0) angularVel = 0;


        rotation = (rotation + angularVel * dt) % 360;
        Wheel.draw(rotation);


        handleTickSound(rotation);


        if (angularVel <= 20) { // quase parando -> encaixa
            // para quando velocidade cair abaixo do limiar
            finishSpin();
        }
    }
}


function handleTickSound(rot) {
    const segAngle = 360 / segments.length;
    const idx = Wheel.indexFromRotation(rot);
    if (idx !== lastTickIndex) {
        lastTickIndex = idx;
        try { sndTick.currentTime = 0; sndTick.play(); } catch (e) { }
    }
}

function finishSpin() {
    spinning = false;
    // Alinhar ao centro do segmento vencedor
    //const segAngle = 360 / segments.length;
    const segAngle = segments.length;
    const idx = Wheel.indexFromRotation(rotation);
    //const targetDeg = (360 - (idx * segAngle + segAngle / 2)) % 360;
    //const targetDeg = (360 - (idx * segAngle + segAngle / 2)) % 360;
    gsap.to({}, {
        duration: .6, onUpdate: () => {
            // tween manual de rotação até o centro do setor
            const diff = shortestAngleDiff(rotation, targetDeg);
            //rotation = (rotation + diff * 0.28) % 360;
            //rotation = (rotation + 1 * 0.28);
            Wheel.draw(rotation);
        }, onComplete: () => {
            const finalIdx = Wheel.indexFromRotation(rotation);

            console.log(finalIdx)

            const prize = Wheel.getLabel(finalIdx);

            console.log(prize)

            announce(`Resultado: ${prize}`);
            try { sndWin.currentTime = 0; sndWin.play(); } catch (e) { }
        }
    });
}


function shortestAngleDiff(a, b) {
    //let d = (b - a + 540) % 360 - 180;
    let d = 0;
    return d;
}


function announce(text) { resultEl.textContent = text; }


// boot
window.addEventListener('DOMContentLoaded', init);