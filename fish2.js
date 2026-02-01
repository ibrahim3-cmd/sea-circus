class Fish2 {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 10 + 20; // Base size
        this.color = '#f45540'; // Simple orange/red
        
        // Arrays for body segments
        this.segments = [];
        this.numSegments = 10;
        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({ x: this.x, y: this.y, angle: 0 });
        }

        this.speed = Math.random() * 2 + 2;
        this.wiggleSpeed = 0.2; // Speed of tail wag
        this.wigglePhase = Math.random() * Math.PI * 2;
    }

    update(mouse, width, height) {
        this.width = width;
        this.height = height;

        // --- Movement Logic ---
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 500) {
                const force = (500 - distance) / 500;
                this.vx += (dx / distance) * force * 0.5;
                this.vy += (dy / distance) * force * 0.5;
            }
        } else {
             this.vx += (Math.random() - 0.5) * 0.2;
             this.vy += (Math.random() - 0.5) * 0.2;
        }

        const speedMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speedMagnitude > this.speed) {
            this.vx = (this.vx / speedMagnitude) * this.speed;
            this.vy = (this.vy / speedMagnitude) * this.speed;
        }
        if (speedMagnitude < 1) {
             this.vx *= 1.1;
             this.vy *= 1.1;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        const margin = 50;
        if (this.x < margin) this.vx += 0.5;
        if (this.x > width - margin) this.vx -= 0.5;
        if (this.y < margin) this.vy += 0.5;
        if (this.y > height - margin) this.vy -= 0.5;

        // --- Inverse Kinematics / Segment Logic ---
        let targetAngle = Math.atan2(this.vy, this.vx);
        
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        this.segments[0].angle = targetAngle;

        this.wigglePhase += this.wiggleSpeed * (speedMagnitude / 2);

        for (let i = 1; i < this.numSegments; i++) {
            let seg = this.segments[i];
            let prevSeg = this.segments[i - 1];

            let dx = seg.x - prevSeg.x;
            let dy = seg.y - prevSeg.y;
            
            // Fish spacing (tighter)
            let targetDist = this.size / 4;

            let angle = Math.atan2(dy, dx);
            let wiggle = Math.sin(this.wigglePhase - i * 0.5) * 0.1 * (speedMagnitude / 2);
            
            seg.angle = angle + wiggle;

            seg.x = prevSeg.x + Math.cos(angle) * targetDist;
            seg.y = prevSeg.y + Math.sin(angle) * targetDist;
        }
    }

    draw(ctx) {
        let sideFinAngle = Math.sin(this.wigglePhase * 2) * 0.5;

        // Draw Fins (Side)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.segments[0].angle);

        ctx.fillStyle = '#e04030';
        
        // Right Fin
        ctx.save();
        ctx.translate(5, 5);
        ctx.rotate(sideFinAngle + 0.5);
        ctx.beginPath();
        ctx.ellipse(5, 0, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Left Fin
        ctx.save();
        ctx.translate(5, -5);
        ctx.rotate(-sideFinAngle - 0.5);
        ctx.beginPath();
        ctx.ellipse(5, 0, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.restore();

        // Draw Body (Smooth Fish Style)
        ctx.fillStyle = this.color;
        
        const leftPoints = [];
        const rightPoints = [];
        
        for (let i = 0; i < this.numSegments; i++) {
            let seg = this.segments[i];
            
            // Tapered ellipsoid width
            let progress = i / this.numSegments;
            let width = (Math.sin(progress * Math.PI + 0.2) + 0.2) * (this.size * 0.6); 
            if (i === 0) width = this.size * 0.5; 

            let px = seg.x;
            let py = seg.y;
            let angle = seg.angle;
            let perp = angle + Math.PI / 2;

            leftPoints.push({
                x: px + Math.cos(perp) * width,
                y: py + Math.sin(perp) * width
            });

            rightPoints.push({
                x: px + Math.cos(perp + Math.PI) * width,
                y: py + Math.sin(perp + Math.PI) * width
            });
        }

        ctx.beginPath();
        
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
        for (let i = 1; i < leftPoints.length; i++) {
             ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
        }

        // Tail logic
        let lastSeg = this.segments[this.numSegments - 1];
        let tailWidth = this.size * 0.8;
        ctx.lineTo(lastSeg.x - Math.cos(lastSeg.angle)*tailWidth, lastSeg.y - Math.sin(lastSeg.angle)*tailWidth);
        
        for (let i = rightPoints.length - 1; i >= 0; i--) {
            ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
        }

        ctx.closePath();
        ctx.fill();

        // Separate Tail Fin for Smooth Fish
        ctx.save();
        ctx.translate(lastSeg.x, lastSeg.y);
        ctx.rotate(lastSeg.angle);
        ctx.fillStyle = '#e04030';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size, -this.size * 0.5);
        ctx.lineTo(-this.size * 0.8, 0);
        ctx.lineTo(-this.size, this.size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw Head Details (Eyes)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.segments[0].angle);
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.size/2, -this.size/4, 4, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.size/2 + 1, -this.size/4, 2, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}
