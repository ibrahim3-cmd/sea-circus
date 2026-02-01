class Fish4 {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Jellyfish drift slowly
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.size = Math.random() * 10 + 20; // Radius of bell
        
        this.color = '#a020f0'; // Purple base
        this.glowColor = '#e080ff'; // Light purple glow
        
        this.angle = 0;
        this.speed = Math.random() * 0.8 + 0.5; // Slow
        
        // Pulsing
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.05;

        // Tentacles
        // Each tentacle is a chain of segments relative to the body
        this.numTentacles = 5;
        this.tentacles = [];
        const numSegments = 12;
        
        for(let t=0; t<this.numTentacles; t++) {
            let segs = [];
            for(let i=0; i<numSegments; i++) {
                segs.push({ x: this.x, y: this.y, angle: 0 });
            }
            this.tentacles.push(segs);
        }
    }

    update(mouse, width, height) {
        this.width = width;
        this.height = height;

        // --- Movement Logic ---
        // Jellyfish drift, but pulse towards target
        
        // Pulse logic
        this.pulsePhase += this.pulseSpeed;
        let pulse = Math.sin(this.pulsePhase);
        
        // Move primarily when "contracting" (pulse > 0)
        let propulsion = Math.max(0, pulse) * 0.1;
        
        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 500) {
                // Steer towards mouse slowly
                let angleToMouse = Math.atan2(dy, dx);
                // Mild steering
                this.vx += Math.cos(angleToMouse) * 0.05;
                this.vy += Math.sin(angleToMouse) * 0.05;
            }
        } else {
             // Random drift
             this.vx += (Math.random() - 0.5) * 0.05;
             this.vy += (Math.random() - 0.5) * 0.05;
        }

        // Apply propulsion in direction of movement
        // Actually, usually they move in direction of head.
        // Let's assume Angle is direction of motion.
        this.angle = Math.atan2(this.vy, this.vx);
        
        // Speed cap
        const speedMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        let maxSpeed = this.speed + (propulsion * 2); // Speed up during pulse
        
        if (speedMagnitude > maxSpeed) {
            this.vx = (this.vx / speedMagnitude) * maxSpeed;
            this.vy = (this.vy / speedMagnitude) * maxSpeed;
        }
        
        this.x += this.vx;
        this.y += this.vy;

        // Bounce/Wrap
        const margin = 50;
        if (this.x < -margin) this.x = width + margin;
        if (this.x > width + margin) this.x = -margin;
        if (this.y < -margin) this.y = height + margin;
        if (this.y > height + margin) this.y = -margin;

        // --- Tentacle Physics (Inverse Kinematics / Drag) ---
        // Base of tentacles is at the "bottom" of the bell
        // Bell is oriented by this.angle (which points forward)
        // Bottom of bell is angle + PI
        
        let baseAngle = this.angle + Math.PI;
        let radius = this.size; 

        for(let t=0; t<this.numTentacles; t++) {
            // Spread tentacles along the rim
            let offsetAngle = baseAngle + (t - this.numTentacles/2 + 0.5) * 0.3;
            let baseX = this.x + Math.cos(offsetAngle) * (radius * 0.6);
            let baseY = this.y + Math.sin(offsetAngle) * (radius * 0.6);
            
            let segs = this.tentacles[t];
            
            // Head segment follows base
            dragSegment(segs[0], baseX, baseY);
            
            // Rest follow each other
            for(let i=1; i<segs.length; i++) {
                dragSegment(segs[i], segs[i-1].x, segs[i-1].y);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Pulse scale
        let pulse = Math.sin(this.pulsePhase);
        let scaleX = 1.0 - (pulse * 0.1); // Contract width
        let scaleY = 1.0 + (pulse * 0.2); // Expand length
        
        // Draw Bell (Head)
        ctx.fillStyle = 'rgba(160, 32, 240, 0.4)'; // Transparent Purple
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        
        ctx.save();
        ctx.scale(scaleY, scaleX); // Stretch along forward axis
        
        ctx.beginPath();
        // Bell shape: Semi-circle pointing right
        ctx.arc(0, 0, this.size, Math.PI/2, -Math.PI/2, true); // Top half
        // Bottom curve (scalloped?) or flat
        ctx.bezierCurveTo(0, -this.size, -this.size*0.5, 0, 0, this.size); 
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Inner organs (visual detail)
        ctx.fillStyle = 'rgba(255, 128, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-this.size*0.2, 0, this.size*0.4, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
        ctx.restore();

        // Draw Tentacles
        // Tentacles are in world space
        ctx.strokeStyle = 'rgba(200, 100, 255, 0.5)';
        ctx.lineWidth = 1.5;
        
        for(let t=0; t<this.numTentacles; t++) {
            let segs = this.tentacles[t];
            ctx.beginPath();
            ctx.moveTo(segs[0].x, segs[0].y);
            
            for(let i=1; i<segs.length; i++) {
                // Smooth curve? or lines
                ctx.lineTo(segs[i].x, segs[i].y);
            }
            ctx.stroke();
        }
    }
}

// Helper for tentacle physics (Simple IK drag)
function dragSegment(segment, targetX, targetY) {
    const spacing = 8; // Distance between segments
    
    let dx = segment.x - targetX;
    let dy = segment.y - targetY;
    let angle = Math.atan2(dy, dx);
    
    segment.x = targetX + Math.cos(angle) * spacing;
    segment.y = targetY + Math.sin(angle) * spacing;
    segment.angle = angle;
}
