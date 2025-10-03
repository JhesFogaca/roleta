// lever.js – interação de alavanca elástica + nível de força


export const Lever = (() => {
    let knob, fill, maxPull = 180; // px
    let dragging = false;
    let startY = 0; // Y de início do drag
    let curPull = 0; // 0..max
    let onReleaseCb = null;
    let sndLever;


    function init(knobEl, fillEl, { max = 180, onRelease }) {
        knob = knobEl; fill = fillEl; maxPull = max; onReleaseCb = onRelease;
        sndLever = document.getElementById('sndLever');


        const onPointerDown = (e) => {
            dragging = true;
            startY = (e.touches ? e.touches[0].clientY : e.clientY);
            knob.setPointerCapture?.(e.pointerId);
            sndLever?.currentTime && (sndLever.currentTime = 0);
            sndLever?.play?.();
        };
        const onPointerMove = (e) => {
            if (!dragging) return;
            const y = (e.touches ? e.touches[0].clientY : e.clientY);
            curPull = Math.max(0, Math.min(maxPull, (y - startY)));
            const pct = curPull / maxPull; // 0..1
            knob.style.transform = `translateX(-50%) translateY(${curPull}px)`;
            fill.style.height = `${Math.round(pct * 100)}%`;
        };
        const onPointerUp = () => {
            if (!dragging) return;
            dragging = false;
            const pct = curPull / maxPull;
            // anima voltar elástico
            gsap.to(knob, { y: 0, duration: .35, ease: "back.out(2)" });
            gsap.to(fill, { height: '0%', duration: .35, ease: "power2.out" });
            const impulse = pct; // força final 0..1
            curPull = 0;
            onReleaseCb && onReleaseCb(impulse);
        };

        // Suporte pointer/mouse/touch
        knob.addEventListener('mousedown', onPointerDown);
        knob.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('mousemove', onPointerMove, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);
    }


    return { init };
})();