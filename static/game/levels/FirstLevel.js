import Enemy from '../Enemy.js';
import UI from '../../base/UI.js';
import Weapon from '../Weapon.js';
import Player from '../Player.js';
import Level from '../../base/Level.js';

export default class FirstLevel extends Level {

    setProperties() {

        // Menu
        this.menu = null;
        this.weapon = null;
        this.ammoBox = null;

        // Player
        this.player = new Player(this);
        this.playerMesh = null;
        this.playerLife = 100;

        // Enemies
        this.maxEnemies = 10;
        this.currentEnemies = 0;
        this.enemies = [];
        this.enemyDistanceFromCenter = 100;

    }

    setupAssets() {

        this.assets.addAnimatedMesh('rifle', './static/assets/models/weapons/rifle/rifle.gltf', {
            'normalized': true, // Normalize all rifle animations
            'start': 0,
            'end': 207
        });
        
        this.assets.addMergedMesh('enemy', './static/assets/models/skull/skull2.obj');

        this.assets.addMusic('music', './static/assets/musics/music.mp3', {volume: 0.1});
        this.assets.addSound('shotgun', './static/assets/sounds/shotgun.wav', { volume: 0.4 });
        this.assets.addSound('reload', './static/assets/sounds/reload.mp3', { volume: 0.4 });
        this.assets.addSound('empty', './static/assets/sounds/empty.wav', { volume: 0.4 });
        this.assets.addSound('monsterAttack', './static/assets/sounds/monster_attack.wav', { volume: 0.3 });
        this.assets.addSound('playerDamaged', './static/assets/sounds/damage.wav', { volume: 0.3 });
        
    }

    buildScene() {
        
        this.scene.clearColor = new BABYLON.Color3.FromHexString('#777');
        
        // Adding lights
        let dirLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), this.scene);
        dirLight.intensity = 0.3;

        let hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.5;

        // Skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 1000}, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./static/assets/skybox/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;	

        this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        this.scene.collisionsEnabled = true;

        // animations:
        BABYLON.Animation.AllowMatricesInterpolation = true;

        // Create and set the active camera
        this.camera = this.createCamera();
        this.scene.activeCamera = this.camera;
        this.enablePointerLock();
        
        this.createGround();
        this.addWeapon();
        
        this.addEnemies();

        this.createHUD();
        this.createMenu();
        
        setInterval(() => {
            this.addEnemies();
        }, 1000 * 25);

        this.setupEventListeners();

        this.player.startTimeCounter();
    }

    createGround() {
        let ground = BABYLON.Mesh.CreateGround('ground',  500,  500, 2, this.scene);
        ground.checkCollisions = true;
        
        let groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture('./static/assets/images/sand.jpg', this.scene);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

        ground.material = groundMaterial;
    }

    addWeapon() {
        this.weapon = new Weapon(this);
        this.weapon.create();
    }

    addEnemies() {
        
        // Let's remove unnecessary enemies to prevent performance issues
        this.removeUnnecessaryEnemies();

        let quantityOfEnemiesToCreate = this.maxEnemies - this.currentEnemies;

        for(var enemiesQuantity = 0; enemiesQuantity < quantityOfEnemiesToCreate; enemiesQuantity++) {
            let enemy = new Enemy(this).create();

            this.enemies.push(enemy);
            this.currentEnemies++;
        }

        // Increasing the quantity of max enemies
        this.maxEnemies += 1;
        this.enemyDistanceFromCenter += 10;
    }

    removeUnnecessaryEnemies() {
        let enemiesQuantity = this.enemies.length;

        for(var i = 0; i < enemiesQuantity; i++) {
            if(this.enemies[i] && !this.enemies[i].mesh) {
                this.enemies.splice(i, 1);
            }
        }
    }

    setupEventListeners() {
        GAME.canvas.addEventListener('click', () => {
            if(this.weapon) {
                this.weapon.fire();
            }
        }, false);
    }

    createHUD() {
        var hud = new UI('levelUI');
        
        hud.addImage('gunsight', './static/assets/images/gunsight.png', {
            'width': 0.05,
            'height': 0.05
        });

        this.lifeTextControl = hud.addText('Life: ' + this.playerLife, {
            'top': '10px',
            'left': '10px',
            'horizontalAlignment': BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        this.ammoTextControl = hud.addText('Ammo: ' + this.weapon.ammo, {
            'top': '10px',
            'left': '10px',
            'horizontalAlignment': BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        });

        this.hitsTextControl = hud.addText('Hits: ' + this.player.hits, {
            'top': '10px',
            'left': '-10px',
            'horizontalAlignment': BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
        });
    }

    createMenu() {
        this.menu = new UI('runnerMenuUI');

        this.pointsTextControl = this.menu.addText('Points: 0', {
            'top': '-200px',
            'outlineWidth': '2px',
            'fontSize': '40px',
            'verticalAlignment': BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.currentRecordTextControl = this.menu.addText('Current Record: 0', {
            'top': '-150px',
            'verticalAlignment': BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.hasMadeRecordTextControl = this.menu.addText('You got a new Points Record!', {
            'top': '-100px',
            'color': GAME.options.recordTextColor,
            'fontSize': '20px',
            'verticalAlignment': BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.gameOverTextControl = this.menu.addText('GAME OVER', {
            'top': '-60px',
            'color': GAME.options.recordTextColor,
            'fontSize': '25px',
            'verticalAlignment': BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.menu.addButton('replayButton', 'Replay Game', {
            'onclick': () => this.replay() 
        });

        this.menu.addButton('backButton', 'Return to Home', {
            'top': '70px',
            'onclick': () => GAME.goToLevel('HomeMenuLevel')
        });

        this.menu.hide();
    }

    createCamera() {
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 3.5, 100), this.scene);
        camera.setTarget(new BABYLON.Vector3(0,2,0));
        
        camera.attachControl(GAME.canvas, true);
        
        camera.applyGravity = true;
        camera.ellipsoid = new BABYLON.Vector3(1, 1.7, 1);
        camera.checkCollisions = true;
        camera._needMoveForGravity = true;

        this.addEnemies();

        // Reducing the minimum visible FOV to show the Weapon correctly 
        camera.minZ = 0;

        // Remap keys to move with WASD
        camera.keysUp = [87, 38]; // W or UP Arrow
        camera.keysDown = [83, 40]; // S or DOWN ARROW
        camera.keysLeft = [65, 37]; // A or LEFT ARROW
        camera.keysRight = [68, 39]; // D or RIGHT ARROW

        camera.inertia = 0.1;
        camera.angularSensibility = 800;
        camera.speed = 17;
        
        camera.onCollide = (collidedMesh) => {
            // If the camera collides with the ammo box
            if(collidedMesh.id == 'ammoBox') {
                this.weapon.reload();
                collidedMesh.dispose();
                collidedMesh.arrow.dispose();
            }
        }
        
        return camera;
    }

    playerWasAttacked() {
        this.playerLife -= 5;
        
        if(this.playerLife <= 0) {
            this.playerLife = 0;
            this.lifeTextControl.text = 'Life: ' + this.playerLife;

            this.gameOver();

            return;
        }
        
        this.lifeTextControl.text = 'Life: ' + this.playerLife;
        this.assets.getSound('playerDamaged').play();
    }

    playerHitEnemy() {
        this.currentEnemies--;
        this.player.hits++;
        this.hitsTextControl.text = 'Hits: ' + this.player.hits;
    }

    ammoIsOver() {
        // Create a new ammo package that, if collided, recharge the ammo
        this.addAmmoBox();
    }

    addAmmoBox() {
        this.ammoBox = BABYLON.MeshBuilder.CreateBox(
            'ammoBox', 
            { 'width': 4, 'height': 2, 'depth': 2 }, 
            this.scene
        );
        
        this.ammoBox.position.x = 0;
        this.ammoBox.position.y = 1;
        this.ammoBox.position.z = 0;

        this.ammoBox.checkCollisions = true;
        
        // Let's add a green arrow to show where is the ammo box
        var arrowSpriteManager = new BABYLON.SpriteManager('arrowSpriteManager','./static/assets/images/arrow.png', 1, 256, this.scene);
        this.ammoBox.arrow = new BABYLON.Sprite('arrow', arrowSpriteManager);
        this.ammoBox.arrow.position.y = 5;
        this.ammoBox.arrow.size = 4;
    }

    updateStats() {
        this.lifeTextControl.text = 'Life: ' + this.playerLife;
        this.ammoTextControl.text = 'Ammo: ' + this.weapon.ammo;
        this.hitsTextControl.text = 'Hits: ' + this.player.hits;
    }

    gameOver() {
        GAME.pause();
        
        this.player.stopTimeCounter();
        this.player.calculatePoints();
        
        this.showMenu();
        this.exitPointerLock();
        this.enemies.forEach(enemy => enemy.remove());
        this.removeUnnecessaryEnemies();
        
        if(this.ammoBox) {
            this.ammoBox.dispose();
            this.ammoBox.arrow.dispose();
        }
    }

    showMenu() {
        this.pointsTextControl.text = 'Points: ' + this.player.getPoints();
        this.currentRecordTextControl.text = 'Current Record: ' + this.player.getLastRecord();
        this.menu.show();

        if(this.player.hasMadePointsRecord()) {
            this.hasMadeRecordTextControl.isVisible = true;
        } else {
            this.hasMadeRecordTextControl.isVisible = false;
        }
    }

    replay() {
        this.playerLife = 100;
        this.player.hits = 0;

        this.maxEnemies = 10;
        this.currentEnemies = 0;
        this.enemies = [];
        this.enemyDistanceFromCenter = 100;

        this.updateStats();
        GAME.resume();
        this.menu.hide();

        this.camera.position = new BABYLON.Vector3(0, 3.5, 100);
        this.weapon.reload();
        this.addEnemies();

        this.player.startTimeCounter();
    }
    
    beforeRender() {
        if(!GAME.isPaused()) {
            this.weapon.controlFireRate();
            this.enemies.forEach(enemy => enemy.move());

            if(this.camera.position.y < -20) {
                this.gameOver();
            }
        }
    }

}