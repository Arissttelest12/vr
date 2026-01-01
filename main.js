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
const cameraSmoothing = 0.15; // Interpolation factor (0-1, lower = smoother) - increased for responsiveness
const cameraSensitivity = 2.5; // Sensitivity multiplier for camera rotation
const maxRotationX = Math.PI * 0.3; // ±30 degrees vertical (no change)
// No maxRotationY - 360° rotation allowed

// Button data - Updated to "Materi" instead of "Lirik"
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

// Material content (Arithmetic materials instead of lyrics)
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
    // Detect device
    detectDevice();
    
    // Setup Three.js scene
    setupScene();
    
    // Create 3D buttons
    create3DButtons();
    
    // Setup center gaze highlight
    createGazeHighlight();
    
    // Setup Raycaster
    setupRaycaster();
    
    // Setup controls
    setupControls();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup UI
    setupUI();
    
    // Start animation loop
    animate();
    
    // Hide loading screen
    setTimeout(() => {
        hideLoadingScreen();
    }, 1000);
}

// Detect device type
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    isIOS = /iphone|ipad|ipod/i.test(userAgent);
    
    // Update instruction text
    const instructions = document.getElementById('instructions');
    if (isMobile) {
        instructions.textContent = 'Gerakkan device untuk melihat sekeliling';
        
        // Show enable motion button for iOS
        if (isIOS) {
            document.getElementById('enable-motion').classList.remove('hidden');
        }
    } else {
        instructions.textContent = 'Gerakkan mouse ke objek di tengah layar, lalu klik untuk memilih';
    }
}

// Setup Three.js scene
function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    // Add renderer to DOM
    const container = document.getElementById('scene-container');
    container.appendChild(renderer.domElement);
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // Add directional light
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
    
    // Background dengan gradient
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    
    // Border rounded rectangle
    const padding = 40;
    const radius = 40;
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 3;
    
    // Draw rounded rectangle
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
    
    // Text
    context.fillStyle = '#ffffff';
    context.font = 'bold 60px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(label, width / 2, height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas2D);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
}

// Create 3D buttons
function create3DButtons() {
    const radius = 3;
    
    buttonData.forEach((btn) => {
        // Calculate position
        const x = Math.sin(btn.angle) * radius;
        const z = Math.cos(btn.angle) * radius;
        
        // Create geometry
        const geometry = new THREE.PlaneGeometry(1.5, 1.5);
        
        // Create material with canvas texture
        const texture = createButtonTexture(btn.label);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            toneMapped: false
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);
        
        // Make mesh face the camera
        mesh.lookAt(0, 0, 0);
        
        // Store data for interaction
        mesh.userData = {
            id: btn.id,
            label: btn.label,
            isButton: true,
            isHovered: false,
            originalScale: new THREE.Vector3(1, 1, 1)
        };
        
        // Add to scene and array
        scene.add(mesh);
        buttons3D.push(mesh);
    });
}

// Create gaze highlight (glow for center screen object)
function createGazeHighlight() {
    // Create a simple wireframe or glow indicator
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
    gazeHighlight.position.z = 0.01; // Slightly in front of buttons
    gazeHighlight.visible = false; // Hidden by default
    scene.add(gazeHighlight);
}

// Update gaze highlight position and visibility
function updateGazeHighlight() {
    // Cast ray from center of screen
    const raycaster = new THREE.Raycaster();
    const centerPoint = new THREE.Vector2(0, 0); // Center of screen in NDC
    
    raycaster.setFromCamera(centerPoint, camera);
    const intersects = raycaster.intersectObjects(buttons3D);
    
    if (intersects.length > 0) {
        const targetObject = intersects[0].object;
        
        // Only highlight if it's actually a button
        if (targetObject.userData.isButton) {
            centerGazeObject = targetObject;
            gazeHighlight.position.copy(targetObject.position);
            gazeHighlight.rotation.copy(targetObject.rotation);
            gazeHighlight.visible = true;
            
            // Scale effect on hovered button
            targetObject.scale.set(1.05, 1.05, 1);
        } else {
            gazeHighlight.visible = false;
            centerGazeObject = null;
        }
    } else {
        gazeHighlight.visible = false;
        centerGazeObject = null;
    }
    
    // Reset scale for non-gaze buttons
    buttons3D.forEach(btn => {
        if (btn !== centerGazeObject) {
            btn.scale.set(1, 1, 1);
        }
    });
}

// Setup Raycaster for click detection at center screen
function setupRaycaster() {
    raycaster = new THREE.Raycaster();
    
    // Click detection - now at center of screen (center gaze)
    renderer.domElement.addEventListener('click', () => {
        if (centerGazeObject && centerGazeObject.userData.isButton) {
            showMaterialModal(centerGazeObject.userData.id);
        }
    });
    
    // Touch/tap detection for mobile
    renderer.domElement.addEventListener('touchend', () => {
        if (centerGazeObject && centerGazeObject.userData.isButton) {
            showMaterialModal(centerGazeObject.userData.id);
        }
    });
    
    // Update cursor on hover (for feedback)
    renderer.domElement.style.cursor = 'grab';
}

// Setup camera controls (mouse-follow look)
function setupMouseFollowControls() {
    // Track mouse position for camera rotation
    renderer.domElement.addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        
        // Normalize mouse position to -1 ... 1 range
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Calculate target rotation based on mouse position
        // Apply sensitivity multiplier
        // For horizontal: 360° rotation = allow any value (don't clamp)
        targetRotationY = mouseX * cameraSensitivity * Math.PI; // Full 180° both sides = 360° total
        targetRotationX = mouseY * cameraSensitivity * maxRotationX / Math.PI; // Keep vertical limited
    });
    
    // When mouse leaves, slowly return to center
    renderer.domElement.addEventListener('mouseleave', () => {
        // Gradually reset to center by interpolating target rotations
        targetRotationY = 0;
        targetRotationX = 0;
    });
}

// Setup camera controls
function setupControls() {
    if (isMobile) {
        // Use DeviceOrientationControls for mobile
        setupDeviceOrientationControls();
    } else {
        // Use mouse-follow look for desktop
        setupMouseFollowControls();
    }
}

// Setup DeviceOrientationControls for mobile
function setupDeviceOrientationControls() {
    try {
        deviceOrientationControls = new THREE.DeviceOrientationControls(camera);
        
        // Handle permission for iOS 13+
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
            // Non-iOS 13+ devices
            deviceOrientationControls.connect();
            document.getElementById('enable-motion').classList.add('hidden');
        }
    } catch (error) {
        console.log('DeviceOrientationControls not supported:', error);
        // Fallback to mouse-follow for desktop
        setupMouseFollowControls();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', handleResize);
    
    // Orientation change
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Visibility change (for performance optimization)
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Setup UI event listeners
function setupUI() {
    // Close modal when clicking outside (on the overlay)
    document.addEventListener('click', (e) => {
        if (currentModal && e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    // Prevent scrolling when modal is open
    document.addEventListener('touchmove', (e) => {
        if (currentModal) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Show material modal
function showMaterialModal(materialId) {
    // Close existing modal
    if (currentModal) {
        closeModal();
    }
    
    // Get material data
    const material = materials[materialId];
    if (!material) return;
    
    // Create modal
    const modal = createModal(material);
    document.getElementById('modal-container').appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
        modal.querySelector('.modal-content').classList.add('active');
    }, 10);
    
    // Store current modal
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
    
    // Add close event listener
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    
    return modal;
}

// Close modal
function closeModal() {
    if (!currentModal) return;
    
    const modal = currentModal;
    
    // Hide modal with animation
    modal.classList.remove('active');
    modal.querySelector('.modal-content').classList.remove('active');
    
    // Remove modal after animation
    setTimeout(() => {
        modal.remove();
        currentModal = null;
    }, 300);
}

// Update camera rotation with smooth interpolation
function updateCameraRotation() {
    // Only update if not on modal (modal can still control)
    if (!isMobile) {
        // Interpolate (lerp) current rotation towards target rotation
        currentRotationX += (targetRotationX - currentRotationX) * cameraSmoothing;
        currentRotationY += (targetRotationY - currentRotationY) * cameraSmoothing;
        
        // Apply rotation to camera using Euler angles
        camera.rotation.order = 'YXZ';
        camera.rotation.y = currentRotationY;
        camera.rotation.x = currentRotationX;
    }
}

// Handle window resize
function handleResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Handle orientation change
function handleOrientationChange() {
    // Small delay to ensure proper dimensions
    setTimeout(handleResize, 100);
}

// Handle fullscreen change
function handleFullscreenChange() {
    setTimeout(handleResize, 100);
}

// Handle visibility change (performance optimization)
function handleVisibilityChange() {
    if (document.hidden) {
        // Pause animations when tab is not visible
        if (deviceOrientationControls) {
            deviceOrientationControls.enabled = false;
        }
    } else {
        // Resume animations when tab becomes visible
        if (deviceOrientationControls) {
            deviceOrientationControls.enabled = true;
        }
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');
    
    // Remove loading screen from DOM after animation
    setTimeout(() => {
        loadingScreen.remove();
    }, 500);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update camera rotation (mouse-follow on desktop)
    if (!isMobile) {
        updateCameraRotation();
    }
    
    // Update gaze highlight and center object detection
    updateGazeHighlight();
    
    // Update device orientation controls (mobile)
    if (deviceOrientationControls && deviceOrientationControls.enabled) {
        deviceOrientationControls.update();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Cleanup
    if (renderer) {
        renderer.dispose();
    }
    
    if (deviceOrientationControls) {
        deviceOrientationControls.dispose();
    }
    
    // Dispose materials and geometries
    buttons3D.forEach(btn => {
        btn.geometry.dispose();
        btn.material.map.dispose();
        btn.material.dispose();
    });
    
    // Dispose gaze highlight
    if (gazeHighlight) {
        gazeHighlight.geometry.dispose();
        gazeHighlight.material.dispose();
    }
});
