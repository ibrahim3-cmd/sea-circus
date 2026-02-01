const canvas = document.getElementById('fish-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let fishArray = [];
const numFish = 15; // Number of fish
let mouse = { x: null, y: null };

// Resize canvas to fill window
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse tracking
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function init() {
    fishArray = [];
    const totalFish = 15; // Increased a bit for variety
    
    for (let i = 0; i < totalFish; i++) {
        let r = Math.random();
        // 40% Fish3 (Real), 30% Fish4 (Jellyfish), 15% Fish2, 15% Fish1
        if (r < 0.4) {
            fishArray.push(new Fish3(width, height));
        } else if (r < 0.7) {
            fishArray.push(new Fish4(width, height));
        } else if (r < 0.85) {
            fishArray.push(new Fish2(width, height));
        } else {
            fishArray.push(new Fish1(width, height));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    fishArray.forEach(fish => {
        // Pass updated dimensions and input
        fish.update(mouse, width, height);
        fish.draw(ctx);
    });
    requestAnimationFrame(animate);
}

// Wait for classes to load if needed (though sequential script tags handle this)
// This timeout is just a safety if scripts load async, but we will use sync script tags.
init();
animate();
