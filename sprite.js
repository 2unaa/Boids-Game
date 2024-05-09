class Sprite {
    constructor(sprite_json, x, y, start_state) {
        this.sprite_json = sprite_json;
        this.position = new Vector(x, y);
        this.velocity = new Vector(10, 10); // Initial velocity
        this.state = start_state;
        this.root_e = "TenderBud";
        this.cur_frame = 0;
        this.cur_bk_data = null;
        this.border_hit = false;
        this.collisionCooldown = 0;
    }


    separate(allSprites) {
        let desiredSeparation = 50;
        let steer = new Vector(0, 0);
        let count = 0;
        for (let other of allSprites) {
            let dx = this.position.x - other.position.x;
            let dy = this.position.y - other.position.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if ((d > 0) && (d < desiredSeparation)) {
                steer.add(new Vector(dx, dy));
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
            this.velocity.add(steer);
        }
    }

    align(allSprites) {
        let neighbordist = 50;
        let averageVel = new Vector(0, 0);
        let count = 0;
        for (let other of allSprites) {
            let dx = this.position.x - other.position.x;
            let dy = this.position.y - other.position.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if ((d > 0) && (d < neighbordist)) {
                averageVel.add(other.velocity);
                count++;
            }
        }
        if (count > 0) {
            averageVel.div(count);
            this.velocity.add(averageVel);
        }
    }


    cohesion(allSprites) {
        let neighbordist = 50;
        let centerMass = new Vector(0, 0);
        let count = 0;
        for (let other of allSprites) {
            let dx = this.position.x - other.position.x;
            let dy = this.position.y - other.position.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if ((d > 0) && (d < neighbordist)) {
                centerMass.add(other.position);
                count++;
            }
        }
        if (count > 0) {
            centerMass.div(count);
            let moveTowards = Vector.sub(centerMass, this.position);
            this.velocity.add(moveTowards);
        }
    }


    applyRandomVelocity() {
        const speed = 10;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let preferredAngle = Math.random() * Math.PI * 2;

        // NEEDED TO NED GET STUCK ON CLOSEST BOUNDARY
        if (this.position.x < centerX && this.position.y < centerY) { // Top-left quadrant
            preferredAngle = (Math.random() * Math.PI / 2) + 0; // 0 to 90 degrees
        } else if (this.position.x >= centerX && this.position.y < centerY) { // Top-right quadrant
            preferredAngle = (Math.random() * Math.PI / 2) + Math.PI / 2; // 90 to 180 degrees
        } else if (this.position.x >= centerX && this.position.y >= centerY) { // Bottom-right quadrant
            preferredAngle = (Math.random() * Math.PI / 2) + Math.PI; // 180 to 270 degrees
        } else if (this.position.x < centerX && this.position.y >= centerY) { // Bottom-left quadrant
            preferredAngle = (Math.random() * Math.PI / 2) + 3 * Math.PI / 2; // 270 to 360 degrees
        }

        // Defining sectors based on 30 degrees increments and their corresponding walking states
        const sectors = [
            { angle: Math.PI / 6, state: 'walk_E' }, // 0-30
            { angle: Math.PI / 3, state: 'walk_SE' }, //30-60
            { angle: Math.PI / 2, state: 'walk_S' }, //60-90
            { angle: 2 * Math.PI / 3, state: 'walk_S' }, //90-120
            { angle: 5 * Math.PI / 6, state: 'walk_SW' }, //120-150
            { angle: Math.PI, state: 'walk_W' }, //150-180
            { angle: 7 * Math.PI / 6, state: 'walk_W' }, //180-210
            { angle: 4 * Math.PI / 3, state: 'walk_NW' }, //210-240
            { angle: 3 * Math.PI / 2, state: 'walk_N' }, //240-270
            { angle: 5 * Math.PI / 3, state: 'walk_N' }, //270-300
            { angle: 11 * Math.PI / 6, state: 'walk_NE' }, //300-330
            { angle: 2 * Math.PI, state: 'walk_E' } //330-360
        ];

        let sector = sectors.find(sec => preferredAngle <= sec.angle);
        sector = sector || sectors[sectors.length - 1];
        this.state = sector.state;
        this.velocity = new Vector(Math.cos(preferredAngle) * speed, Math.sin(preferredAngle) * speed);
    }

    // Method to detect collision with another sprite
    checkCollision(otherSprite) {
        const dx = this.position.x - otherSprite.position.x;
        const dy = this.position.y - otherSprite.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = 70; // You can adjust this threshold based on sprite size

        if (this.collisionCooldown > 0 || otherSprite.collisionCooldown > 0) {
            return; // Skip if either sprite is in cooldown
        }
        if (distance < collisionDistance) {
            console.log("COLLIDED")
            this.applyRandomVelocity();
            otherSprite.applyRandomVelocity();

            this.collisionCooldown = 30; // 10 frame cooldown
            otherSprite.collisionCooldown = 30;
        }
    }

    checkCollisions(allSprites) {
        for (const sprite of allSprites) {
            if (sprite !== this) {
                this.checkCollision(sprite);
            }
        }
    }

    getFrameData() {
        if (this.cur_frame < 0 || this.cur_frame >= this.sprite_json[this.root_e][this.state].length) {
            console.error('Frame index out of bounds:', this.cur_frame);
            this.cur_frame = 0;
        }
        return this.sprite_json[this.root_e][this.state][this.cur_frame];
    }

    draw() {
        var ctx = canvas.getContext('2d');
        const frameData = this.getFrameData();

        if (!frameData['img']) {
            frameData['img'] = new Image();
            frameData['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }

        ctx.drawImage(frameData['img'], this.position.x, this.position.y);

        this.cur_frame++;
        if (this.cur_frame >= this.sprite_json[this.root_e][this.state].length) {
            this.cur_frame = 0;
        }
    }


    update(allSprites) {
        this.separate(allSprites);
        this.align(allSprites);
        this.cohesion(allSprites);
        this.position.add(this.velocity);
        this.checkBounds();
        this.checkCollisions(allSprites);
    }

    checkBounds() {
        const frameData = this.getFrameData();
        const frameWidth = frameData['w'];
        const frameHeight = frameData['h'];
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        let bounced = false;

        if (this.position.x + frameWidth > canvasWidth || this.position.x < 0) {
            this.velocity = new Vector(-this.velocity.x, this.velocity.y); // Reverse direction on X axis
            bounced = true;
        }
        if (this.position.y + frameHeight > canvasHeight || this.position.y < 0) {
            this.velocity = new Vector(this.velocity.x, -this.velocity.y); // Reverse direction on Y axis
            bounced = true;
        }

        if (bounced) {
            this.applyRandomVelocity(); // Apply new random velocity on bounce
        }
    }

    set_idle_state() {
        this.velocity = new Vector(0, 0); // Reset velocity to zero
        const idle_states = ["idle", "idleBackAndForth", "idleBreathing", "idleFall", "idleLayDown", "idleLookAround", "idleLookDown", "idleLookLeft", "idleLookRight", "idleLookUp", "idleSit", "idleSpin", "idleWave"];
        this.state = idle_states[Math.floor(Math.random() * idle_states.length)];
    }
}


