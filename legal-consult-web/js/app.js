/**
 * Legal Consultation Platform - Main Application
 * State management and routing
 */

const App = {
  state: {
    currentUser: null,
    currentPage: 'landing',
    currentRole: 'customer', // customer, lawyer, admin
    sessions: [],
    activeSession: null,
    messages: [],
    notifications: [],
    isLoading: false
  },

  // Initialize the app
  init() {
    this.checkAuth();
    this.setupEventListeners();
    this.renderCurrentPage();
  },

  // Check authentication status
  checkAuth() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.state.currentUser = JSON.parse(user);
      this.state.currentRole = this.state.currentUser.role.toLowerCase();
    }
  },

  // Setup global event listeners
  setupEventListeners() {
    // Navigation toggle for mobile
    document.addEventListener('click', (e) => {
      const navToggle = e.target.closest('[data-nav-toggle]');
      if (navToggle) {
        document.querySelector('.sidebar')?.classList.toggle('open');
      }
    });

    // Page navigation
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('[data-page]');
      if (navLink) {
        e.preventDefault();
        const page = navLink.dataset.page;
        this.navigateTo(page);
      }
    });

    // Modal close
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop') ||
          e.target.closest('[data-modal-close]')) {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      }
    });
  },

  // Navigate to a page
  navigateTo(page) {
    this.state.currentPage = page;
    this.renderCurrentPage();
    window.scrollTo(0, 0);
  },

  // Render the current page
  renderCurrentPage() {
    const main = document.getElementById('app');
    if (!main) return;

    if (!this.state.currentUser) {
      this.renderLandingPage(main);
    } else {
      this.renderAppLayout(main);
    }
  },

  // Render landing page
  renderLandingPage(container) {
    container.innerHTML = `
      <div class="landing-page">
        <!-- Navigation -->
        <nav class="nav-landing">
          <div class="container">
            <a href="#" class="nav-logo" data-page="landing">
              <div class="nav-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/>
                </svg>
              </div>
              Lexima
            </a>
            <div class="nav-links">
              <a href="#" class="nav-link">Solutions</a>
              <a href="#" class="nav-link">Find Attorney</a>
              <a href="#" class="nav-link">Resources</a>
              <a href="#" class="nav-link">Enterprise</a>
            </div>
            <div class="nav-actions">
              <a href="#" class="btn btn-ghost" data-modal="login">Log in</a>
              <a href="#" class="btn btn-primary" data-modal="register">Start Consultation</a>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero-section">
          <div class="three-canvas-container" id="three-canvas"></div>
          <div class="container">
            <div class="hero-grid">
              <div class="hero-content">
                <div class="hero-badge">
                  AI-POWERED LEGAL INTELLIGENCE
                </div>
                <h1 class="hero-title">
                  Legal clarity for the <span>modern world.</span>
                </h1>
                <p class="hero-description">
                  Access top-tier legal consultation instantly. Our platform combines expert attorneys with neural analysis to provide unmatched precision in legal advice.
                </p>
                <div class="hero-actions">
                  <button class="btn btn-primary btn-lg" data-modal="register">
                    Book a Consultation
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <button class="btn btn-secondary btn-lg">View Case Studies</button>
                </div>
                <div class="flex items-center gap-8 mt-16">
                  <div class="avatar-group">
                    <div class="avatar avatar-sm">JD</div>
                    <div class="avatar avatar-sm">AK</div>
                    <div class="avatar avatar-sm">MC</div>
                  </div>
                  <div>
                    <div class="font-semibold">500+ Qualified Attorneys</div>
                    <div class="text-sm text-muted">Available 24/7 for urgent consultations</div>
                  </div>
                </div>
              </div>
              <div class="hero-widget">
                <div class="quick-analysis-card">
                  <div class="quick-analysis-header">
                    <h3 class="quick-analysis-title">Quick Analysis</h3>
                    <div class="quick-analysis-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                  </div>
                  <form id="quick-analysis-form">
                    <div class="form-group">
                      <label class="form-label">Legal Domain</label>
                      <select class="form-select" id="domain-select">
                        <option value="">Select a domain...</option>
                        <option value="civil">Civil Law</option>
                        <option value="criminal">Criminal Law</option>
                        <option value="land">Land Law</option>
                        <option value="labor">Labor Law</option>
                        <option value="commercial">Commercial Law</option>
                        <option value="family">Family Law</option>
                        <option value="intellectual">Intellectual Property</option>
                        <option value="tax">Tax Law</option>
                        <option value="administrative">Administrative Law</option>
                        <option value="insurance">Insurance Law</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Description</label>
                      <textarea class="form-textarea" rows="3" placeholder="Briefly describe your case..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-accent btn-lg" style="width: 100%;">
                      Match with Expert
                    </button>
                  </form>
                  <div class="quick-analysis-footer">
                    <div class="quick-analysis-stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Fully Encrypted
                    </div>
                    <div class="quick-analysis-stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      Avg. wait: 4 mins
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="stats-section">
          <div class="container">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-item-value">98%</div>
                <div class="stat-item-label">Success Rate</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-value">240k+</div>
                <div class="stat-item-label">Cases Resolved</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-value">&lt;12m</div>
                <div class="stat-item-label">Avg. Response</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-value">50+</div>
                <div class="stat-item-label">Global Markets</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features-section">
          <div class="container">
            <div class="section-header">
              <div>
                <h2 class="section-title">Redefining legal accessibility.</h2>
                <p class="section-description">
                  Lexima utilizes state-of-the-art technology to bridge the gap between complex legal needs and elite representation.
                </p>
              </div>
              <a href="#" class="btn btn-ghost">
                Explore Methodology
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div class="features-grid">
              <div class="feature-card feature-card-light card-hover">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                </div>
                <h3 class="feature-title">Smart Intake</h3>
                <p class="feature-description">
                  Our AI analyzes your legal requirements instantly to categorize and prioritize your consultation request.
                </p>
                <ul class="feature-list">
                  <li class="feature-list-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    NLP Document Scanning
                  </li>
                  <li class="feature-list-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    Instant Conflict Checks
                  </li>
                </ul>
              </div>
              <div class="feature-card feature-card-dark card-hover">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 class="feature-title">Elite Network</h3>
                <p class="feature-description">
                  Connect with a hand-picked network of attorneys from the world's most prestigious firms and practices.
                </p>
                <ul class="feature-list">
                  <li class="feature-list-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    15+ Years Avg. Experience
                  </li>
                  <li class="feature-list-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    Verified Bar Credentials
                  </li>
                </ul>
              </div>
              <div class="feature-card feature-card-light card-hover">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <h3 class="feature-title">Case Predictor</h3>
                <p class="feature-description">
                  Gain data-driven insights into potential case outcomes based on historical court data and legal precedents.
                </p>
                <ul class="feature-list">
                  <li class="feature-list-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    Data Visualization
                  </li>
                  <li class="feature-list-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    Probabilistic Modeling
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <div class="container">
            <div class="cta-card">
              <h2 class="cta-title">Ready to secure your interests?</h2>
              <p class="cta-description">
                Join over 10,000 businesses and individuals who trust Lexima for their legal journey.
              </p>
              <div class="cta-actions">
                <button class="btn btn-lg" style="background: white; color: var(--color-accent);" data-modal="register">
                  Start Your First Session
                </button>
                <button class="btn btn-lg" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">
                  Book an Enterprise Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer-landing">
          <div class="container">
            <div class="footer-grid">
              <div class="footer-brand">
                <div class="footer-logo">
                  <div class="footer-logo-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/>
                    </svg>
                  </div>
                  Lexima
                </div>
                <p class="footer-description">
                  The future of legal consultation is here. Bridging the gap between law and technology for global enterprises.
                </p>
                <div class="footer-social">
                  <a href="#" class="footer-social-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="#" class="footer-social-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 class="footer-column-title">Platform</h4>
                <ul class="footer-links">
                  <li><a href="#" class="footer-link">Case Management</a></li>
                  <li><a href="#" class="footer-link">AI Document Review</a></li>
                  <li><a href="#" class="footer-link">Attorney Network</a></li>
                  <li><a href="#" class="footer-link">Billing & Payments</a></li>
                </ul>
              </div>
              <div>
                <h4 class="footer-column-title">Company</h4>
                <ul class="footer-links">
                  <li><a href="#" class="footer-link">About Us</a></li>
                  <li><a href="#" class="footer-link">Legal Board</a></li>
                  <li><a href="#" class="footer-link">Press & Media</a></li>
                  <li><a href="#" class="footer-link">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 class="footer-column-title">Support</h4>
                <ul class="footer-links">
                  <li><a href="#" class="footer-link">Help Center</a></li>
                  <li><a href="#" class="footer-link">Safety & Ethics</a></li>
                  <li><a href="#" class="footer-link">Cookie Policy</a></li>
                  <li><a href="#" class="footer-link">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div class="footer-bottom">
              <p>2024 Lexima Legal Technologies. All rights reserved.</p>
              <div class="footer-legal-links">
                <a href="#" class="footer-link">Terms of Service</a>
                <a href="#" class="footer-link">Regulatory Information</a>
                <a href="#" class="footer-link">Ethical AI Commitment</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <!-- Login Modal -->
      <div class="modal-backdrop" id="login-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Welcome Back</h3>
            <button class="btn btn-icon btn-ghost" data-modal-close>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form id="login-form">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" placeholder="you@example.com" required>
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" placeholder="Enter your password" required>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">Sign In</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Register Modal -->
      <div class="modal-backdrop" id="register-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Create Account</h3>
            <button class="btn btn-icon btn-ghost" data-modal-close>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form id="register-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" placeholder="you@example.com" required>
              </div>
              <div class="form-group">
                <label class="form-label">I am a...</label>
                <select class="form-select" required>
                  <option value="">Select your role</option>
                  <option value="customer">Customer - Seeking legal advice</option>
                  <option value="lawyer">Lawyer - Providing legal services</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" placeholder="Create a password" required>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">Create Account</button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Initialize Three.js
    this.initThreeJS();

    // Setup modal handlers
    this.setupModalHandlers();
  },

  // Initialize Three.js visualization
  initThreeJS() {
    const container = document.getElementById('three-canvas');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create nodes for legal domains
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xC2410C, transparent: true, opacity: 0.8 });

    const domainColors = [
      0x3B82F6, 0xEF4444, 0x22C55E, 0xF59E0B, 0x8B5CF6,
      0xEC4899, 0x06B6D4, 0xF97316, 0x6366F1, 0x14B8A6
    ];

    // Create legal domain nodes
    for (let i = 0; i < 10; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const material = nodeMaterial.clone();
      material.color.setHex(domainColors[i]);

      const node = new THREE.Mesh(nodeGeometry, material);
      node.position.set(x, y, z);
      node.userData = {
        basePosition: new THREE.Vector3(x, y, z),
        color: domainColors[i],
        domain: ['Civil', 'Criminal', 'Land', 'Labor', 'Commercial', 'Family', 'Intellectual', 'Tax', 'Administrative', 'Insurance'][i]
      };

      nodes.push(node);
      scene.add(node);
    }

    // Create central icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(1.5, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x0F172A,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const centralMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(centralMesh);

    // Create connections between nodes
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xC2410C, transparent: true, opacity: 0.2 });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.6) {
          const points = [nodes[i].position, nodes[j].position];
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
        }
      }
    }

    camera.position.z = 8;

    // Animation
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Rotate central mesh
      centralMesh.rotation.y += 0.002;
      centralMesh.rotation.x += 0.001;

      // Animate nodes
      nodes.forEach((node, i) => {
        const { basePosition } = node.userData;
        node.position.x = basePosition.x + Math.sin(time + i) * 0.1;
        node.position.y = basePosition.y + Math.cos(time * 0.5 + i) * 0.1;
        node.position.z = basePosition.z + Math.sin(time * 0.3 + i) * 0.1;
      });

      // Mouse interaction
      scene.rotation.y += (mouseX * 0.5 - scene.rotation.y) * 0.05;
      scene.rotation.x += (mouseY * 0.3 - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  },

  // Setup modal handlers
  setupModalHandlers() {
    document.addEventListener('click', (e) => {
      const modalTrigger = e.target.closest('[data-modal]');
      if (modalTrigger) {
        const modalId = modalTrigger.dataset.modal;
        document.getElementById(`${modalId}-modal`)?.classList.add('open');
      }
    });

    // Form handlers
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin({ email: 'demo@lexima.com', role: 'customer' });
      });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister({ role: 'customer' });
      });
    }

    const quickAnalysisForm = document.getElementById('quick-analysis-form');
    if (quickAnalysisForm) {
      quickAnalysisForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister({ role: 'customer' });
        document.getElementById('register-modal')?.classList.add('open');
      });
    }
  },

  // Handle login
  handleLogin(user) {
    this.state.currentUser = user;
    this.state.currentRole = user.role.toLowerCase();
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('user', JSON.stringify(user));
    this.navigateTo('dashboard');
  },

  // Handle register
  handleRegister(data) {
    const user = {
      id: 'user_' + Date.now(),
      email: 'demo@lexima.com',
      name: 'Demo User',
      role: data.role || 'customer'
    };
    this.handleLogin(user);
  },

  // Render app layout (dashboard)
  renderAppLayout(container) {
    container.innerHTML = `
      <div class="app-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <a href="#" class="nav-logo" data-page="dashboard">
              <div class="nav-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/>
                </svg>
              </div>
              Lexima
            </a>
          </div>
          <nav class="sidebar-nav">
            <a href="#" class="nav-item ${this.state.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </a>
            <a href="#" class="nav-item ${this.state.currentPage === 'sessions' ? 'active' : ''}" data-page="sessions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Sessions
            </a>
            <a href="#" class="nav-item ${this.state.currentPage === 'chat' ? 'active' : ''}" data-page="chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              Chat
            </a>
            <a href="#" class="nav-item ${this.state.currentPage === 'search' ? 'active' : ''}" data-page="search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Legal Search
            </a>
            <a href="#" class="nav-item ${this.state.currentPage === 'ai' ? 'active' : ''}" data-page="ai">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              AI Assistant
            </a>

            ${this.state.currentRole === 'admin' ? `
            <div class="nav-section-title">Admin</div>
            <a href="#" class="nav-item ${this.state.currentPage === 'users' ? 'active' : ''}" data-page="users">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Users
            </a>
            <a href="#" class="nav-item ${this.state.currentPage === 'audit' ? 'active' : ''}" data-page="audit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              Audit Logs
            </a>
            <a href="#" class="nav-item ${this.state.currentPage === 'monitoring' ? 'active' : ''}" data-page="monitoring">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Monitoring
            </a>
            ` : ''}

            <div class="nav-section-title">Account</div>
            <a href="#" class="nav-item" data-action="logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <header class="main-header">
            <div class="search-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" class="form-input" placeholder="Search consultations, documents...">
            </div>
            <div class="flex items-center gap-4">
              <button class="btn btn-icon btn-ghost">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <div class="avatar">${this.state.currentUser?.name?.charAt(0) || 'U'}</div>
            </div>
          </header>
          <div class="main-body" id="page-content">
            <!-- Page content will be rendered here -->
          </div>
        </main>
      </div>
    `;

    this.renderCurrentPageContent();

    // Logout handler
    document.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.state.currentUser = null;
      this.navigateTo('landing');
    });
  },

  // Render current page content
  renderCurrentPageContent() {
    const content = document.getElementById('page-content');
    if (!content) return;

    switch (this.state.currentPage) {
      case 'dashboard':
        this.renderDashboard(content);
        break;
      case 'sessions':
        this.renderSessions(content);
        break;
      case 'chat':
        this.renderChat(content);
        break;
      case 'search':
        this.renderSearch(content);
        break;
      case 'ai':
        this.renderAIAssistant(content);
        break;
      case 'users':
        this.renderUsers(content);
        break;
      case 'audit':
        this.renderAuditLogs(content);
        break;
      case 'monitoring':
        this.renderMonitoring(content);
        break;
      default:
        this.renderDashboard(content);
    }
  },

  // Render Dashboard
  renderDashboard(container) {
    const isLawyer = this.state.currentRole === 'lawyer';

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Welcome back, ${this.state.currentUser?.name || 'User'}</h1>
        <p class="page-subtitle">Here's an overview of your legal consultation activity.</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="card stat-card">
          <div class="stat-value">${isLawyer ? '12' : '3'}</div>
          <div class="stat-label">Active Sessions</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${isLawyer ? '48' : '15'}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${isLawyer ? '$2,450' : '4'}</div>
          <div class="stat-label">${isLawyer ? 'Earnings' : 'Pending'}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">98%</div>
          <div class="stat-label">Satisfaction</div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Recent Sessions -->
        <div class="card col-span-2">
          <div class="card-header">
            <h3 class="card-title">Recent Sessions</h3>
            <a href="#" class="btn btn-ghost btn-sm" data-page="sessions">View All</a>
          </div>
          <div class="space-y-4">
            ${this.renderSessionItems([
              { id: 1, title: 'Contract Review - NDA Agreement', domain: 'commercial', status: 'in_progress', time: '2 hours ago' },
              { id: 2, title: 'Employment Contract Dispute', domain: 'labor', status: 'completed', time: 'Yesterday' },
              { id: 3, title: 'Intellectual Property Consultation', domain: 'intellectual', status: 'waiting', time: '3 days ago' }
            ])}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div class="space-y-3">
            <button class="btn btn-primary" style="width: 100%;" data-page="sessions">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Consultation
            </button>
            <button class="btn btn-secondary" style="width: 100%;" data-page="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search Legal Docs
            </button>
            <button class="btn btn-secondary" style="width: 100%;" data-page="ai">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>
              AI Assistant
            </button>
          </div>
        </div>
      </div>

      <!-- Legal Domain Stats -->
      <div class="card mt-6">
        <div class="card-header">
          <h3 class="card-title">Consultation by Domain</h3>
        </div>
        <div class="grid grid-cols-5 gap-4">
          ${['Civil', 'Criminal', 'Land', 'Labor', 'Commercial'].map(d => `
            <div class="text-center">
              <div class="session-domain domain-${d.toLowerCase()}" style="margin: 0 auto var(--space-2);">${d}</div>
              <div class="text-2xl font-bold">${Math.floor(Math.random() * 20 + 5)}</div>
              <div class="text-sm text-muted">sessions</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // Render session items
  renderSessionItems(sessions) {
    return sessions.map(s => `
      <div class="session-card card card-hover" style="cursor: pointer;" data-session-id="${s.id}" data-page="chat">
        <div class="session-header">
          <span class="session-domain domain-${s.domain}">${s.domain}</span>
          <span class="badge badge-${s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'info' : 'warning'}">
            ${s.status.replace('_', ' ')}
          </span>
        </div>
        <div class="session-title">${s.title}</div>
        <div class="session-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            ${s.time}
          </span>
        </div>
      </div>
    `).join('');
  },

  // Render Sessions page
  renderSessions(container) {
    container.innerHTML = `
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">Consultation Sessions</h1>
          <p class="page-subtitle">Manage your legal consultation sessions</p>
        </div>
        <button class="btn btn-primary" data-modal="new-session">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Session
        </button>
      </div>

      <div class="sessions-filters">
        <div class="search-input flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" class="form-input" placeholder="Search sessions...">
        </div>
        <select class="form-select" style="width: auto;">
          <option value="">All Status</option>
          <option value="created">Created</option>
          <option value="waiting">Waiting</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select class="form-select" style="width: auto;">
          <option value="">All Domains</option>
          <option value="civil">Civil</option>
          <option value="criminal">Criminal</option>
          <option value="land">Land</option>
          <option value="labor">Labor</option>
          <option value="commercial">Commercial</option>
          <option value="family">Family</option>
          <option value="intellectual">Intellectual</option>
          <option value="tax">Tax</option>
          <option value="administrative">Administrative</option>
          <option value="insurance">Insurance</option>
        </select>
      </div>

      <div class="sessions-grid">
        ${this.renderSessionItems([
          { id: 1, title: 'Contract Review - NDA Agreement', domain: 'commercial', status: 'in_progress', time: '2 hours ago' },
          { id: 2, title: 'Employment Contract Dispute', domain: 'labor', status: 'completed', time: 'Yesterday' },
          { id: 3, title: 'Intellectual Property Consultation', domain: 'intellectual', status: 'waiting', time: '3 days ago' },
          { id: 4, title: 'Real Estate Transaction Review', domain: 'land', status: 'completed', time: '1 week ago' },
          { id: 5, title: 'Business Partnership Agreement', domain: 'commercial', status: 'in_progress', time: 'Just now' },
          { id: 6, title: 'Family Law - Custody Consultation', domain: 'family', status: 'completed', time: '2 weeks ago' }
        ])}
      </div>
    `;
  },

  // Render Chat page
  renderChat(container) {
    container.innerHTML = `
      <div class="chat-layout" style="height: calc(100vh - 72px - var(--space-16));">
        <!-- Chat Sidebar -->
        <div class="chat-sidebar">
          <div class="chat-sidebar-header">
            <input type="text" class="form-input" placeholder="Search conversations...">
          </div>
          <div class="chat-list">
            ${[1, 2, 3, 4, 5].map(i => `
              <div class="chat-item ${i === 1 ? 'active' : ''}" data-chat-id="${i}">
                <div class="avatar">${['MC', 'AK', 'JD', 'SR', 'PL'][i-1]}</div>
                <div class="chat-item-info">
                  <div class="chat-item-name">${['Michael Chen', 'Anna Kim', 'John Doe', 'Sarah Rose', 'Peter Lee'][i-1]}</div>
                  <div class="chat-item-preview">${['Sure, I can help with that...', 'Thanks for the update!', 'Let me check the documents...', 'When are you available?', 'The contract looks good...'][i-1]}</div>
                </div>
                <div class="chat-item-time">${['2m', '1h', '3h', '1d', '2d'][i-1]}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Chat Main -->
        <div class="chat-main">
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="avatar">MC</div>
              <div>
                <div class="chat-header-title">Michael Chen</div>
                <div class="chat-header-status">Online</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-icon btn-ghost">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
              <button class="btn btn-icon btn-ghost">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="21.17" y1="8" x2="12" y2="8"/>
                  <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
                  <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="chat-messages" id="chat-messages">
            <div class="message system">
              <div class="message-content">Session started with Michael Chen - Civil Law Consultation</div>
            </div>
            <div class="message received">
              <div class="avatar">MC</div>
              <div>
                <div class="message-content">
                  Hello! I'm here to help with your civil law consultation. What specific issue would you like to discuss?
                </div>
                <div class="message-time">10:30 AM</div>
              </div>
            </div>
            <div class="message sent">
              <div class="avatar">U</div>
              <div>
                <div class="message-content">
                  Hi Michael, I have a question about a contract dispute with my landlord regarding the security deposit.
                </div>
                <div class="message-time">10:32 AM</div>
              </div>
            </div>
            <div class="message received">
              <div class="avatar">MC</div>
              <div>
                <div class="message-content">
                  I see. Can you provide more details about the situation? When did you move out, and have you received any communication from your landlord about the deposit?
                </div>
                <div class="message-time">10:33 AM</div>
              </div>
            </div>
            <div class="message ai">
              <div class="avatar" style="background: #8B5CF6;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                </svg>
              </div>
              <div>
                <div class="message-content">
                  Based on the conversation, I found relevant legal references: Civil Code Section 1950.5 protects tenant security deposits in California. The landlord must return the deposit within 21 days with an itemized statement.
                </div>
                <div class="message-time">10:34 AM</div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <button class="btn btn-icon btn-ghost">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </button>
            <textarea class="chat-input" placeholder="Type your message..." rows="1" id="message-input"></textarea>
            <button class="btn btn-primary btn-icon" id="send-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat Info Panel -->
        <div class="chat-info-panel">
          <div class="chat-info-section">
            <div class="chat-info-label">Session Info</div>
            <div class="card" style="padding: var(--space-4);">
              <div class="text-sm font-semibold mb-2">Contract Dispute</div>
              <div class="flex gap-2 mb-2">
                <span class="session-domain domain-civil">Civil</span>
                <span class="badge badge-info">In Progress</span>
              </div>
              <div class="text-xs text-muted">
                Started: Jan 15, 2024
              </div>
            </div>
          </div>

          <div class="chat-info-section">
            <div class="chat-info-label">Quick Actions</div>
            <div class="space-y-2">
              <button class="btn btn-secondary btn-sm" style="width: 100%;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                Upload Document
              </button>
              <button class="btn btn-secondary btn-sm" style="width: 100%;" data-page="ai">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                </svg>
                Ask AI
              </button>
            </div>
          </div>

          <div class="chat-info-section">
            <div class="chat-info-label">Shared Files</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 p-2 rounded-lg" style="background: var(--color-border-light);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
                <span class="text-sm truncate">lease_agreement.pdf</span>
              </div>
              <div class="flex items-center gap-2 p-2 rounded-lg" style="background: var(--color-border-light);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
                <span class="text-sm truncate">security_deposit.pdf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Chat functionality
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');

    const sendMessage = () => {
      const text = messageInput.value.trim();
      if (!text) return;

      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const messageEl = document.createElement('div');
      messageEl.className = 'message sent';
      messageEl.innerHTML = `
        <div class="avatar">${this.state.currentUser?.name?.charAt(0) || 'U'}</div>
        <div>
          <div class="message-content">${text}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
      chatMessages.appendChild(messageEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      messageInput.value = '';
    };

    sendButton?.addEventListener('click', sendMessage);
    messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  },

  // Render Search page
  renderSearch(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Legal Document Search</h1>
        <p class="page-subtitle">Search across comprehensive legal databases</p>
      </div>

      <div class="search-layout">
        <!-- Filters -->
        <div class="search-filters">
          <h3 class="card-title mb-4">Filters</h3>

          <div class="form-group">
            <label class="form-label">Legal Domain</label>
            <select class="form-select">
              <option value="">All Domains</option>
              <option value="civil">Civil Law</option>
              <option value="criminal">Criminal Law</option>
              <option value="land">Land Law</option>
              <option value="labor">Labor Law</option>
              <option value="commercial">Commercial Law</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Document Type</label>
            <select class="form-select">
              <option value="">All Types</option>
              <option value="law">Laws & Regulations</option>
              <option value="case">Case Law</option>
              <option value="contract">Contracts & Agreements</option>
              <option value="guide">Legal Guides</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Date Range</label>
            <select class="form-select">
              <option value="">All Time</option>
              <option value="year">Past Year</option>
              <option value="month">Past Month</option>
              <option value="week">Past Week</option>
            </select>
          </div>

          <button class="btn btn-primary" style="width: 100%;">Apply Filters</button>
        </div>

        <!-- Results -->
        <div class="search-results">
          ${[
            { title: 'California Civil Code - Section 1950.5', snippet: 'Security deposits for residential tenancies. Landlord shall return the remaining portion of the deposit within 21 days...', domain: 'civil', date: 'Jan 15, 2024' },
            { title: 'Commercial Lease Agreement Template', snippet: 'Standard commercial lease agreement with provisions for rent, maintenance, and termination conditions...', domain: 'commercial', date: 'Jan 12, 2024' },
            { title: 'Employment Law Overview - Wrongful Termination', snippet: 'Guide to understanding wrongful termination claims, including at-will employment exceptions and protected classes...', domain: 'labor', date: 'Jan 10, 2024' },
            { title: 'Intellectual Property Rights - Copyright Act', snippet: 'Federal copyright law protections, registration procedures, and enforcement mechanisms for creators...', domain: 'intellectual', date: 'Jan 8, 2024' }
          ].map(doc => `
            <div class="search-result-item">
              <div class="flex justify-between items-start mb-2">
                <div class="session-domain domain-${doc.domain}">${doc.domain}</div>
                <span class="text-xs text-muted">${doc.date}</span>
              </div>
              <h3 class="search-result-title">${doc.title}</h3>
              <p class="search-result-snippet">${doc.snippet}</p>
              <div class="search-result-meta">
                <span>12 articles</span>
                <span>500+ citations</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Preview Panel -->
        <div class="card" style="height: fit-content; position: sticky; top: calc(72px + var(--space-8));">
          <h3 class="card-title mb-4">Document Preview</h3>
          <div class="text-sm text-muted mb-4">
            Select a document to preview its content
          </div>
          <div class="p-4 rounded-lg" style="background: var(--color-border-light);">
            <div class="text-xs text-muted mb-2">Preview will appear here</div>
          </div>
        </div>
      </div>
    `;
  },

  // Render AI Assistant page
  renderAIAssistant(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">AI Legal Assistant</h1>
        <p class="page-subtitle">Get instant answers from our legal knowledge base</p>
      </div>

      <div class="ai-layout">
        <!-- Chat Area -->
        <div class="ai-chat">
          <div class="chat-messages" id="ai-messages" style="flex: 1; padding: var(--space-6);">
            <div class="message received">
              <div class="avatar" style="background: #8B5CF6;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                </svg>
              </div>
              <div>
                <div class="message-content">
                  Hello! I'm your AI legal assistant. I can help you with:
                  <ul style="margin-top: 8px; margin-left: 16px;">
                    <li>Legal reference searches</li>
                    <li>Contract analysis and drafting</li>
                    <li>Document summarization</li>
                    <li>Similar case lookup</li>
                  </ul>
                  How can I assist you today?
                </div>
                <div class="message-time">Now</div>
              </div>
            </div>
          </div>
          <div class="chat-input-area">
            <select class="form-select" style="width: auto;">
              <option value="reference">Legal Reference</option>
              <option value="contract">Contract Analysis</option>
              <option value="summary">Document Summary</option>
              <option value="similar">Similar Cases</option>
            </select>
            <textarea class="chat-input" placeholder="Ask me anything about legal matters..." rows="1" id="ai-input"></textarea>
            <button class="btn btn-accent btn-icon" id="ai-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Features Panel -->
        <div class="ai-features">
          <h3 class="card-title mb-4">AI Capabilities</h3>

          <div class="ai-feature-item active">
            <div class="ai-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-sm">Legal Reference</div>
              <div class="text-xs text-muted">Search legal databases</div>
            </div>
          </div>

          <div class="ai-feature-item">
            <div class="ai-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-sm">Contract Draft</div>
              <div class="text-xs text-muted">Generate contract templates</div>
            </div>
          </div>

          <div class="ai-feature-item">
            <div class="ai-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-sm">Document Summary</div>
              <div class="text-xs text-muted">Summarize long documents</div>
            </div>
          </div>

          <div class="ai-feature-item">
            <div class="ai-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-sm">Similar Cases</div>
              <div class="text-xs text-muted">Find relevant precedents</div>
            </div>
          </div>

          <div class="mt-6 p-4 rounded-lg" style="background: var(--color-border-light);">
            <div class="text-xs text-muted mb-2">Response Time</div>
            <div class="flex items-center gap-2">
              <div class="spinner"></div>
              <span class="text-sm">Average: 3-5 seconds</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // AI functionality
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const aiMessages = document.getElementById('ai-messages');

    const sendAIQuery = () => {
      const text = aiInput.value.trim();
      if (!text) return;

      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // User message
      const userMsg = document.createElement('div');
      userMsg.className = 'message sent';
      userMsg.innerHTML = `
        <div class="avatar">${this.state.currentUser?.name?.charAt(0) || 'U'}</div>
        <div>
          <div class="message-content">${text}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
      aiMessages.appendChild(userMsg);

      // AI typing indicator
      const typingEl = document.createElement('div');
      typingEl.className = 'message received';
      typingEl.innerHTML = `
        <div class="avatar" style="background: #8B5CF6;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          </svg>
        </div>
        <div>
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      aiMessages.appendChild(typingEl);
      aiMessages.scrollTop = aiMessages.scrollHeight;

      // Simulate AI response
      setTimeout(() => {
        typingEl.remove();
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message received';
        aiMsg.innerHTML = `
          <div class="avatar" style="background: #8B5CF6;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
          </div>
          <div>
            <div class="message-content">
              Based on your query about "${text}", I've found the following relevant information:
              <p style="margin-top: 8px;">This falls under civil law jurisdiction and relates to contract disputes. According to the Civil Code Section 1950.5, you may be entitled to recover your security deposit within 21 days of move-out.</p>
              <p style="margin-top: 8px;">Would you like me to provide more detailed information or help you draft a demand letter?</p>
            </div>
            <div class="message-time">${time}</div>
          </div>
        `;
        aiMessages.appendChild(aiMsg);
        aiMessages.scrollTop = aiMessages.scrollHeight;
      }, 2000);

      aiInput.value = '';
    };

    aiSend?.addEventListener('click', sendAIQuery);
    aiInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAIQuery();
      }
    });
  },

  // Render Users page (Admin)
  renderUsers(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage platform users and their roles</p>
      </div>

      <div class="card">
        <div class="card-header">
          <input type="text" class="form-input" placeholder="Search users..." style="max-width: 300px;">
          <select class="form-select" style="width: auto;">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="lawyer">Lawyer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', joined: 'Jan 10, 2024' },
                { name: 'Sarah Kim', email: 'sarah.kim@lawfirm.com', role: 'lawyer', status: 'active', joined: 'Dec 15, 2023' },
                { name: 'Michael Chen', email: 'm.chen@lexima.com', role: 'admin', status: 'active', joined: 'Nov 1, 2023' },
                { name: 'Emily Davis', email: 'emily.d@example.com', role: 'customer', status: 'inactive', joined: 'Jan 5, 2024' },
                { name: 'Robert Wilson', email: 'r.wilson@law.com', role: 'lawyer', status: 'active', joined: 'Dec 20, 2023' }
              ].map(user => `
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar avatar-sm">${user.name.split(' ').map(n => n[0]).join('')}</div>
                      <span class="font-medium">${user.name}</span>
                    </div>
                  </td>
                  <td>${user.email}</td>
                  <td><span class="badge badge-${user.role === 'admin' ? 'primary' : user.role === 'lawyer' ? 'info' : 'success'}">${user.role}</span></td>
                  <td><span class="badge badge-${user.status === 'active' ? 'success' : 'warning'}">${user.status}</span></td>
                  <td>${user.joined}</td>
                  <td>
                    <button class="btn btn-ghost btn-sm">Edit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Render Audit Logs page (Admin)
  renderAuditLogs(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Audit Logs</h1>
        <p class="page-subtitle">System activity and compliance logs</p>
      </div>

      <div class="card">
        <div class="card-header">
          <input type="text" class="form-input" placeholder="Search logs..." style="max-width: 300px;">
          <select class="form-select" style="width: auto;">
            <option value="">All Events</option>
            <option value="login">User Login</option>
            <option value="session">Session Created</option>
            <option value="message">Message Sent</option>
            <option value="ai">AI Query</option>
          </select>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>User</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { time: '2024-01-15 14:32:15', event: 'SESSION_CREATED', user: 'john@example.com', resource: 'Session #1234', ip: '192.168.1.1', result: 'Success' },
                { time: '2024-01-15 14:30:00', event: 'USER_LOGIN', user: 'sarah.kim@lawfirm.com', resource: '-', ip: '10.0.0.5', result: 'Success' },
                { time: '2024-01-15 14:28:45', event: 'AI_QUERY', user: 'john@example.com', resource: 'Legal Reference', ip: '192.168.1.1', result: 'Success' },
                { time: '2024-01-15 14:25:30', event: 'MESSAGE_SENT', user: 'm.chen@lexima.com', resource: 'Session #1230', ip: '172.16.0.2', result: 'Success' },
                { time: '2024-01-15 14:20:00', event: 'USER_LOGIN_FAILED', user: 'unknown@example.com', resource: '-', ip: '203.0.113.50', result: 'Failed' }
              ].map(log => `
                <tr>
                  <td class="font-mono text-xs">${log.time}</td>
                  <td><span class="badge badge-info">${log.event}</span></td>
                  <td>${log.user}</td>
                  <td>${log.resource}</td>
                  <td class="font-mono text-xs">${log.ip}</td>
                  <td><span class="badge badge-${log.result === 'Success' ? 'success' : 'error'}">${log.result}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Render Monitoring page (Admin)
  renderMonitoring(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">System Monitoring</h1>
        <p class="page-subtitle">Real-time system health and metrics</p>
      </div>

      <div class="admin-stats-grid">
        <div class="card stat-card">
          <div class="stat-value">99.9%</div>
          <div class="stat-label">Uptime</div>
          <div class="stat-change positive">+0.1%</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">1.2M</div>
          <div class="stat-label">Messages Today</div>
          <div class="stat-change positive">+15%</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">142ms</div>
          <div class="stat-label">Avg Latency</div>
          <div class="stat-change negative">+8ms</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">24</div>
          <div class="stat-label">Active Sessions</div>
          <div class="stat-change positive">+5</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="admin-chart">
          <div class="admin-chart-header">
            <h3 class="admin-chart-title">Message Throughput</h3>
            <select class="form-select" style="width: auto;">
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div style="height: 200px; display: flex; align-items: flex-end; gap: 4px; padding: 16px 0;">
            ${[65, 80, 75, 90, 85, 95, 88, 92, 78, 85, 98, 95].map(h => `
              <div style="flex: 1; height: ${h}%; background: var(--color-accent); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
            `).join('')}
          </div>
        </div>

        <div class="admin-chart">
          <div class="admin-chart-header">
            <h3 class="admin-chart-title">Kafka Topics</h3>
          </div>
          <div class="space-y-4">
            ${[
              { name: 'chat.message', lag: '0', rate: '1.2K/s' },
              { name: 'consultation.events', lag: '12', rate: '150/s' },
              { name: 'audit.log', lag: '5', rate: '80/s' },
              { name: 'ai.request', lag: '0', rate: '45/s' }
            ].map(topic => `
              <div class="flex justify-between items-center p-3 rounded-lg" style="background: var(--color-border-light);">
                <div>
                  <div class="font-medium text-sm">${topic.name}</div>
                  <div class="text-xs text-muted">${topic.rate}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-muted">Consumer Lag</div>
                  <div class="font-semibold ${parseInt(topic.lag) > 0 ? 'text-warning' : 'text-success'}">${topic.lag}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
