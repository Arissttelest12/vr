// Global Variables
let scene, camera, renderer;
let isMobile = false;
let isIOS = false;
let deviceOrientationControls;
let currentModal = null;
let raycaster;
let buttons3D = [];
let canvas2D; // For creating textures
let centerGazeObject = null; // Object currently at center of screen
let gazeHighlight = null; // Glow object for center gaze

// Camera control variables (mouse-follow)
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
const cameraSmoothing = 0.15; // Interpolation factor (0-1, lower = smoother)
const cameraSensitivity = 2.5; // Sensitivity multiplier for camera rotation
const maxRotationX = Math.PI * 0.3; // ±30 degrees vertical

// Button data
const buttonData = [
    {
        id: 1,
        label: 'Materi 1',
        angle: 0,
        position: { x: 0, y: 0, z: -3 }
    },
    {
        id: 2,
        label: 'Materi 2',
        angle: (Math.PI * 2) / 3,
        position: { x: 0, y: 0, z: -3 }
    },
    {
        id: 3,
        label: 'Materi 3',
        angle: (Math.PI * 4) / 3,
        position: { x: 0, y: 0, z: -3 }
    }
];

// Material content
const materials = {
    1: {
        title: "Materi 1: Penjumlahan",
        content: `PENGERTIAN PENJUMLAHAN

Penjumlahan adalah operasi menggabungkan dua atau lebih bilangan untuk mendapatkan hasil yang lebih besar.

Simbol penjumlahan adalah: +

CONTOH PENJUMLAHAN:

1. Contoh Sederhana:
   3 + 5 = 8
   
   Artinya: Jika kita memiliki 3 buah apel dan ditambah 5 buah apel lagi,
   maka totalnya adalah 8 buah apel.

2. Contoh dengan Bilangan Lebih Besar:
   15 + 24 = 39
   
3. Contoh dengan Tiga Bilangan:
   10 + 5 + 8 = 23

SIFAT-SIFAT PENJUMLAHAN:

1. Sifat Komutatif (Pertukaran):
   3 + 5 = 5 + 3 = 8
   Urutan tidak mempengaruhi hasil.

2. Sifat Asosiatif (Pengelompokan):
   (2 + 3) + 4 = 2 + (3 + 4) = 9
   Cara mengelompokkan tidak mempengaruhi hasil.

3. Identitas Nol:
   5 + 0 = 5
   Menambah dengan 0 tidak mengubah bilangan.`
    },
    2: {
        title: "Materi 2: Pengurangan",
        content: `PENGERTIAN PENGURANGAN

Pengurangan adalah operasi mengambil sebagian dari suatu bilangan.

Simbol pengurangan adalah: −

CONTOH PENGURANGAN:

1. Contoh Sederhana:
   10 − 4 = 6
   
   Artinya: Jika kita memiliki 10 buah pensil dan diambil 4 buah,
   maka sisanya adalah 6 buah pensil.

2. Contoh dengan Bilangan Lebih Besar:
   50 − 15 = 35

3. Pengurangan Beruntun:
   20 − 5 − 3 = 12
   Dikerjakan dari kiri ke kanan.

HUBUNGAN PENGURANGAN DENGAN PENJUMLAHAN:

Pengurangan adalah kebalikan dari penjumlahan.
   10 − 4 = 6, karena 6 + 4 = 10

ATURAN PENGURANGAN:

1. Jangan Pertukar Urutan:
   10 − 4 = 6
   4 − 10 = −6 (berbeda!)

2. Pengurangan dengan Nol:
   8 − 0 = 8
   Mengurangi dengan 0 tidak mengubah bilangan.

3. Pengurangan dari Nol:
   0 − 5 = −5
   Hasilnya bisa negatif.`
    },
    3: {
        title: "Materi 3: Perkalian",
        content: `PENGERTIAN PERKALIAN

Perkalian adalah operasi penjumlahan yang diulang beberapa kali.

Simbol perkalian: × atau *

CONTOH PERKALIAN:

1. Contoh Sederhana:
   4 × 3 = 12
   
   Artinya: 4 + 4 + 4 = 12
   Atau: 3 + 3 + 3 + 3 = 12

2. Contoh Lainnya:
   5 × 6 = 30
   Artinya: 5 + 5 + 5 + 5 + 5 + 5 = 30

3. Perkalian dengan Bilangan Besar:
   7 × 8 = 56

ISTILAH DALAM PERKALIAN:

Dalam operasi 4 × 3 = 12:
- 4 disebut Pengali (Multiplicand)
- 3 disebut Pengganda (Multiplier)
- 12 disebut Hasil Kali (Product)

SIFAT-SIFAT PERKALIAN:

1. Sifat Komutatif:
   4 × 3 = 3 × 4 = 12
   Urutan dapat dipertukarkan.

2. Sifat Asosiatif:
   (2 × 3) × 4 = 2 × (3 × 4) = 24

3. Identitas Satu:
   5 × 1 = 5
   Mengalikan dengan 1 tidak mengubah bilangan.

4. Perkalian dengan Nol:
   5 × 0 = 0
   Hasil selalu nol.

TABEL PERKALIAN DASAR:

1 × 10 = 10
2 × 10 = 20
3 × 10 = 30
4 × 10 = 40
5 × 10 = 50`
    }
};

// Initialize the application
function init() {
    detectDevice();
    setupScene();
    create3DButtons();
    createGazeHighlight();
    setupRaycaster();
    setupControls();
    setupEventListeners();
    setupUI();
    animate();
    
    setTimeout(() => {
        hideLoadingScreen();
    }, 1000);
}

// Detect device type
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    isIOS = /iphone|ipad|ipod/i.test(userAgent);
    
    const instructions = document.getElementById('instructions');
    if (isMobile) {
        instructions.textContent = 'Gerakkan device untuk melihat sekeliling';
        
        if (isIOS) {
            document.getElementById('enable-motion').classList.remove('hidden');
        }
    } else {
        instructions.textContent = 'Gerakkan mouse ke objek di tengah layar, lalu klik untuk memilih';
    }
}

// Setup Three.js scene
function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    const container = document.getElementById('scene-container');
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// Create Canvas texture for button
function createButtonTexture(label) {
    const width = 512;
    const height = 512;
    
    canvas2D = document.createElement('canvas');
    canvas2D.width = width;
    canvas2D.height = height;
    
    const context = canvas2D.getContext('2d');
    
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    
    const padding = 40;
    const radius = 40;
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 3;
    
    context.beginPath();
    context.moveTo(padding + radius, padding);
    context.lineTo(width - padding - radius, padding);
    context.quadraticCurveTo(width - padding, padding, width - padding, padding + radius);
    context.lineTo(width - padding, height - padding - radius);
    context.quadraticCurveTo(width - padding, height - padding, width - padding - radius, height - padding);
    context.lineTo(padding + radius, height - padding);
    context.quadraticCurveTo(padding, height - padding, padding, height - padding - radius);
    context.lineTo(padding, padding + radius);
    context.quadraticCurveTo(padding, padding, padding + radius, padding);
    context.closePath();
    context.fill();
    context.stroke();
    
    context.fillStyle = '#ffffff';
    context.font = 'bold 60px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(label, width / 2, height / 2);
    
    const texture = new THREE.CanvasTexture(canvas2D);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
}

// Create 3D buttons
function create3DButtons() {
    const radius = 3;
    
    buttonData.forEach((btn) => {
        const x = Math.sin(btn.angle) * radius;
        const z = Math.cos(btn.angle) * radius;
        
        const geometry = new THREE.PlaneGeometry(1.5, 1.5);
        const texture = createButtonTexture(btn.label);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            toneMapped: false
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);
        mesh.lookAt(0, 0, 0);
        
        mesh.userData = {
            id: btn.id,
            label: btn.label,
            isButton: true,
            isHovered: false,
            originalScale: new THREE.Vector3(1, 1, 1)
        };
        
        scene.add(mesh);
        buttons3D.push(mesh);
    });
}

// Create gaze highlight
function createGazeHighlight() {
    const geometry = new THREE.PlaneGeometry(1.7, 1.7);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffdd00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    gazeHighlight = new THREE.Mesh(geometry, material);
    gazeHighlight.position.z = 0.01;
    gazeHighlight.visible = false;
    scene.add(gazeHighlight);
}

// Update gaze highlight - FIXED FOR MOBILE
function updateGazeHighlight() {
    const tempRaycaster = new THREE.Raycaster();
    const centerPoint = new THREE.Vector2(0, 0);
    
    // This works for both desktop and mobile
    // The camera rotation is already updated in the animate loop
    tempRaycaster.setFromCamera(centerPoint, camera);
    const intersects = tempRaycaster.intersectObjects(buttons3D);
    
    if (intersects.length > 0) {
        const targetObject = intersects[0].object;
        
        if (targetObject.userData.isButton) {
            centerGazeObject = targetObject;
            gazeHighlight.position.copy(targetObject.position);
            gazeHighlight.rotation.copy(targetObject.rotation);
            gazeHighlight.visible = true;
            
            targetObject.scale.set(1.05, 1.05, 1);
        } else {
            gazeHighlight.visible = false;
            centerGazeObject = null;
        }
    } else {
        gazeHighlight.visible = false;
        centerGazeObject = null;
    }
    
    buttons3D.forEach(btn => {
        if (btn !== centerGazeObject) {
            btn.scale.set(1, 1, 1);
        }
    });
}

// Setup Raycaster for click detection at center screen
function setupRaycaster() {
    raycaster = new THREE.Raycaster();
    
    // Click detection - desktop
    renderer.domElement.addEventListener('click', () => {
        if (centerGazeObject && centerGazeObject.userData.isButton) {
            showMaterialModal(centerGazeObject.userData.id);
        }
    });
    
    // Touch/tap detection for mobile - IMPROVED
    renderer.domElement.addEventListener('touchstart', (e) => {
        // Prevent default to avoid scroll interference
        if (centerGazeObject && centerGazeObject.userData.isButton) {
            e.preventDefault();
            showMaterialModal(centerGazeObject.userData.id);
        }
    });
    
    renderer.domElement.style.cursor = 'grab';
}

// Setup camera controls
function setupMouseFollowControls() {
    renderer.domElement.addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        targetRotationY = mouseX * cameraSensitivity * Math.PI;
        targetRotationX = mouseY * cameraSensitivity * maxRotationX / Math.PI;
    });
    
    renderer.domElement.addEventListener('mouseleave', () => {
        targetRotationY = 0;
        targetRotationX = 0;
    });
}

// Setup camera controls
function setupControls() {
    if (isMobile) {
        setupDeviceOrientationControls();
    } else {
        setupMouseFollowControls();
    }
}

// Setup DeviceOrientationControls for mobile
function setupDeviceOrientationControls() {
    try {
        deviceOrientationControls = new THREE.DeviceOrientationControls(camera);
        
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            document.getElementById('enable-motion').addEventListener('click', async () => {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        deviceOrientationControls.connect();
                        document.getElementById('enable-motion').classList.add('hidden');
                    }
                } catch (error) {
                    console.log('Permission denied:', error);
                }
            });
        } else {
            deviceOrientationControls.connect();
            document.getElementById('enable-motion').classList.add('hidden');
        }
    } catch (error) {
        console.log('DeviceOrientationControls not supported:', error);
        setupMouseFollowControls();
    }
}

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Setup UI event listeners
function setupUI() {
    document.addEventListener('click', (e) => {
        if (currentModal && e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (currentModal) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Show material modal
function showMaterialModal(materialId) {
    if (currentModal) {
        closeModal();
    }
    
    const material = materials[materialId];
    if (!material) return;
    
    const modal = createModal(material);
    document.getElementById('modal-container').appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
        modal.querySelector('.modal-content').classList.add('active');
    }, 10);
    
    currentModal = modal;
}

// Create modal element
function createModal(material) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">${material.title}</h2>
                <button class="modal-close" aria-label="Close modal">×</button>
            </div>
            <div class="material-text">${material.content}</div>
        </div>
    `;
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    
    return modal;
}

// Close modal
function closeModal() {
    if (!currentModal) return;
    
    const modal = currentModal;
    
    modal.classList.remove('active');
    modal.querySelector('.modal-content').classList.remove('active');
    
    setTimeout(() => {
        modal.remove();
        currentModal = null;
    }, 300);
}

// Update camera rotation with smooth interpolation (desktop only)
function updateCameraRotation() {
    if (!isMobile) {
        currentRotationX += (targetRotationX - currentRotationX) * cameraSmoothing;
        currentRotationY += (targetRotationY - currentRotationY) * cameraSmoothing;
        
        camera.rotation.order = 'YXZ';
        camera.rotation.y = currentRotationY;
        camera.rotation.x = currentRotationX;
    }
}

// Handle window resize
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Handle orientation change
function handleOrientationChange() {
    setTimeout(handleResize, 100);
}

// Handle fullscreen change
function handleFullscreenChange() {
    setTimeout(handleResize, 100);
}

// Handle visibility change
function handleVisibilityChange() {
    if (document.hidden) {
        if (deviceOrientationControls) {
            deviceOrientationControls.enabled = false;
        }
    } else {
        if (deviceOrientationControls) {
            deviceOrientationControls.enabled = true;
        }
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');
    
    setTimeout(() => {
        loadingScreen.remove();
    }, 500);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update camera rotation (desktop only)
    if (!isMobile) {
        updateCameraRotation();
    }
    
    // Update device orientation controls (mobile)
    if (deviceOrientationControls && deviceOrientationControls.enabled) {
        deviceOrientationControls.update();
    }
    
    // Update gaze highlight EVERY FRAME - this is the key fix!
    updateGazeHighlight();
    
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (renderer) {
        renderer.dispose();
    }
    
    if (deviceOrientationControls) {
        deviceOrientationControls.dispose();
    }
    
    buttons3D.forEach(btn => {
        btn.geometry.dispose();
        btn.material.map.dispose();
        btn.material.dispose();
    });
    
    if (gazeHighlight) {
        gazeHighlight.geometry.dispose();
        gazeHighlight.material.dispose();
    }
});
