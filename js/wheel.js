// wheel.js – desenha a roleta em <canvas> e fornece utilitários


export const Wheel = (() => {
    const cfg = {
        border: 22,
        ring1: '#f5b533',
        ring2: '#fbe4a2',
        red: '#E9463A',
        white: '#fff',
        font: '600 20px Poppins, Arial, sans-serif'
    };


    let segments = [];
    let canvas, ctx, size, radius, anglePerSeg;


    function init(canvasEl, labels) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        segments = labels.map((label, i) => ({ label, color: i % 2 ? cfg.white : cfg.red }));
        anglePerSeg = (Math.PI * 2) / segments.length;
        resize();
        draw(0);
    }


    function resize() {
        // manter alta resolução
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.round(rect.width * devicePixelRatio);
        canvas.height = Math.round(rect.height * devicePixelRatio);
        size = Math.min(canvas.width, canvas.height);
        radius = size / 2 - cfg.border * devicePixelRatio;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }

    function draw(rotationDeg) {
        const rot = rotationDeg * Math.PI / 180;

        // limpar (origem já no centro por causa do resize())
        ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);

        // anel externo
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius + cfg.border * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = cfg.ring1; ctx.fill();
        ctx.lineWidth = cfg.border * devicePixelRatio * 0.55;
        ctx.strokeStyle = cfg.ring2; ctx.stroke();
        ctx.restore();

        // === Tudo que pertence à roleta fica NO MESMO contexto rotacionado ===
        ctx.save();
        ctx.rotate(-Math.PI / 2 + rot); // 0° pra cima + rotação atual

        // 1) FATIAS
        for (let i = 0; i < segments.length; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, i * anglePerSeg, (i + 1) * anglePerSeg);
            ctx.closePath();
            ctx.fillStyle = segments[i].color;
            ctx.fill();
            ctx.strokeStyle = '#d7b46e';
            ctx.lineWidth = Math.max(2 * devicePixelRatio, 2);
            ctx.stroke();
        }

        // 2) TEXTOS (no MESMO rotate da roleta; sem setTransform/scale)
        const dpr = window.devicePixelRatio || 1;
        const TEXT_R_RATIO = 0.78;         // ↑ aproxima da borda (0.60–0.82)
        const textR = radius * TEXT_R_RATIO;
        const padding = 8 * dpr;           // folga lateral dentro da fatia
        const lineH = 22;                  // altura da linha
        const chord = (r) => 2 * r * Math.tan(anglePerSeg / 2) - padding;

        ctx.font = cfg.font.replace('30px', '22px'); // evita “escala dupla”
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const TEXT_ANGLE_OFFSET_DEG = -12;             // ajuste fino (ex.: 2, 5, 8 graus)
        const TEXT_ANGLE_OFFSET = TEXT_ANGLE_OFFSET_DEG * Math.PI / 180;

        for (let i = 0; i < segments.length; i++) {
            const isRed = (i % 2 === 0);
            ctx.fillStyle = isRed ? '#fff' : '#D23125';

            // posiciona no meio da fatia i, sem acumular
            ctx.save();
            const mid = i * anglePerSeg + anglePerSeg / 2;
            ctx.rotate(mid);              // vira até o centro da fatia
            ctx.translate(0, -textR);     // distância radial
            ctx.rotate(Math.PI / 2 + TEXT_ANGLE_OFFSET);        // tangente; troque p/ 0 se quiser texto radial

            wrapText(ctx, segments[i].label, 10, 50, chord(textR), lineH);
            ctx.restore();
        }

        ctx.restore(); // sai do contexto rotacionado da roleta
    }


    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        const lines = [];
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) { lines.push(line); line = words[n] + ' '; }
            else line = testLine;
        }
        lines.push(line.trim());
        const offsetY = -(lines.length - 1) * lineHeight / 2;
        lines.forEach((l, i) => context.fillText(l, x, y + offsetY + i * lineHeight));
    }

    function indexFromRotation(rotationDeg) {
        // ponteiro no topo; 0° no topo; fatias no sentido horário 
        //const segAngle = 360 / segments.length;
        const segAngle = 360 / segments.length;
        //const rot = ((rotationDeg % 360) + 360) % 360;
        const rot = (rotationDeg % 360);
        // 0..360 
        //const winIndex = Math.floor(((360 - rot) % 360) / segAngle);
        const winIndex = Math.floor((360 - rot) / segAngle) + 4;

        //console.log(segAngle, rot, winIndex, segments.length)

        return winIndex;
    }



    function getLabel(idx) { return segments[idx]?.label ?? ''; }


    return { init, resize, draw, indexFromRotation, getLabel };
})();