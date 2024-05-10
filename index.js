var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
document.body.appendChild(renderer.domElement);

// Create player object
var geometry = new THREE.PlaneGeometry(0.5, 0.5);
var material = new THREE.MeshBasicMaterial({ color: "#ADD8E6" });
var player = new THREE.Mesh(geometry, material);

// Set initial position of player
var offsetX = -1.6; // Offset in X direction
var offsetY = -1; // Offset in Y direction
player.position.x = offsetX; // Middle of the screen with offset
player.position.y = offsetY; // 20% above the bottom of the screen with offset
scene.add(player);

// Serial port reading variables
var inputX = 0;
var inputY = 0;
var inputButton = false;
var potentiometerValue = 0; // Potentiometer value received from serial

// Bullets array
var bullets = [];

// Enemies array
var enemies = [];

// Enemy spawning interval
var enemySpawnInterval = 5000; // 5 seconds
var lastSpawnTime = Date.now();

// UI elements
var scoreElement = 0;
var score = 0;

// Connect to serial port when the user clicks anywhere on the page
document.addEventListener('click', async () => {
    // Prompt user to select any serial port
    var port = await navigator.serial.requestPort();
    // Set the baudRate to match the ESP32 code
    await port.open({ baudRate: 115200 });

    let decoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(decoder.writable);
    inputStream = decoder.readable;
    reader = inputStream.getReader();
    scoreElement = document.getElementById('score');
    readLoop();
});

async function readLoop() {
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later
            console.log("closing connection");
            reader.releaseLock();
            break;
        }
         console.log(value);
        if (value) {
            // Parse the received data (format: X,Y,Button,Potentiometer)
            const data = value.split(',');
            if (isValidSerialData(data)) {
                inputX = parseFloat(data[0]);
                inputY = parseFloat(data[1]);
                inputButton = parseInt(data[2]);
                potentiometerValue = map(parseInt(data[3]), 0, 4095, 0, 255); // Map potentiometer value from 0-4095 to 0-255

                // Check if button is pressed and shoot bullets
                if (inputButton === 1) {
                    shootBullet();
                }
            }
        }
    }
}

function map(value, fromLow, fromHigh, toLow, toHigh) {
    return parseInt((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow);
}

// Function to check if the received serial data is valid
function isValidSerialData(data) {
    return (
        data.length >= 4 &&
        !isNaN(parseFloat(data[0])) &&
        !isNaN(parseFloat(data[1])) &&
        !isNaN(parseInt(data[2])) &&
        !isNaN(parseInt(data[3])) &&
        data[0] !== '' &&
        data[1] !== ''
    );
}

// Function to shoot a bullet
function shootBullet() {
    var bulletGeometry = new THREE.PlaneGeometry(0.1, 0.1);
    var bulletMaterial = new THREE.MeshBasicMaterial({ color: "#00FF00" });
    var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    bullet.position.x = player.position.x;
    bullet.position.y = player.position.y;
    bullet.position.z = player.position.z;

    scene.add(bullet);
    bullets.push(bullet);
}

// Function to move bullets
function moveBullets() {
    bullets.forEach(function(bullet) {
        bullet.position.y += 1; // Adjust the speed of bullets as needed
        checkBulletCollision(bullet); // Check for collision with enemies
    });
}

// Function to check collision between bullet and enemies
function checkBulletCollision(bullet) {
    enemies.forEach(function(enemy, index) {
        if (bullet.position.distanceTo(enemy.position) < 0.3) {
            // Remove both bullet and enemy from scene
            scene.remove(bullet);
            scene.remove(enemy);
            bullets.splice(bullets.indexOf(bullet), 1);
            enemies.splice(index, 1);

            // Update score
            score++;
            scoreElement.innerHTML = score.toString();
        }
    });
}

// Function to spawn enemies
// Function to spawn enemies
function spawnEnemies() {
    var currentTime = Date.now();
    // Map the potentiometer value to the spawn interval (inverse mapping, higher value -> shorter interval)
    var mappedSpawnInterval = map(potentiometerValue, 0, 255, 10000, 1000); // Adjust the range of spawn intervals as needed

    if (currentTime - lastSpawnTime > mappedSpawnInterval) {
        lastSpawnTime = currentTime;
        var enemyGeometry = new THREE.Geometry();
        enemyGeometry.vertices.push(new THREE.Vector3(0, 0.25, 0));
        enemyGeometry.vertices.push(new THREE.Vector3(-0.25, -0.25, 0));
        enemyGeometry.vertices.push(new THREE.Vector3(0.25, -0.25, 0));
        enemyGeometry.faces.push(new THREE.Face3(0, 1, 2));
        enemyGeometry.faces[0].color.setHex(0x800080);
        var enemyMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
        var enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.position.x = Math.random() * (2 - (-2)) + (-2); // Random X position within screen bounds
        enemy.position.y = Math.random() * (4 - 2) + 2; // Random Y position between 2 and 4
        scene.add(enemy);
        enemies.push(enemy);
    }
}

// Render Loop
var render = function () {
    requestAnimationFrame(render);

    // Update player position based on serial data
    if (!isNaN(inputX) && !isNaN(inputY)) {
        player.position.x = offsetX + (inputX / 4096) * 10 - 5; // Scale inputX to fit within -5 to 5 range
        player.position.y = offsetY - ((inputY / 4096) * 10 - 5); // Scale inputY to fit within -5 to 5 range
    }

    // Move bullets
    moveBullets();

    // Spawn enemies
    spawnEnemies();

    // Set background color gradient based on potentiometer value
    var backgroundColor = `rgb(${potentiometerValue}, ${potentiometerValue}, ${potentiometerValue})`;
    renderer.setClearColor(backgroundColor);

    // Render the scene
    renderer.render(scene, camera);
};

render();
