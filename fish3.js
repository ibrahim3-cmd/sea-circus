class Fish3 {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 15 + 25; // Length/Scale
        this.color = '#333'; // Darker color based on visual description/screenshot (dark grey/black?)
        // Let's stick to the orange unless specified otherwise, but the user said "like screenshot".
        // Screenshot "dark cylinder" implies maybe dark grey/black?
        // Let's use a dark grey for now as it matches the "cylinder" description vibe, usually mechanical or specific.
        // Actually, let's keep it colorful but maybe darker? Or just dark grey as a base?
        // User said "like screenshot a slight pressed(parabular) circle as head...".
        // Often these specific descriptions imply a specific visual style. I'll make it dark grey/black body with some color?
        // Re-reading: "slight pressed(parabular) circle as head".
        // Let's go with a dark body like a shadow fish or the user's specific screenshot object.
        this.color = '#2c3e50'; // Dark blue-grey
        
        // Single rigid body instead of wiggly segments?
        // "cylindar body with fin(one object)"
        // "cylinder's one side is narrower than oher"
        // This suggests a rigid shape, or maybe just a shape definition.
        // To make it swim nicely, we still need rotation.
        
        this.angle = 0;
        this.speed = Math.random() * 1.5 + 1.5;
        
        // Tail Wiggle
        this.wigglePhase = Math.random() * Math.PI * 2;
        this.wiggleSpeed = 0.2;
    }

    update(mouse, width, height) {
        this.width = width;
        this.height = height;

        // --- Movement Logic ---
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 600) {
                const force = (600 - distance) / 600;
                this.vx += (dx / distance) * force * 0.3;
                this.vy += (dy / distance) * force * 0.3;
            }
        } else {
             this.vx += (Math.random() - 0.5) * 0.1;
             this.vy += (Math.random() - 0.5) * 0.1;
        }

        const speedMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speedMagnitude > this.speed) {
            this.vx = (this.vx / speedMagnitude) * this.speed;
            this.vy = (this.vy / speedMagnitude) * this.speed;
        }
        
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        const margin = 50;
        if (this.x < margin) this.vx += 0.2;
        if (this.x > width - margin) this.vx -= 0.2;
        if (this.y < margin) this.vy += 0.2;
        if (this.y > height - margin) this.vy -= 0.2;

        this.angle = Math.atan2(this.vy, this.vx);
        this.wigglePhase += this.wiggleSpeed * speedMagnitude;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Visual Params
        const len = this.size * 2.0; // Total length
        const maxW = this.size * 0.8; // Head width
        const minW = this.size * 0.4; // Tail width (cylinder tapered)

        // 1. Fins (Single object body, fins usually stick out)
        // User said "cylindar body with fin(one object)". Maybe "fins stick out of object"?
        // Let's draw side fins.
        ctx.fillStyle = '#7f8c8d'; // Lighter grey for fins
        const finWiggle = Math.sin(this.wigglePhase) * 0.2;
        
        // Right Fin
        ctx.save();
        ctx.translate(len * 0.2, maxW * 0.4);
        ctx.rotate(0.5 + finWiggle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(10, 20); // Simple stick-out fin
        ctx.lineTo(-5, 15);
        ctx.fill();
        ctx.restore();

        // Left Fin
        ctx.save();
        ctx.translate(len * 0.2, -maxW * 0.4);
        ctx.rotate(-0.5 - finWiggle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(10, -20);
        ctx.lineTo(-5, -15);
        ctx.fill();
        ctx.restore();

        // 2. Body (Tapered Cylinder)
        // "cylinder's one side is narrower than oher"
        // "narrower side will have tail"
        // "slight pressed(parabular) circle as head"
        
        // We assume Head is at specific end.
        // Let's draw the main body shape.
        
        ctx.fillStyle = this.color;
        
        // Head (Parabolic/Circle)
        // Position: 0,0 center? Or front?
        // Let's say front is at x > 0? Standard rotation is 0 rads = right.
        // So front is right.
        
        // Let's center the object.
        const bodyLen = len * 0.8;
        
        ctx.beginPath();
        
        // Head (Right side) - "pressed parabolic circle"
        // A circle scaled?
        // Center of head circle:
        const headX = bodyLen / 2;
        const headW = maxW / 2;
        
        // Draw Tapered sides
        // Top line
        ctx.moveTo(headX, -headW);
        // To Tail top
        const tailX = -bodyLen / 2;
        const tailW = minW / 2;
        ctx.lineTo(tailX, -tailW);
        // Tail end
        ctx.lineTo(tailX, tailW);
        // Bottom line
        ctx.lineTo(headX, headW);
        
        // Head curve (Parabolic cap)
        // Control point further out?
        ctx.quadraticCurveTo(headX + 15, 0, headX, -headW);
        
        ctx.fill();

        // 3. Tail (Narrower side)
        // "narrower side will have tail"
        // Attached to tailX
        
        ctx.save();
        ctx.translate(tailX, 0);
        
        // Wiggle the tail
        ctx.rotate(Math.sin(this.wigglePhase) * 0.4);
        
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, -10);
        ctx.lineTo(-15, 10);
        ctx.fill();
        
        ctx.restore();

        // "cylinder body with fin(one object)" possibly implies a specific shading
        // to make it look 3D cylindrical?
        // Let's add a highlight strip through the middle.
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(headX - 5, -headW/2);
        ctx.lineTo(tailX + 5, -tailW/2);
        ctx.lineTo(tailX + 5, tailW/2);
        ctx.lineTo(headX - 5, headW/2);
        ctx.fill();

        ctx.restore();
    }
}
