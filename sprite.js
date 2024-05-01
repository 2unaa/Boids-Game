//Parent Sprit Classa
class Sprite {
    constructor(sprite_json, x, y, start_state) {
        this.sprite_json = sprite_json;
        this.x = x;
        this.y = y;
        this.state = start_state;
        this.root_e = "TenderBud";
        this.cur_frame = 0;
        this.cur_bk_data = null;
        this.x_v = 0;
        this.y_v = 0;
        this.border_hit = false;

    }

    moveLeft() {
        this.x_v = -10;
        this.y_v = 0;
        this.state = 'walk_W';
        this.border_hit = true;
    };

    moveRight() {
        this.x_v = 10;
        this.y_v = 0;
        this.state = 'walk_E';
        this.border_hit = true;
    };

    moveUp() {
        this.y_v = -10;
        this.x_v = 0;
        this.state = 'walk_N';
        this.border_hit = true;
    };

    moveDown() {
        this.y_v = 10;
        this.x_v = 0;
        this.state = 'walk_S';
        this.border_hit = true;
    };

    draw(state) {
        var ctx = canvas.getContext('2d');
        //console.log(this.sprite_json[this.root_e][this.state][this.cur_frame]['w']);
        // console.log(state['key_change']);
        // console.log("KEY PRESS: ", state.key_change)

        if (this.cur_frame < 0 || this.cur_frame >= this.sprite_json[this.root_e][this.state].length) {
            console.error('Frame index out of bounds:', this.cur_frame);
            this.cur_frame = 0;
        }

        if (this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null) {
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }


        if (this.cur_bk_data != null) {
            ctx.putImageData(this.cur_bk_data, (this.x - this.x_v), (this.y - this.y_v));
        }

        this.x += this.x_v;
        this.y += this.y_v;


        this.cur_bk_data = ctx.getImageData(this.x, this.y,
            this.sprite_json[this.root_e][this.state][this.cur_frame]['w'],
            this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);


        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y);

        this.cur_frame = this.cur_frame + 1;
        if (this.cur_frame >= this.sprite_json[this.root_e][this.state].length) {
            this.cur_frame = 0;
        }

        if (this.x > 0 && this.x < (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']) &&
            this.y > 0 && this.y < (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h'])) {
            this.resetBoundaryFlag();
        }

        const reachedRight = this.x >= (canvas.width - this.sprite_json[this.root_e][this.state][this.cur_frame]['w']);
        const reachedLeft = this.x <= 0;
        const reachedBottom = this.y >= (canvas.height - this.sprite_json[this.root_e][this.state][this.cur_frame]['h']);
        const reachedTop = this.y <= 0;

        if (reachedRight && reachedBottom) {
            this.bound_hit('E');
            this.bound_hit('S');
        } else if (reachedLeft && reachedBottom) {
            this.bound_hit('W');
            this.bound_hit('S');
        } else if (reachedRight && reachedTop) {
            this.bound_hit('E');
            this.bound_hit('N');
        } else if (reachedLeft && reachedTop) {
            this.bound_hit('W');
            this.bound_hit('N');
        }

        if (reachedRight) {
            this.bound_hit('E');
        } else if (reachedLeft) {
            this.bound_hit('W');
        } else if (reachedBottom) {
            this.bound_hit('S');
        } else if (reachedTop) {
            this.bound_hit('N');
        } else {
            this.resetBoundaryFlag();
        }

        return false;

    }

    set_idle_state() {
        this.x_v = 0;
        this.y_v = 0;
        const idle_state = ["idle", "idleBackAndForth", "idleBreathing", "idleFall", "idleLayDown", "idleLookAround", "idleLookDown", "idleLookLeft", "idleLookRight", "idleLookUp", "idleSit", "idleSpin", "idleWave"];

        const random = Math.floor(Math.random() * idle_state.length);
        this.state = idle_state[random];
    }

    resetBoundaryFlag() {
        this.border_hit = false;
    }


    bound_hit(side) {
        if (!this.border_hit) {
            this.set_idle_state();
            this.border_hit = true;
        }
    }


}