/**
 * Autonomous Vehicle Safety Evaluation Simulation
 * Cruise AV "Poppy" & NPC Interactive Highway Simulator
 */
(function() {
  function initCruiseSimulation() {
    const canvas = document.getElementById('cruiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const LOGICAL_WIDTH = 680;
  const LOGICAL_HEIGHT = 510;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (dpr > 1) {
    canvas.width = Math.round(LOGICAL_WIDTH * dpr);
    canvas.height = Math.round(LOGICAL_HEIGHT * dpr);
  } else {
    canvas.width = LOGICAL_WIDTH;
    canvas.height = LOGICAL_HEIGHT;
  }
  // Responsive sizing: let CSS 100% width & 680/510 aspect-ratio scale smoothly
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const overlay = document.getElementById('simOverlay');
  const startBtn = document.getElementById('startSimBtn');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const startScreenGroup = document.getElementById('startScreenGroup');
  const endScreenGroup = document.getElementById('endScreenGroup');
  const endSummaryText = document.getElementById('endSummaryText');
  const btnEndManual = document.getElementById('btnEndManual');
  const btnEndAuto = document.getElementById('btnEndAuto');
  const mpcEl = document.getElementById('avMpc');
  const nearMissesEl = document.getElementById('avNearMisses');
  const collisionsEl = document.getElementById('avCollisions');
  const statusPill = document.getElementById('avStatusPill');
  const statusText = document.getElementById('avStatusText');
  const nearMissAlert = document.getElementById('nearMissAlert');
  const btnLeft = document.getElementById('btnSteerLeft');
  const btnRight = document.getElementById('btnSteerRight');
  const prominentAutoToggle = document.getElementById('prominentAutoToggle');
  const toggleStateText = document.getElementById('toggleStateText');
  const btnAutoToggleMobile = document.getElementById('btnAutoToggleMobile');
  const telemetryModeTag = document.getElementById('telemetryModeTag');
  const telemetryMilesTag = document.getElementById('telemetryMilesTag');
  const telemetryNearMissTag = document.getElementById('telemetryNearMissTag');
  const telemetryTrackTag = document.getElementById('telemetryTrackTag');
  const telemetrySpeedTag = document.getElementById('telemetrySpeedTag');
  const telemetrySpeedVal = document.getElementById('telemetrySpeedVal');

  // Pause Controls & Modal Elements
  const cockpitPauseBtn = document.getElementById('cockpitPauseBtn');
  const cockpitPauseIcon = document.getElementById('cockpitPauseIcon');
  const cockpitPauseTitle = document.getElementById('cockpitPauseTitle');
  const cockpitPauseSub = document.getElementById('cockpitPauseSub');

  const canvasPauseBtn = document.getElementById('canvasPauseBtn');
  const canvasPauseIcon = document.getElementById('canvasPauseIcon');
  const canvasPauseLabel = document.getElementById('canvasPauseLabel');

  const btnPauseMobile = document.getElementById('btnPauseMobile');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const btnResumeModal = document.getElementById('btnResumeModal');

  const pauseDistVal = document.getElementById('pauseDistVal');
  const pauseSpeedVal = document.getElementById('pauseSpeedVal');
  const pauseModeVal = document.getElementById('pauseModeVal');

  let isPaused = false;

  // A/B Benchmark & Hypothesis Testing elements
  const overlayComparisonCard = document.getElementById('overlayComparisonCard');
  const btnResetHistory = document.getElementById('btnResetHistory');
  const btnTabMpc = document.getElementById('btnTabMpc');
  const btnTabMpnc = document.getElementById('btnTabMpnc');

  const compColManual = document.getElementById('compColManual');
  const compColAuto = document.getElementById('compColAuto');
  const manualWinnerBadge = document.getElementById('manualWinnerBadge');
  const autoWinnerBadge = document.getElementById('autoWinnerBadge');

  const manualSampleBadge = document.getElementById('manualSampleBadge');
  const manualHeroVal = document.getElementById('manualHeroVal');
  const manualHeroLbl = document.getElementById('manualHeroLbl');
  const manualStdVal = document.getElementById('manualStdVal');
  const manualAltLbl = document.getElementById('manualAltLbl');
  const manualAltVal = document.getElementById('manualAltVal');
  const manualTotalMiles = document.getElementById('manualTotalMiles');

  const autoSampleBadge = document.getElementById('autoSampleBadge');
  const autoHeroVal = document.getElementById('autoHeroVal');
  const autoHeroLbl = document.getElementById('autoHeroLbl');
  const autoStdVal = document.getElementById('autoStdVal');
  const autoAltLbl = document.getElementById('autoAltLbl');
  const autoAltVal = document.getElementById('autoAltVal');
  const autoTotalMiles = document.getElementById('autoTotalMiles');

  const hypothesisBanner = document.getElementById('hypothesisBanner');
  const hypoH0Tag = document.getElementById('hypoH0Tag');
  const hypoStatsPill = document.getElementById('hypoStatsPill');
  const hypoVerdict = document.getElementById('hypoVerdict');
  const hypoMiniNote = document.getElementById('hypoMiniNote');

  // Multi-round data storage (persisted across sessions)
  let activeBenchmarkMetric = 'mpc'; // 'mpc' or 'mpnc'
  let currentRunNearMisses = 0;
  let manualRounds = [];
  let autoRounds = [];

  function normalizeRound(entry) {
    if (typeof entry === 'number') {
      const miles = Math.max(0, entry);
      const estNearMisses = Math.max(0, Math.round(miles * 1.5));
      return {
        miles,
        nearMisses: estNearMisses,
        collisions: 1,
        mpc: miles,
        mpnc: miles / (estNearMisses + 1)
      };
    }
    if (entry && typeof entry === 'object') {
      const miles = typeof entry.miles === 'number' ? entry.miles : (entry.mpc || 0);
      const nearMisses = typeof entry.nearMisses === 'number' ? entry.nearMisses : 0;
      const collisions = typeof entry.collisions === 'number' ? entry.collisions : 1;
      const mpc = miles / Math.max(1, collisions);
      const mpnc = miles / (nearMisses + collisions);
      return { miles, nearMisses, collisions, mpc, mpnc };
    }
    return { miles: 0, nearMisses: 0, collisions: 1, mpc: 0, mpnc: 0 };
  }

  function loadRoundHistory() {
    try {
      const savedManual = localStorage.getItem('av_sim_manual_rounds');
      if (savedManual) {
        const parsed = JSON.parse(savedManual);
        if (Array.isArray(parsed)) manualRounds = parsed.map(normalizeRound);
      }
      const savedAuto = localStorage.getItem('av_sim_auto_rounds');
      if (savedAuto) {
        const parsed = JSON.parse(savedAuto);
        if (Array.isArray(parsed)) autoRounds = parsed.map(normalizeRound);
      }
    } catch (e) {
      console.warn('Could not load round history from localStorage', e);
    }
  }

  function saveRoundHistory() {
    try {
      localStorage.setItem('av_sim_manual_rounds', JSON.stringify(manualRounds));
      localStorage.setItem('av_sim_auto_rounds', JSON.stringify(autoRounds));
    } catch (e) {
      console.warn('Could not save round history to localStorage', e);
    }
  }

  loadRoundHistory();

  // Road configuration - Wider 680px canvas (Road width: 580px, 4 lanes x 145px)
  const roadX = 50;
  const roadW = 580;
  const lanes = 4;
  const laneW = roadW / lanes; // 145
  let roadOffset = 0;
  let trajDashOffset = 0;
  let avTrajDashOffset = 0;
  let lastFrameTime = 0;

  // Cumulative session metrics
  let totalCumulativeMiles = 0;
  let totalCollisions = 0;
  let totalNearMisses = 0;

  // Run state (Starts at highway speed = 3.8, scales dynamically with miles, capped at 9.85: +20% max speed)
  let isPlaying = false;
  let animationId = null;
  let speed = 3.8;
  let baseSpeed = 3.8;
  let currentRunDistance = 0;
  let traffic = [];
  let jaywalkers = [];
  let nextJaywalkerMile = 1.0;
  let spawnTimer = 0;
  let alertTimeout = null;
  let nextVehicleId = 101;

  // Autonomous Mode State (Defaults to OFF / Manual)
  let isAutonomous = false;
  let plannerTargetX = roadX + laneW * 1.5 - 19;
  let plannerStatus = 'NOMINAL CRUISE';
  let targetLane = 1;
  let laneChangeHoldFrames = 0;

  // Player Cruise AV
  const player = {
    x: roadX + laneW * 1.5 - 19,
    y: 415,
    w: 38,
    h: 68,
    threatLevel: 0
  };

  const keys = { left: false, right: false, up: false, down: false };

  // Touch & Pointer Drag Steering State (Mobile / Desktop)
  let isDragging = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragTargetX = player.x;
  let dragTargetY = player.y;

  // Multiple vehicle types configuration (Paced for slightly increased difficulty)
  const VEHICLE_ARCHETYPES = [
    {
      type: 'sedan',
      label: 'SEDAN',
      w: 36,
      h: 62,
      weight: 36,
      speedFactor: 0.42,
      colors: ['#0284c7', '#3b82f6', '#475569', '#10b981', '#6366f1', '#e11d48', '#d97706']
    },
    {
      type: 'suv',
      label: 'SUV',
      w: 40,
      h: 68,
      weight: 24,
      speedFactor: 0.38,
      colors: ['#334155', '#1e293b', '#0369a1', '#059669', '#b91c1c']
    },
    {
      type: 'truck',
      label: 'TRUCK',
      w: 42,
      h: 96,
      weight: 16,
      speedFactor: 0.30,
      colors: ['#475569', '#64748b', '#0284c7', '#d97706']
    },
    {
      type: 'bus',
      label: 'BUS',
      w: 44,
      h: 112,
      weight: 10,
      speedFactor: 0.26,
      colors: ['#0284c7', '#059669', '#d97706']
    },
    {
      type: 'moto',
      label: 'MOTO',
      w: 20,
      h: 40,
      weight: 14,
      speedFactor: 0.50,
      colors: ['#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6']
    }
  ];

  // Easter Egg Autonomous Vehicles (Waymo AV, Zoox AV, Tesla Cybercab Robotaxi)
  const AV_EASTER_EGGS = [
    {
      type: 'waymo',
      label: 'WAYMO AV',
      sublabel: 'WAYMO 5TH GEN',
      w: 39,
      h: 70,
      speedFactor: 0.44,
      color: '#ffffff',
      boxColor: '#00e5ff'
    },
    {
      type: 'zoox',
      label: 'ZOOX AV',
      sublabel: 'ZOOX ROBOTAXI',
      w: 42,
      h: 66,
      speedFactor: 0.40,
      color: '#09090b',
      boxColor: '#38bdf8'
    },
    {
      type: 'tesla',
      label: 'TESLA ROBOTAXI',
      sublabel: 'TESLA CYBERCAB',
      w: 38,
      h: 68,
      speedFactor: 0.50,
      color: '#d4af37',
      boxColor: '#eab308'
    }
  ];

  // Helper to pick random archetype according to frequency weights
  function getRandomVehicleArchetype() {
    const totalWeight = VEHICLE_ARCHETYPES.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let arch of VEHICLE_ARCHETYPES) {
      if (rand < arch.weight) return arch;
      rand -= arch.weight;
    }
    return VEHICLE_ARCHETYPES[0];
  }

  // Toggle Autonomous Mode
  function setAutonomousMode(enabled) {
    isAutonomous = enabled;
    if (prominentAutoToggle) {
      if (isAutonomous) prominentAutoToggle.classList.add('active');
      else prominentAutoToggle.classList.remove('active');
    }
    if (toggleStateText) {
      toggleStateText.textContent = isAutonomous ? 'ENGAGED (ACTIVE)' : 'DISENGAGED (MANUAL)';
    }
    if (btnAutoToggleMobile) {
      if (isAutonomous) {
        btnAutoToggleMobile.classList.add('active');
        btnAutoToggleMobile.textContent = '🤖 Auto: ON';
      } else {
        btnAutoToggleMobile.classList.remove('active');
        btnAutoToggleMobile.textContent = '🎮 Manual Mode';
      }
    }
    if (telemetryModeTag) {
      if (isAutonomous) {
        telemetryModeTag.textContent = 'MODE: AUTONOMOUS';
        telemetryModeTag.className = 'telemetry-tag tag--mode';
      } else {
        telemetryModeTag.textContent = 'MODE: MANUAL';
        telemetryModeTag.className = 'telemetry-tag';
      }
    }
    if (isPaused && pauseModeVal) {
      pauseModeVal.textContent = isAutonomous ? 'Poppy (Self Driving)' : 'Poppy (Manual)';
    }
  }

  // --- Pause & Resume State Controls ---
  function updatePauseButtons(paused) {
    if (cockpitPauseIcon) cockpitPauseIcon.textContent = paused ? '▶' : '⏸';
    if (cockpitPauseTitle) cockpitPauseTitle.textContent = paused ? 'RESUME' : 'PAUSE';
    if (cockpitPauseSub) cockpitPauseSub.textContent = paused ? 'CLICK TO PLAY' : 'SIMULATION';
    if (cockpitPauseBtn) cockpitPauseBtn.classList.toggle('is-paused', paused);

    if (canvasPauseIcon) canvasPauseIcon.textContent = paused ? '▶' : '⏸';
    if (canvasPauseLabel) canvasPauseLabel.textContent = paused ? 'RESUME' : 'PAUSE';
    if (canvasPauseBtn) canvasPauseBtn.classList.toggle('is-paused', paused);

    if (btnPauseMobile) {
      btnPauseMobile.textContent = paused ? '▶ Resume' : '⏸ Pause';
      btnPauseMobile.classList.toggle('is-paused', paused);
    }
  }

  function pauseGame() {
    if (!isPlaying || isPaused) return;
    isPaused = true;
    if (isDragging) {
      isDragging = false;
      dragPointerId = null;
      canvas.style.cursor = 'default';
    }
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;

    if (animationId) cancelAnimationFrame(animationId);

    const currentRunMiles = currentRunDistance / 5280;
    const displayMph = Math.max(40, Math.round(55 + (speed - 3.8) * 4.95));
    if (pauseDistVal) pauseDistVal.textContent = currentRunMiles.toFixed(2) + ' mi';
    if (pauseSpeedVal) pauseSpeedVal.textContent = displayMph + ' MPH';
    if (pauseModeVal) pauseModeVal.textContent = isAutonomous ? 'Poppy (Self Driving)' : 'Poppy (Manual)';

    if (pauseOverlay) pauseOverlay.style.display = 'flex';

    updatePauseButtons(true);

    if (statusPill) {
      statusPill.className = 'av-status-pill status--warning';
      if (statusText) statusText.textContent = 'LiDAR + Radar + Camera: SIMULATION PAUSED';
    }

    // Immediately re-render canvas with all active perception telemetry
    draw();
  }

  function resumeGame() {
    if (!isPlaying || !isPaused) return;
    isPaused = false;

    if (pauseOverlay) pauseOverlay.style.display = 'none';

    updatePauseButtons(false);
    updateHud();

    if (animationId) cancelAnimationFrame(animationId);
    lastFrameTime = 0;
    loop();
  }

  function togglePause() {
    if (!isPlaying) return;
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }

  if (cockpitPauseBtn) {
    cockpitPauseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      togglePause();
    });
  }

  if (canvasPauseBtn) {
    canvasPauseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      togglePause();
    });
  }

  if (btnPauseMobile) {
    btnPauseMobile.addEventListener('click', function(e) {
      e.preventDefault();
      togglePause();
    });
  }

  if (btnResumeModal) {
    btnResumeModal.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      resumeGame();
    });
  }

  if (pauseOverlay) {
    pauseOverlay.addEventListener('click', function(e) {
      if (e.target === pauseOverlay) {
        resumeGame();
      }
    });
  }

  if (prominentAutoToggle) {
    prominentAutoToggle.addEventListener('click', function() {
      setAutonomousMode(!isAutonomous);
    });
  }

  if (btnAutoToggleMobile) {
    btnAutoToggleMobile.addEventListener('click', function(e) {
      e.preventDefault();
      setAutonomousMode(!isAutonomous);
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', function() {
      startGame();
    });
  }

  if (btnEndManual) {
    btnEndManual.addEventListener('click', function() {
      setAutonomousMode(false);
      startGame(false);
    });
  }

  if (btnEndAuto) {
    btnEndAuto.addEventListener('click', function() {
      setAutonomousMode(true);
      startGame(true);
    });
  }

  // Listen for keyboard input
  window.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar' || e.key === 'p' || e.key === 'P' || (isPlaying && e.key === 'Escape')) {
      if (isPlaying || isPaused) {
        e.preventDefault();
        togglePause();
        return;
      }
    }
    if (e.key === 'a' || e.key === 'A') {
      setAutonomousMode(!isAutonomous);
      return;
    }
    if (!isPlaying || isPaused) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
  });

  window.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
  });

  // Mobile touch buttons
  if (btnLeft && btnRight) {
    btnLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!isPaused) keys.left = true; });
    btnLeft.addEventListener('pointerup', () => { keys.left = false; });
    btnLeft.addEventListener('pointercancel', () => { keys.left = false; });
    btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!isPaused) keys.right = true; });
    btnRight.addEventListener('pointerup', () => { keys.right = false; });
    btnRight.addEventListener('pointercancel', () => { keys.right = false; });
  }

  // --- Mobile Touch & Mouse Drag-to-Steer Engine ---
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener('pointerdown', function(e) {
    if (!isPlaying || isPaused) return;
    if (e.button !== undefined && e.button !== 0) return; // Only primary button / touch

    const coords = getCanvasCoords(e);
    const carCenterX = player.x + player.w / 2;
    const carCenterY = player.y + player.h / 2;
    const distToCar = Math.hypot(coords.x - carCenterX, coords.y - carCenterY);

    // Grab zone: touch within 110px of car or on lower playable roadway
    const isNearCar = distToCar < 110;
    const isInDriveZone = coords.y > 180 && coords.x >= roadX - 30 && coords.x <= roadX + roadW + 30;

    if (isNearCar || isInDriveZone) {
      isDragging = true;
      dragPointerId = e.pointerId;

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}

      // Autonomous mode smoothly disengages when driver manually grabs control
      if (isAutonomous) {
        setAutonomousMode(false);
      }

      if (isNearCar) {
        // Preserves touch offset so user's thumb does not cover or obscure the car
        dragOffsetX = coords.x - player.x;
        dragOffsetY = coords.y - player.y;
        dragTargetX = player.x;
        dragTargetY = player.y;
      } else {
        // Tapped another lane: car slides to finger X position
        dragOffsetX = player.w / 2;
        dragOffsetY = player.h / 2;
        const minX = roadX + 8;
        const maxX = roadX + roadW - player.w - 8;
        dragTargetX = Math.max(minX, Math.min(maxX, coords.x - dragOffsetX));
        dragTargetY = Math.max(180, Math.min(435, coords.y - dragOffsetY));
      }

      canvas.style.cursor = 'grabbing';
      updateHud();
    }
  });

  canvas.addEventListener('pointermove', function(e) {
    if (!isDragging) {
      if (isPlaying) {
        const coords = getCanvasCoords(e);
        const carCenterX = player.x + player.w / 2;
        const carCenterY = player.y + player.h / 2;
        if (Math.hypot(coords.x - carCenterX, coords.y - carCenterY) < 85) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
      return;
    }

    if (e.pointerId !== dragPointerId && dragPointerId !== null) return;

    const coords = getCanvasCoords(e);
    const newX = coords.x - dragOffsetX;
    const newY = coords.y - dragOffsetY;

    // Road boundaries
    const minX = roadX + 8;
    const maxX = roadX + roadW - player.w - 8;
    dragTargetX = Math.max(minX, Math.min(maxX, newX));

    // Vertical range: 180 to 435px
    const minY = 180;
    const maxY = 435;
    dragTargetY = Math.max(minY, Math.min(maxY, newY));
  });

  function stopDrag(e) {
    if (isDragging && (e.pointerId === dragPointerId || dragPointerId === null)) {
      isDragging = false;
      dragPointerId = null;
      canvas.style.cursor = isPlaying ? 'grab' : 'default';
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}
      updateHud();
    }
  }

  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
  canvas.addEventListener('lostpointercapture', stopDrag);

  if (btnResetHistory) {
    btnResetHistory.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      manualRounds = [];
      autoRounds = [];
      try {
        localStorage.removeItem('av_sim_manual_rounds');
        localStorage.removeItem('av_sim_auto_rounds');
      } catch (err) {}
      updateComparisonCard();
    });
  }

  // Metric Switcher Tab & Dual Status Pill listeners
  if (btnTabMpc) {
    btnTabMpc.addEventListener('click', function(e) {
      e.stopPropagation();
      activeBenchmarkMetric = 'mpc';
      updateComparisonCard();
    });
  }
  if (btnTabMpnc) {
    btnTabMpnc.addEventListener('click', function(e) {
      e.stopPropagation();
      activeBenchmarkMetric = 'mpnc';
      updateComparisonCard();
    });
  }

  // --- Statistical Analysis: Poisson Incident Rate Model & Z-Test Engine ---
  // Assumes incident counts K follow a Poisson distribution: K ~ Poisson(lambda * D)
  // Tested parameter: count per mile (lambda = K / D), with Poisson variance Var(lambda) = K / D^2.
  // Testing count per mile is mathematically isomorphic to testing miles per count (M = 1 / lambda).
  // Displayed metric value remains Miles Per Count (D / K).
  function calcPoissonMetric(rounds, metricType) {
    const n = rounds.length;
    if (n === 0) {
      return {
        rounds: 0,
        distance: 0,
        count: 0,
        rate: 0,      // Count per mile (lambda)
        varRate: 0,   // Var(lambda) = K / D^2
        seRate: 0,    // SE(lambda) = sqrt(K) / D
        mpc: 0,       // Miles per count = D / K
        seMpc: 0      // SE(M) = (D / K) / sqrt(K)
      };
    }

    const distance = rounds.reduce((acc, r) => acc + (r.miles || 0), 0);
    let count = 0;
    if (metricType === 'mpc') {
      count = rounds.reduce((acc, r) => acc + (r.collisions !== undefined ? r.collisions : 1), 0);
    } else {
      count = rounds.reduce((acc, r) => acc + ((r.nearMisses || 0) + (r.collisions !== undefined ? r.collisions : 1)), 0);
    }

    if (distance <= 0 || count <= 0) {
      return {
        rounds: n,
        distance,
        count,
        rate: 0,
        varRate: 0,
        seRate: 0,
        mpc: 0,
        seMpc: 0
      };
    }

    // Incident rate: count per mile (lambda)
    const rate = count / distance;
    // Poisson variance of count per mile: Var(K / D) = Var(K) / D^2 = (lambda * D) / D^2 = K / D^2
    const varRate = count / (distance * distance);
    const seRate = Math.sqrt(count) / distance;

    // Miles per count: M = D / K = 1 / lambda
    const mpc = distance / count;
    // Standard error of M by Delta Method: SE(1 / lambda) = (1 / lambda^2) * SE(lambda) = mpc / sqrt(K)
    const seMpc = mpc / Math.sqrt(count);

    return {
      rounds: n,
      distance,
      count,
      rate,
      varRate,
      seRate,
      mpc,
      seMpc
    };
  }

  // Standard Normal Error Function erf(x) - Abramowitz & Stegun 7.1.26 (max error < 1.5e-7)
  function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    const ax = Math.abs(x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1.0 / (1.0 + p * ax);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return sign * y;
  }

  function normalPValue(z) {
    const absZ = Math.abs(z);
    const cdf = 0.5 * (1.0 + erf(absZ / Math.SQRT2));
    return Math.max(0.0, Math.min(1.0, 2.0 * (1.0 - cdf)));
  }

  // Two-Sample Poisson Rate Hypothesis Test
  // H0: lambda_auto = lambda_manual (Equal incident rate per mile, identical to equal miles per incident)
  function runPoissonRateTest(mStats, aStats) {
    if (mStats.rounds < 1 || aStats.rounds < 1 || mStats.distance <= 0 || aStats.distance <= 0) {
      return {
        status: 'insufficient_sample',
        message: `Need ≥ 1 completed drive in each mode for Poisson rate test (Manual: ${mStats.rounds}, Auto: ${aStats.rounds}).`
      };
    }

    if (mStats.count === 0 && aStats.count === 0) {
      return {
        status: 'zero_incidents',
        z: 0,
        pValue: 1.0,
        alpha: 0.05,
        significant: false,
        better: 'none'
      };
    }

    // Difference in count per mile: Manual minus Autonomous
    // If Autonomous has fewer incidents per mile (safer), rate diff > 0 -> Z > 0
    const diffRate = mStats.rate - aStats.rate;

    // Variance under independent Poisson streams: Var(lambda_M) + Var(lambda_A) = K_M/D_M^2 + K_A/D_A^2
    const varDiff = mStats.varRate + aStats.varRate;
    const seDiff = Math.sqrt(varDiff);

    if (seDiff < 1e-12) {
      return {
        status: 'equal_rates',
        z: 0,
        pValue: 1.0,
        alpha: 0.05,
        significant: false,
        better: 'none'
      };
    }

    const z = diffRate / seDiff;
    const pValue = normalPValue(z);
    const alpha = 0.05;
    const significant = pValue < alpha;

    let better = 'none';
    if (significant) {
      better = z > 0 ? 'auto' : 'manual';
    }

    return {
      status: 'success',
      z,
      se: seDiff,
      pValue,
      alpha,
      significant,
      better,
      diffRate
    };
  }

  function updateComparisonCard() {
    if (!overlayComparisonCard) return;

    // Metric 1: Miles per Collision (MPC) under Poisson Model
    const mMpc = calcPoissonMetric(manualRounds, 'mpc');
    const aMpc = calcPoissonMetric(autoRounds, 'mpc');
    const testMpc = runPoissonRateTest(mMpc, aMpc);

    // Metric 2: Miles per Near-Miss + Collision (MPNC) under Poisson Model (Denser event stream)
    const mMpnc = calcPoissonMetric(manualRounds, 'mpnc');
    const aMpnc = calcPoissonMetric(autoRounds, 'mpnc');
    const testMpnc = runPoissonRateTest(mMpnc, aMpnc);

    // Toggle active state on top metric switcher tabs
    if (btnTabMpc) btnTabMpc.classList.toggle('active', activeBenchmarkMetric === 'mpc');
    if (btnTabMpnc) btnTabMpnc.classList.toggle('active', activeBenchmarkMetric === 'mpnc');

    const isMpc = activeBenchmarkMetric === 'mpc';
    const activeM = isMpc ? mMpc : mMpnc;
    const activeA = isMpc ? aMpc : aMpnc;
    const activeTest = isMpc ? testMpc : testMpnc;

    // Determine Winner / Leader for the currently active tab metric
    let winnerMode = 'none';
    let isWinnerSig = false;
    if (activeTest.status !== 'insufficient_sample') {
      if (activeTest.significant) {
        winnerMode = activeTest.better; // 'auto' or 'manual'
        isWinnerSig = true;
      } else if (activeA.rate < activeM.rate - 1e-9) {
        winnerMode = 'auto';
        isWinnerSig = false;
      } else if (activeM.rate < activeA.rate - 1e-9) {
        winnerMode = 'manual';
        isWinnerSig = false;
      }
    }

    // Update Visual Winner Flag Badges & Highlighted Column Container
    if (manualWinnerBadge && autoWinnerBadge && compColManual && compColAuto) {
      if (winnerMode === 'manual') {
        manualWinnerBadge.style.display = 'inline-flex';
        manualWinnerBadge.className = 'winner-flag-badge ' + (isWinnerSig ? 'flag--significant' : 'flag--leader');
        manualWinnerBadge.textContent = isWinnerSig ? '🏆 WINNER ★' : '👑 LEADER';
        compColManual.classList.add('is-winner');

        autoWinnerBadge.style.display = 'none';
        compColAuto.classList.remove('is-winner');
      } else if (winnerMode === 'auto') {
        autoWinnerBadge.style.display = 'inline-flex';
        autoWinnerBadge.className = 'winner-flag-badge ' + (isWinnerSig ? 'flag--significant' : 'flag--leader');
        autoWinnerBadge.textContent = isWinnerSig ? '🏆 WINNER ★' : '👑 LEADER';
        compColAuto.classList.add('is-winner');

        manualWinnerBadge.style.display = 'none';
        compColManual.classList.remove('is-winner');
      } else {
        manualWinnerBadge.style.display = 'none';
        autoWinnerBadge.style.display = 'none';
        compColManual.classList.remove('is-winner');
        compColAuto.classList.remove('is-winner');
      }
    }

    // Update Manual Column - STILL SHOW MILE PER COUNT as requested
    if (manualSampleBadge) manualSampleBadge.textContent = `n = ${manualRounds.length}`;
    if (manualHeroLbl) manualHeroLbl.textContent = isMpc ? 'Miles / Collision (MPC)' : 'Miles / (Near-Miss+Coll)';
    if (manualHeroVal) manualHeroVal.textContent = activeM.count > 0 ? `${activeM.mpc.toFixed(2)} mi` : '—';
    if (manualStdVal) manualStdVal.textContent = activeM.count > 0 ? `±${activeM.seMpc.toFixed(2)} mi (λ: ${activeM.rate.toFixed(2)}/mi)` : '—';
    if (manualAltLbl) manualAltLbl.textContent = isMpc ? 'Miles / (NM+Coll):' : 'Miles / Collision:';
    if (manualAltVal) manualAltVal.textContent = isMpc ? (mMpnc.count > 0 ? `${mMpnc.mpc.toFixed(2)} mi` : '—') : (mMpc.count > 0 ? `${mMpc.mpc.toFixed(2)} mi` : '—');
    if (manualTotalMiles) manualTotalMiles.textContent = `${activeM.distance.toFixed(2)} mi (${activeM.count} ${isMpc ? 'coll' : 'inc'})`;

    // Update Autonomous Column - STILL SHOW MILE PER COUNT as requested
    if (autoSampleBadge) autoSampleBadge.textContent = `n = ${autoRounds.length}`;
    if (autoHeroLbl) autoHeroLbl.textContent = isMpc ? 'Miles / Collision (MPC)' : 'Miles / (Near-Miss+Coll)';
    if (autoHeroVal) autoHeroVal.textContent = activeA.count > 0 ? `${activeA.mpc.toFixed(2)} mi` : '—';
    if (autoStdVal) autoStdVal.textContent = activeA.count > 0 ? `±${activeA.seMpc.toFixed(2)} mi (λ: ${activeA.rate.toFixed(2)}/mi)` : '—';
    if (autoAltLbl) autoAltLbl.textContent = isMpc ? 'Miles / (NM+Coll):' : 'Miles / Collision:';
    if (autoAltVal) autoAltVal.textContent = isMpc ? (aMpnc.count > 0 ? `${aMpnc.mpc.toFixed(2)} mi` : '—') : (aMpc.count > 0 ? `${aMpc.mpc.toFixed(2)} mi` : '—');
    if (autoTotalMiles) autoTotalMiles.textContent = `${activeA.distance.toFixed(2)} mi (${activeA.count} ${isMpc ? 'coll' : 'inc'})`;

    // Hypothesis Testing Banner
    if (activeTest.status === 'insufficient_sample') {
      if (hypothesisBanner) hypothesisBanner.style.display = 'none';
      if (hypoMiniNote) {
        hypoMiniNote.style.display = 'block';
        hypoMiniNote.textContent = `ⓘ Complete ≥1 drive in each mode for Poisson Rate Z-test (${isMpc ? 'Collision MPC' : 'Near-Miss+Coll MPNC'}) (Manual: ${manualRounds.length}, Auto: ${autoRounds.length})`;
      }
    } else {
      if (hypoMiniNote) hypoMiniNote.style.display = 'none';
      if (hypothesisBanner) hypothesisBanner.style.display = 'block';

      const zStr = (activeTest.z >= 0 ? '+' : '') + activeTest.z.toFixed(2);
      const pStr = activeTest.pValue < 0.001 ? '< 0.001' : activeTest.pValue.toFixed(3);
      const metricName = isMpc ? 'Collision Rate (Collisions / Mile)' : 'Incident Rate (Near-Misses + Collisions / Mile)';
      const metricTag = isMpc ? 'COLLISION MPC' : 'NEAR-MISS + COLLISION';
      const metricPillLbl = isMpc ? 'Collision Rate (MPC)' : 'Incident Rate (MPNC)';
      const unitStr = isMpc ? 'coll/mi' : 'inc/mi';

      if (hypoStatsPill) hypoStatsPill.textContent = `Z = ${zStr} | p = ${pStr} | α = 0.05 | ${metricPillLbl}`;

      const denseNote = isMpc ? '' : ' <span style="opacity:0.88;">(Near-misses offer denser Poisson incident counts, achieving higher statistical power).</span>';

      if (activeTest.significant && activeTest.better === 'auto') {
        hypothesisBanner.className = 'hypothesis-banner banner--sig-auto';
        if (hypoH0Tag) hypoH0Tag.textContent = `🏆 AUTONOMOUS WINS (p < 0.05) — ${metricTag}`;
        const mult = activeM.rate > 0 ? (activeM.rate / Math.max(1e-4, activeA.rate)).toFixed(1) + '×' : 'higher';
        if (hypoVerdict) hypoVerdict.innerHTML = `🏆 <strong>Autonomous Mode is the WINNER!</strong> It is statistically significantly safer with <strong>${mult} lower incident rate</strong> per mile (higher ${isMpc ? 'MPC' : 'MPNC'}) than manual driving (Z = ${zStr}, p = ${pStr}, rates: ${activeA.rate.toFixed(2)} vs ${activeM.rate.toFixed(2)} ${unitStr}).${denseNote}`;
      } else if (activeTest.significant && activeTest.better === 'manual') {
        hypothesisBanner.className = 'hypothesis-banner banner--sig-manual';
        if (hypoH0Tag) hypoH0Tag.textContent = `🏆 MANUAL WINS (p < 0.05) — ${metricTag}`;
        const mult = activeA.rate > 0 ? (activeA.rate / Math.max(1e-4, activeM.rate)).toFixed(1) + '×' : 'higher';
        if (hypoVerdict) hypoVerdict.innerHTML = `🏆 <strong>Manual Driving is the WINNER!</strong> It achieved statistically significantly lower incident rate (<strong>${mult} higher ${isMpc ? 'MPC' : 'MPNC'}</strong>) than Autonomous mode (Z = ${zStr}, p = ${pStr}, rates: ${activeA.rate.toFixed(2)} vs ${activeM.rate.toFixed(2)} ${unitStr}).${denseNote}`;
      } else {
        hypothesisBanner.className = 'hypothesis-banner banner--nonsig';
        let leaderNote = '';
        if (winnerMode === 'auto') {
          leaderNote = ` 👑 <strong>Autonomous is currently leading</strong> (${activeA.mpc.toFixed(2)} vs ${activeM.mpc.toFixed(2)} mi/incident), but difference is not yet statistically significant at α = 0.05.`;
        } else if (winnerMode === 'manual') {
          leaderNote = ` 👑 <strong>Manual is currently leading</strong> (${activeM.mpc.toFixed(2)} vs ${activeA.mpc.toFixed(2)} mi/incident), but difference is not yet statistically significant at α = 0.05.`;
        }
        if (hypoH0Tag) hypoH0Tag.textContent = `FAIL TO REJECT H₀ (p ≥ 0.05) — ${metricTag}`;
        if (hypoVerdict) hypoVerdict.innerHTML = `Difference in Poisson ${metricName} is <strong>not statistically significant</strong> at α = 0.05 (Z = ${zStr}, p = ${pStr}, rates: ${activeA.rate.toFixed(2)} vs ${activeM.rate.toFixed(2)} ${unitStr}).${leaderNote} ${isMpc ? 'Tip: Switch to the denser Near-Miss+Collision metric above!' : 'More driving miles recommended.'}`;
      }
    }
  }

  function triggerNearMissAlert() {
    if (!nearMissAlert) return;
    nearMissAlert.classList.add('active');
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
      nearMissAlert.classList.remove('active');
    }, 1200);
  }

  function getMpcText() {
    const currentMiles = currentRunDistance / 5280;
    const sessionMiles = totalCumulativeMiles + currentMiles;
    if (totalCollisions === 0) {
      return sessionMiles.toFixed(2) + ' mi';
    }
    const mpc = sessionMiles / totalCollisions;
    return mpc.toFixed(2) + ' mi';
  }

  function updateHud() {
    if (mpcEl) mpcEl.textContent = getMpcText();
    if (nearMissesEl) nearMissesEl.textContent = totalNearMisses;
    if (collisionsEl) collisionsEl.textContent = totalCollisions;

    const runMiles = currentRunDistance / 5280;
    if (telemetryMilesTag) {
      telemetryMilesTag.textContent = 'MILES DRIVEN: ' + runMiles.toFixed(2) + ' mi';
    }
    if (telemetryNearMissTag) {
      telemetryNearMissTag.textContent = 'NEAR MISSES: ' + currentRunNearMisses;
    }

    const displayMph = Math.max(40, Math.round(55 + (speed - 3.8) * 4.95));
    if (telemetrySpeedVal) {
      telemetrySpeedVal.textContent = displayMph;
    }
    if (telemetrySpeedTag) {
      telemetrySpeedTag.textContent = 'SPEED: ' + displayMph + ' MPH';
    }
    if (telemetryTrackTag) {
      if (isAutonomous) {
        telemetryTrackTag.textContent = plannerStatus || 'SELF DRIVING';
      } else {
        const hasJaywalkerThreat = jaywalkers.some(j => j.threat > 0);
        if (hasJaywalkerThreat) {
          telemetryTrackTag.textContent = 'PEDESTRIAN IN PATH';
        } else {
          const trackedCount = traffic.filter(c => c.threat > 0).length;
          telemetryTrackTag.textContent = 'TRACKING: ' + trackedCount + ' VEHICLES';
        }
      }
    }
  }

  function startGame(modeOverride) {
    if (typeof modeOverride === 'boolean') {
      setAutonomousMode(modeOverride);
    }
    isPlaying = true;
    isPaused = false;
    if (pauseOverlay) pauseOverlay.style.display = 'none';
    updatePauseButtons(false);
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    currentRunDistance = 0;
    currentRunNearMisses = 0;
    baseSpeed = 3.8;
    speed = 3.8;
    traffic = [];
    jaywalkers = [];
    nextJaywalkerMile = 1.0;
    spawnTimer = 0;
    player.x = roadX + laneW * 1.5 - 19;
    player.y = 415;
    targetLane = 1;
    laneChangeHoldFrames = 0;
    plannerTargetX = player.x;
    isDragging = false;
    dragPointerId = null;
    dragTargetX = player.x;
    dragTargetY = player.y;
    canvas.style.cursor = 'grab';
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
    updateHud();
    if (animationId) cancelAnimationFrame(animationId);
    lastFrameTime = 0;
    loop();
  }

  function gameOver() {
    isPlaying = false;
    isPaused = false;
    if (pauseOverlay) pauseOverlay.style.display = 'none';
    updatePauseButtons(false);
    isDragging = false;
    dragPointerId = null;
    canvas.style.cursor = 'default';
    cancelAnimationFrame(animationId);

    // Record metrics
    const runMiles = currentRunDistance / 5280;
    totalCumulativeMiles += runMiles;
    totalCollisions += 1;

    // Record completed round in active driving mode
    const completedRound = {
      miles: runMiles,
      nearMisses: currentRunNearMisses,
      collisions: 1,
      mpc: runMiles,
      mpnc: runMiles / (currentRunNearMisses + 1)
    };
    if (isAutonomous) {
      autoRounds.push(completedRound);
    } else {
      manualRounds.push(completedRound);
    }
    saveRoundHistory();

    updateHud();

    // Show compact End Screen View (Zero-Scroll Layout)
    if (startScreenGroup) startScreenGroup.style.display = 'none';
    if (endScreenGroup) endScreenGroup.style.display = 'block';

    const modeBadge = isAutonomous ? 'Autonomous' : 'Manual';
    if (endSummaryText) {
      endSummaryText.innerHTML = `Last Drive: <strong>${runMiles.toFixed(2)} mi</strong> (${modeBadge}) &nbsp;|&nbsp; Near Misses: <strong>${currentRunNearMisses}</strong> &nbsp;|&nbsp; Collisions: <strong>1</strong>`;
    }

    // Show and update Multi-Round A/B Comparison & Hypothesis Testing Card
    if (overlayComparisonCard) {
      overlayComparisonCard.style.display = 'block';
      updateComparisonCard();
    }

    overlay.classList.remove('hidden');
    overlay.style.display = '';

    statusPill.className = 'av-status-pill status--danger';
    statusText.textContent = 'COLLISION OCCURRED';
  }

  function spawnJaywalker(mileMarker) {
    const m = Math.round(mileMarker);
    const fromLeft = (m % 2 === 1);
    const startX = fromLeft ? (roadX - 16) : (roadX + roadW + 16);
    const vx = fromLeft ? 2.0 : -2.0;
    const id = nextVehicleId++;
    const prob = (98.4 + Math.random() * 1.4).toFixed(1);

    jaywalkers.push({
      id,
      type: 'jaywalker',
      label: 'PEDESTRIAN',
      sublabel: 'JAYWALKER',
      w: 18,
      h: 22,
      x: startX,
      y: 35,
      vx,
      walkCycle: 0,
      prob,
      threat: 1,
      radarPing: 0,
      isNearMiss: false,
      nearMissLogged: false
    });
  }

  function spawnCar() {
    const runMiles = currentRunDistance / 5280;
    // Avoid spawning cars while a jaywalker is crossing near the top of the roadway
    if (jaywalkers.length > 0 && jaywalkers.some(j => j.y < 240)) return;
    // Scale max traffic from 4 up to 5 cars in end-game (> 2.5 mi) for authentic challenge
    const maxCars = runMiles > 2.5 ? 5 : 4;
    if (traffic.length >= maxCars) return;
    const carsNearTop = traffic.filter(c => c.y < 165).length;
    if (carsNearTop >= 2) return;

    const laneIndex = Math.floor(Math.random() * lanes);
    const laneCenterX = roadX + laneIndex * laneW + laneW / 2;

    // Check if lane is already occupied near top
    for (let car of traffic) {
      if (Math.abs(car.x + car.w / 2 - laneCenterX) < 42 && car.y < 175) {
        return;
      }
    }

    // Easter Egg AV roll: ~18% chance of spawning Waymo, Zoox, or Tesla Cybercab
    let arch;
    let isEasterEgg = false;
    if (Math.random() < 0.18) {
      arch = AV_EASTER_EGGS[Math.floor(Math.random() * AV_EASTER_EGGS.length)];
      isEasterEgg = true;
    } else {
      arch = getRandomVehicleArchetype();
    }

    const w = arch.w;
    const h = arch.h;
    const x = laneCenterX - w / 2;

    const carSpeed = speed * (arch.speedFactor + (Math.random() * 0.08 - 0.04));
    const color = isEasterEgg ? arch.color : arch.colors[Math.floor(Math.random() * arch.colors.length)];
    const id = nextVehicleId++;
    const prob = (97.2 + Math.random() * 2.6).toFixed(1);
    const intents = isEasterEgg
      ? ['AV_CRUISE', 'FLEET_ROUTING', 'PRECISION_LANE']
      : ['LANE_KEEP', 'DECEL', 'CRUISE'];
    const intent = intents[Math.floor(Math.random() * intents.length)];

    traffic.push({
      id,
      type: arch.type,
      label: arch.label,
      sublabel: arch.sublabel || arch.label,
      w,
      h,
      x,
      y: -h - 10,
      speed: carSpeed,
      color,
      boxColor: arch.boxColor || null,
      isEasterEgg,
      isBraking: false,
      brakeCooldown: 0,
      prob,
      intent,
      threat: 0,
      isNearMiss: false,
      nearMissLogged: false,
      isCuttingIn: false,
      cutInDone: false,
      targetX: x
    });
  }

  // Autonomous Self-Driving Perception & Tactical Motion Planner (Framerate Independent)
  function runAutonomousPlanner(dt) {
    if (!dt || isNaN(dt)) dt = 1.0;
    const currentLane = Math.max(0, Math.min(lanes - 1, Math.floor((player.x + player.w / 2 - roadX) / laneW)));
    if (laneChangeHoldFrames > 0) laneChangeHoldFrames -= dt;

    // 1. Spatial Occupancy Map for each lane
    const laneLeadDistance = [1200, 1200, 1200, 1200];
    const laneLeadCar = [null, null, null, null];
    const laneHasBlindSpotObstacle = [false, false, false, false];

    for (let car of traffic) {
      const carLeft = car.x;
      const carRight = car.x + car.w;
      const dy = player.y - (car.y + car.h); // positive when car is ahead of player

      for (let l = 0; l < lanes; l++) {
        const laneLeft = roadX + l * laneW;
        const laneRight = laneLeft + laneW;

        // Check if vehicle physically overlaps lane l
        if (carRight > laneLeft + 4 && carLeft < laneRight - 4) {
          // Check blind spot alongside player (longitudinally overlapping or within 45px front/rear)
          if (car.y + car.h > player.y - 45 && car.y < player.y + player.h + 45) {
            laneHasBlindSpotObstacle[l] = true;
          }

          // Check closest lead vehicle in this lane
          if (dy > -15 && dy < laneLeadDistance[l]) {
            laneLeadDistance[l] = dy;
            laneLeadCar[l] = car;
          }
        }
      }
    }

    // 2. Direct Path Obstacle Detection (Forward Trajectory Swath)
    let directLeadCar = null;
    let directLeadDistance = 1200;

    for (let car of traffic) {
      const latDist = Math.abs((car.x + car.w / 2) - (player.x + player.w / 2));
      const latOverlap = latDist < (car.w / 2 + player.w / 2 + 10);
      const dy = player.y - (car.y + car.h);

      if (latOverlap && dy > -15 && dy < directLeadDistance) {
        directLeadDistance = dy;
        directLeadCar = car;
      }
    }

    // 2b. Jaywalker Hazard Detection & Yielding (Vulnerable Road User Safety)
    let jaywalkerHazard = null;
    let jaywalkerDist = 1200;

    for (let j of jaywalkers) {
      const dy = player.y - (j.y + j.h);
      const dx = (j.x + j.w / 2) - (player.x + player.w / 2);
      const absDx = Math.abs(dx);

      if (dy > -20 && dy < 340) {
        const timeToReach = dy / Math.max(1.5, speed * 1.5);
        const projectedX = j.x + j.vx * timeToReach;
        const projectedDx = Math.abs((projectedX + j.w / 2) - (player.x + player.w / 2));

        if (absDx < 68 || projectedDx < 62) {
          if (dy < jaywalkerDist) {
            jaywalkerDist = dy;
            jaywalkerHazard = j;
          }
        }
      }
    }

    // 3. Adaptive Cruise Control (ACC) & Automatic Emergency Braking (AEB)
    const safeFollowingDistance = 160 + (speed * 16);

    if (jaywalkerHazard) {
      if (jaywalkerDist < 130) {
        // Critical Emergency Braking for Pedestrian
        speed = Math.max(0.6, speed - 0.45 * dt);
        plannerStatus = 'AEB: YIELDING TO JAYWALKER';
      } else {
        // Smooth Deceleration to Yield
        speed = Math.max(1.8, speed - 0.25 * dt);
        plannerStatus = 'SLOWING: JAYWALKER CROSSING';
      }

      // Tactical lane evasion if clear
      if (laneChangeHoldFrames <= 0 && jaywalkerDist > 85) {
        const pedIsLeft = (jaywalkerHazard.x + jaywalkerHazard.w / 2) < (player.x + player.w / 2);
        const dodgeLane = pedIsLeft ? Math.min(lanes - 1, currentLane + 1) : Math.max(0, currentLane - 1);
        if (dodgeLane !== currentLane && !laneHasBlindSpotObstacle[dodgeLane] && laneLeadDistance[dodgeLane] > 180) {
          targetLane = dodgeLane;
          laneChangeHoldFrames = 26;
          plannerStatus = 'EVADING JAYWALKER';
        }
      }
    } else if (directLeadCar) {
      const closingRate = (speed - directLeadCar.speed) + 2.0;

      if (directLeadDistance < 90 || (closingRate > 2.0 && directLeadDistance < 130)) {
        // Critical Proximity: Automatic Emergency Braking (AEB)
        speed = Math.max(2.2, speed - 0.35 * dt);
        plannerStatus = 'AEB EMERGENCY BRAKE';
      } else if (directLeadDistance < safeFollowingDistance) {
        // Safe following distance management: match lead vehicle speed smoothly
        const targetFollowSpeed = Math.max(2.6, directLeadCar.speed - 0.2);
        if (speed > targetFollowSpeed) {
          speed = Math.max(targetFollowSpeed, speed - 0.16 * dt);
        } else {
          speed = Math.min(baseSpeed, speed + 0.06 * dt);
        }
        plannerStatus = 'ACC GAP CONTROL';
      } else {
        // Nominal Cruise: accelerate smoothly up to current baseSpeed
        if (speed < baseSpeed) speed = Math.min(baseSpeed, speed + 0.08 * dt);
        if (speed > baseSpeed) speed = Math.max(baseSpeed, speed - 0.05 * dt);
        plannerStatus = 'NOMINAL CRUISE';
      }
    } else {
      // Clear path ahead: smooth acceleration to baseSpeed
      if (speed < baseSpeed) speed = Math.min(baseSpeed, speed + 0.08 * dt);
      if (speed > baseSpeed) speed = Math.max(baseSpeed, speed - 0.05 * dt);
      plannerStatus = 'NOMINAL CRUISE';
    }

    // 4. Tactical Lane Change Decision Engine (with Blind-Spot Safety & Hysteresis)
    if (laneChangeHoldFrames <= 0) {
      const currentClearance = laneLeadDistance[currentLane];
      const needsLaneChange = currentClearance < 235 || (directLeadCar && directLeadDistance < 210);

      if (needsLaneChange) {
        let bestCandidateLane = currentLane;
        let bestClearance = currentClearance;

        // Candidate lanes must be immediately adjacent (left or right)
        const candidates = [];
        if (currentLane > 0) candidates.push(currentLane - 1);
        if (currentLane < lanes - 1) candidates.push(currentLane + 1);

        for (let cand of candidates) {
          // Hard Safety Veto 1: Blind spot alongside occupied?
          if (laneHasBlindSpotObstacle[cand]) continue;

          // Hard Safety Veto 2: Lead obstacle in candidate lane too close?
          if (laneLeadDistance[cand] < 145) continue;

          // Hysteresis: Must offer at least 85px more clearance than current lane
          if (laneLeadDistance[cand] > bestClearance + 85) {
            bestClearance = laneLeadDistance[cand];
            bestCandidateLane = cand;
          }
        }

        if (bestCandidateLane !== currentLane) {
          targetLane = bestCandidateLane;
          laneChangeHoldFrames = 28; // Hold decision for ~0.45s to complete maneuver cleanly
          plannerStatus = bestCandidateLane > currentLane ? 'LANE CHANGE (RIGHT)' : 'LANE CHANGE (LEFT)';
        }
      } else {
        // Path is clear in current lane: hold lane
        targetLane = currentLane;
      }
    }

    // 5. Lateral Steering Actuation towards Target Lane Center
    plannerTargetX = roadX + targetLane * laneW + laneW / 2 - player.w / 2;
    const steerDiff = plannerTargetX - player.x;
    const steerSpeed = Math.min(11.0, 6.2 + (speed * 0.48)) * dt;
    player.x += Math.max(-steerSpeed, Math.min(steerSpeed, steerDiff * 0.22 * dt));
  }

  function loop(timestamp) {
    if (!isPlaying || isPaused) return;

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : (timestamp || Date.now());
    let elapsed = lastFrameTime ? (now - lastFrameTime) : 16.6667;
    lastFrameTime = now;

    // Safety clamp: prevent leaps on tab unfocus, lag spikes, or zero/negative elapsed
    if (elapsed > 80 || elapsed < 1) {
      elapsed = 16.6667;
    }
    const dt = elapsed / 16.6667;

    try {
      update(dt);
      draw();
    } catch (err) {
      console.error('Simulation loop error:', err);
    }

    animationId = requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!dt || isNaN(dt)) dt = 1.0;

    if (isAutonomous) {
      // Autonomous self-driving planner controls steering & throttle
      runAutonomousPlanner(dt);
      // Smoothly return player.y to standard cruise 415 (framerate-independent)
      if (player.y < 415) player.y += Math.min(2.0 * dt, (415 - player.y) * 0.1 * dt);
      if (player.y > 415) player.y -= Math.min(2.0 * dt, (player.y - 415) * 0.1 * dt);
    } else {
      // Manual Mode: Drag-to-steer or keyboard controls
      if (isDragging) {
        // High-precision touch interpolation with anti-jitter smoothing (framerate-independent)
        const lerpFactor = 1.0 - Math.pow(0.35, dt);
        const diffX = dragTargetX - player.x;
        player.x += diffX * lerpFactor;
        const diffY = dragTargetY - player.y;
        player.y += diffY * lerpFactor;

        // Dynamic speed reaction when dragging forward / back
        if (player.y < 370) {
          speed = Math.min(baseSpeed * 1.45, speed + 0.10 * dt);
        } else if (player.y > 420) {
          speed = Math.max(baseSpeed * 0.58, speed - 0.14 * dt);
        } else {
          if (speed < baseSpeed) speed = Math.min(baseSpeed, speed + 0.06 * dt);
          if (speed > baseSpeed) speed = Math.max(baseSpeed, speed - 0.06 * dt);
        }
      } else {
        // Glide player.y smoothly back to nominal cruise line (415)
        if (player.y < 415) player.y += Math.min(2.0 * dt, (415 - player.y) * 0.1 * dt);
        if (player.y > 415) player.y -= Math.min(2.0 * dt, (player.y - 415) * 0.1 * dt);

        if (keys.up) speed = Math.min(speed + 0.10 * dt, baseSpeed * 1.5);
        else if (keys.down) speed = Math.max(speed - 0.18 * dt, baseSpeed * 0.52);
        else {
          if (speed < baseSpeed) speed = Math.min(baseSpeed, speed + 0.06 * dt);
          if (speed > baseSpeed) speed = Math.max(baseSpeed, speed - 0.06 * dt);
        }

        const steerSpeed = 8.4 * dt;
        if (keys.left) player.x -= steerSpeed;
        if (keys.right) player.x += steerSpeed;
      }
    }

    // Boundaries
    const minX = roadX + 8;
    const maxX = roadX + roadW - player.w - 8;
    if (player.x < minX) player.x = minX;
    if (player.x > maxX) player.x = maxX;

    // Road scroll & animated flow offsets (scaled by dt)
    roadOffset = (roadOffset + speed * 1.35 * dt) % 88;
    trajDashOffset = (trajDashOffset + 1.5 * dt) % 17;
    avTrajDashOffset = (avTrajDashOffset + 1.2 * dt) % 12;

    // Distance metrics & Dynamic Speed Progression (Starts at highway speed 3.8, scales with miles, capped at 9.85: +20% max speed)
    currentRunDistance += speed * 1.25 * dt;
    const runMiles = currentRunDistance / 5280;
    baseSpeed = Math.min(9.85, 3.8 + (runMiles * 2.2));
    updateHud();

    // Spawn Jaywalker every mile crossing the street (1.0 mi, 2.0 mi, 3.0 mi, ...)
    if (runMiles >= nextJaywalkerMile && jaywalkers.length === 0) {
      spawnJaywalker(nextJaywalkerMile);
      nextJaywalkerMile += 1.0;
    }

    // Spawn traffic - paced to scale challenge with miles (framerate-independent accumulation)
    spawnTimer += dt;
    const spawnRate = Math.max(34, Math.floor(75 - (runMiles * 6.5)));
    if (spawnTimer >= spawnRate) {
      spawnCar();
      spawnTimer = 0;
    }

    // 360-Degree Perception Sensor Origin (Cruise AV Roof Puck)
    const sensorX = player.x + player.w / 2;
    const sensorY = player.y + 26;

    player.threatLevel = 0; // 0 = Clear, 1 = Detected (Yellow), 2 = Too Close (Red)

    // Update traffic and calculate 360-degree surround perception
    for (let i = traffic.length - 1; i >= 0; i--) {
      const car = traffic[i];
      car.threat = 0;
      car.y += ((speed - car.speed) * 1.15 + 2.7) * dt;

      // Autonomous Easter Egg Collision Avoidance (Waymo, Tesla Cybercab, Zoox):
      // Active Perception, Forward Collision Mitigation, AEB Braking & Yielding to Player
      if (car.isEasterEgg) {
        const frontGap = player.y - (car.y + car.h); // positive when car is ahead of player
        const latOffset = Math.abs((car.x + car.w / 2) - (player.x + player.w / 2));
        const inDirectPath = frontGap > -25 && frontGap < 170 && latOffset < (car.w / 2 + player.w / 2 + 22);

        if (inDirectPath) {
          car.isBraking = true;
          car.brakeCooldown = 28;

          // 1. AEB Deceleration: smooth deceleration without coordinate snapping
          if (frontGap < 110) {
            car.speed = Math.max(0.4, car.speed * Math.pow(0.75, dt));
            car.y -= 2.0 * dt;
          } else {
            car.speed = Math.max(1.0, car.speed - 0.25 * dt);
            car.y -= 1.2 * dt;
          }

          // 2. Tactical Evasive Steering: smoothly nudge laterally towards the clearer lane side
          const steerAwayDir = (car.x + car.w / 2 >= player.x + player.w / 2) ? 1 : -1;
          const minX = roadX + 12;
          const maxX = roadX + roadW - car.w - 12;
          car.x = Math.max(minX, Math.min(maxX, car.x + steerAwayDir * 2.2 * dt));

          // 3. Status intent tag
          if (car.type === 'waymo') car.intent = 'WAYMO_AEB_YIELD';
          else if (car.type === 'tesla') car.intent = 'TESLA_VISION_BRAKE';
          else if (car.type === 'zoox') car.intent = 'ZOOX_AV_MITIGATION';

          // 4. Trigger near-miss mitigation credit if close
          if (frontGap < 85 && !car.nearMissLogged) {
            car.isNearMiss = true;
          }
        } else {
          if (car.brakeCooldown > 0) {
            car.brakeCooldown -= dt;
            car.isBraking = true;
          } else {
            car.isBraking = false;
          }
        }
      } else {
        // At higher mileage (> 2.5 mi, speed approaching 9.85), simulate realistic highway corner cases
        // (Occasional aggressive human driver lane cut-in with smooth progressive steering - NO instant teleportation)
        if (runMiles > 2.5 && car.y > 210 && car.y < 360 && !car.cutInDone && !car.isCuttingIn) {
          const latDist = Math.abs((car.x + car.w / 2) - (player.x + player.w / 2));
          if (latDist > 45 && latDist < 170) {
            const baseProb = Math.min(0.045, 0.015 + ((runMiles - 2.5) * 0.010));
            const effProb = 1.0 - Math.pow(1.0 - baseProb, dt);
            if (Math.random() < effProb) {
              car.isCuttingIn = true;
              car.cutInDone = true;
              car.targetX = player.x + (Math.random() * 16 - 8);
              car.intent = 'AGGRESSIVE CUT-IN';
            }
          }
        }

        // Smooth progressive lateral steering during cut-in maneuver
        if (car.isCuttingIn) {
          const lateralDiff = car.targetX - car.x;
          const maxStep = 3.8 * dt;
          if (Math.abs(lateralDiff) > 2.0 * dt) {
            car.x += Math.sign(lateralDiff) * Math.min(Math.abs(lateralDiff), maxStep);
          } else {
            car.x = car.targetX;
            car.isCuttingIn = false;
          }
        }
      }

      // Natural NPC Pedestrian Yielding: If a jaywalker is crossing directly in front of this car
      for (let j of jaywalkers) {
        const pedDy = j.y - car.y; // positive when pedestrian is ahead of car
        const pedDx = Math.abs((car.x + car.w / 2) - (j.x + j.w / 2));
        if (pedDy > -10 && pedDy < 100 && pedDx < (car.w / 2 + 16)) {
          car.isBraking = true;
          car.speed = Math.max(0.4, car.speed * Math.pow(0.82, dt));
          car.y -= 1.0 * dt;
        }
      }

      const cCenterX = car.x + car.w / 2;
      const cCenterY = car.y + car.h / 2;
      const dx = Math.abs(cCenterX - sensorX);
      const dy = sensorY - cCenterY; // positive when car is ahead of sensor
      const dist360 = Math.sqrt(dx * dx + dy * dy);

      // 360-Degree LiDAR detection envelope covering the wider 4-lane roadway:
      // Front (ahead up to 410px, lateral 225px), Sides (80px longitudinal, lateral 210px), Rear (behind up to 210px, lateral 185px)
      const isIn360Field = (
        (dy > 0 && dy < 410 && dx < 225) ||
        (Math.abs(dy) <= 80 && dx < 210) ||
        (dy <= 0 && -dy < 210 && dx < 185)
      );

      if (isIn360Field) {
        // Critical proximity check (too close in any direction):
        if (Math.abs(dy) < 135 && dx < 66) {
          // RED: Critical Proximity
          car.threat = 2;
          player.threatLevel = Math.max(player.threatLevel, 2);
        } else {
          // YELLOW / CUSTOM: Vehicle Tracked in 360° LiDAR Field
          car.threat = 1;
          player.threatLevel = Math.max(player.threatLevel, 1);
        }

        // Airplane Radar Scan Echo Ping:
        // Calculates how recently the sweeping radar beam crossed over this target
        const sweepPeriod = 3400;
        const currentSweepAngle = ((Date.now() % sweepPeriod) / sweepPeriod) * Math.PI * 2;
        let carAngle = Math.atan2(cCenterY - sensorY, cCenterX - sensorX);
        if (carAngle < 0) carAngle += Math.PI * 2;
        let angleDiff = (currentSweepAngle - carAngle + Math.PI * 2) % (Math.PI * 2);

        if (angleDiff < 1.05) {
          car.radarPing = Math.pow(1.0 - (angleDiff / 1.05), 1.6);
        } else {
          car.radarPing = 0;
        }
      } else {
        car.radarPing = 0;
      }

      // Check collision (forgiving 8px safety margin making gameplay fair)
      if (
        player.x + 8 < car.x + car.w - 4 &&
        player.x + player.w - 8 > car.x + 4 &&
        player.y + 8 < car.y + car.h - 4 &&
        player.y + player.h - 8 > car.y + 4
      ) {
        gameOver();
        return;
      }

      // Check for NEAR MISS:
      if (dy > -20 && dy < 70 && dx < 50) {
        car.isNearMiss = true;
      }

      // When the vehicle clears behind the player safely, count near miss
      if (car.isNearMiss && !car.nearMissLogged && car.y > player.y + player.h) {
        car.nearMissLogged = true;
        currentRunNearMisses++;
        totalNearMisses++;
        updateHud();
        triggerNearMissAlert();
      }

      // Remove offscreen
      if (car.y > LOGICAL_HEIGHT + 120) {
        traffic.splice(i, 1);
      }
    }

    // Update Jaywalkers and calculate 360-degree surround perception
    for (let i = jaywalkers.length - 1; i >= 0; i--) {
      const j = jaywalkers[i];
      j.threat = 0;
      j.x += j.vx * dt;
      const vy = Math.max(1.0, (speed - 1.2) * 0.52 + 1.35);
      j.y += vy * dt;
      j.walkCycle += 0.22 * dt;

      const jCenterX = j.x + j.w / 2;
      const jCenterY = j.y + j.h / 2;
      const dx = Math.abs(jCenterX - sensorX);
      const dy = sensorY - jCenterY;

      const isIn360Field = (
        (dy > 0 && dy < 410 && dx < 225) ||
        (Math.abs(dy) <= 80 && dx < 210) ||
        (dy <= 0 && -dy < 210 && dx < 185)
      );

      if (isIn360Field) {
        if (Math.abs(dy) < 140 && dx < 60) {
          j.threat = 2; // Critical Proximity (Red)
          player.threatLevel = Math.max(player.threatLevel, 2);
        } else {
          j.threat = 1; // Detected (Yellow/Pink)
          player.threatLevel = Math.max(player.threatLevel, 1);
        }

        const sweepPeriod = 3400;
        const currentSweepAngle = ((Date.now() % sweepPeriod) / sweepPeriod) * Math.PI * 2;
        let jAngle = Math.atan2(jCenterY - sensorY, jCenterX - sensorX);
        if (jAngle < 0) jAngle += Math.PI * 2;
        let angleDiff = (currentSweepAngle - jAngle + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 1.05) {
          j.radarPing = Math.pow(1.0 - (angleDiff / 1.05), 1.6);
        } else {
          j.radarPing = 0;
        }
      } else {
        j.radarPing = 0;
      }

      // Check collision with player Cruise AV
      if (
        player.x + 8 < j.x + j.w - 3 &&
        player.x + player.w - 8 > j.x + 3 &&
        player.y + 8 < j.y + j.h - 3 &&
        player.y + player.h - 8 > j.y + 3
      ) {
        gameOver();
        return;
      }

      // Check for NEAR MISS:
      if (dy > -20 && dy < 70 && dx < 50) {
        j.isNearMiss = true;
      }

      if (j.isNearMiss && !j.nearMissLogged && j.y > player.y + player.h) {
        j.nearMissLogged = true;
        currentRunNearMisses++;
        totalNearMisses++;
        updateHud();
        triggerNearMissAlert();
      }

      // Remove when offscreen or crossed far onto shoulder
      if (j.y > LOGICAL_HEIGHT + 60 || (j.vx > 0 && j.x > roadX + roadW + 60) || (j.vx < 0 && j.x < roadX - 60)) {
        jaywalkers.splice(i, 1);
      }
    }

    // Update status badge
    if (player.threatLevel === 2) {
      statusPill.className = 'av-status-pill status--danger';
      const hasPedThreat = jaywalkers.some(j => j.threat === 2);
      statusText.textContent = hasPedThreat
        ? 'LiDAR + Camera: JAYWALKER IN PATH (CRITICAL)'
        : 'LiDAR + Radar + Camera: CRITICAL PROXIMITY (RED)';
    } else if (player.threatLevel === 1) {
      statusPill.className = 'av-status-pill status--warning';
      const hasPedTracked = jaywalkers.some(j => j.threat === 1);
      statusText.textContent = hasPedTracked
        ? 'LiDAR + Camera: JAYWALKER CROSSING DETECTED'
        : 'LiDAR + Radar + Camera: VEHICLE TRACKED (YELLOW)';
    } else {
      statusPill.className = 'av-status-pill status--clear';
      statusText.textContent = 'LiDAR + Radar + Camera: ALL CLEAR';
    }
  }

  function draw() {
    ctx.save();
    if (dpr > 1) {
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // 1. Road background
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Shoulders
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, roadX, LOGICAL_HEIGHT);
    ctx.fillRect(roadX + roadW, 0, LOGICAL_WIDTH - (roadX + roadW), LOGICAL_HEIGHT);

    // Shoulder solid boundary lines
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(roadX, 0);
    ctx.lineTo(roadX, LOGICAL_HEIGHT);
    ctx.moveTo(roadX + roadW, 0);
    ctx.lineTo(roadX + roadW, LOGICAL_HEIGHT);
    ctx.stroke();

    // Road distance telemetry tick markings (Smooth continuous downward flow aligned with 80px cycle)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.font = '9px "JetBrains Mono", monospace';
    for (let y = (roadOffset % 88) - 88; y < LOGICAL_HEIGHT; y += 88) {
      if (y > 0) {
        const distM = Math.max(0, Math.round((player.y - y) / 7));
        ctx.fillText(distM + 'm', 8, y + 3);
        ctx.fillText(distM + 'm', LOGICAL_WIDTH - 30, y + 3);
      }
    }

    // Dashed lane dividers (Fast highway dashed lines: 22px dash + 22px gap = 44px cycle, cleanly dividing 88px)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([22, 22]);
    ctx.lineDashOffset = -roadOffset;

    for (let i = 1; i < lanes; i++) {
      const lx = roadX + i * laneW;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, LOGICAL_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash

    const sensorX = player.x + player.w / 2;
    const sensorY = player.y + 26;

    // 2. Draw 360-Degree LiDAR Perception Field
    draw360LidarPerception(sensorX, sensorY, player.threatLevel);

    // 3. Draw Planned Trajectory Ribbon (in Autonomous Mode)
    if (isAutonomous) {
      drawPlannedTrajectory(sensorX, player.y, plannerTargetX + player.w / 2);
    }

    // 4. Draw Traffic Vehicles with Perception Bounding Boxes & Prediction Tags
    for (let car of traffic) {
      drawVehicle(car);
    }

    // 4b. Draw Jaywalkers Crossing the Street
    for (let j of jaywalkers) {
      drawJaywalker(j);
    }

    // 5. Draw Player Cruise AV
    drawCruiseAV(player.x, player.y, player.w, player.h);

    ctx.restore();
  }

  // 360-Degree Airplane-Style Scanning Radar / LiDAR Perception Field
  function draw360LidarPerception(cx, cy, threatLevel) {
    ctx.save();

    // Color definitions based on 360° threat level
    let baseColor = '14, 165, 233'; // Cyan (Clear)
    if (threatLevel === 2) baseColor = '239, 68, 68'; // Red (Critical Proximity)
    else if (threatLevel === 1) baseColor = '245, 158, 11'; // Yellow (Tracked)

    // 1. Subtle 360° Surround Ambient Gradient Field
    const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 380);
    radGrad.addColorStop(0, `rgba(${baseColor}, 0.24)`);
    radGrad.addColorStop(0.35, `rgba(${baseColor}, 0.10)`);
    radGrad.addColorStop(0.75, `rgba(${baseColor}, 0.03)`);
    radGrad.addColorStop(1, `rgba(${baseColor}, 0.0)`);

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 380, 0, Math.PI * 2);
    ctx.fill();

    // 2. Aviation Radar Grid / Azimuth Crosshairs
    ctx.strokeStyle = `rgba(${baseColor}, 0.14)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical Track Axis (Fore / Aft)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 370);
    ctx.lineTo(cx, cy + 370);
    ctx.stroke();

    // Horizontal Axis (Port / Starboard)
    ctx.beginPath();
    ctx.moveTo(cx - 370, cy);
    ctx.lineTo(cx + 370, cy);
    ctx.stroke();

    // 45-degree diagonal bearing lines
    const d45 = 370 * 0.7071;
    ctx.beginPath();
    ctx.moveTo(cx - d45, cy - d45);
    ctx.lineTo(cx + d45, cy + d45);
    ctx.moveTo(cx - d45, cy + d45);
    ctx.lineTo(cx + d45, cy - d45);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 3. Concentric Range Rings (10m, 25m, 45m, 65m)
    const rings = [
      { r: 75, label: '10m' },
      { r: 155, label: '25m' },
      { r: 255, label: '45m' },
      { r: 365, label: '65m' }
    ];

    ctx.lineWidth = 1;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(${baseColor}, 0.65)`;

    rings.forEach((ring, idx) => {
      ctx.strokeStyle = `rgba(${baseColor}, ${idx === rings.length - 1 ? 0.28 : 0.18})`;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.stroke();

      // Ring distance labels
      ctx.fillText(ring.label, cx + 6, cy - ring.r + 9);
      ctx.fillText(ring.label, cx + 6, cy + ring.r - 3);
    });

    // Outer Cardinal Azimuth Ticks (Aircraft Compass Grid)
    ctx.fillStyle = `rgba(${baseColor}, 0.75)`;
    ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('000°', cx, cy - 372);
    ctx.fillText('180°', cx, cy + 382);
    ctx.textAlign = 'left';
    ctx.fillText('090°', cx + 374, cy + 3);
    ctx.textAlign = 'right';
    ctx.fillText('270°', cx - 374, cy + 3);

    // 4. Slow, Smooth Airplane Radar Scanning Sweep Animation
    // Rotates at 3.4 seconds per revolution (17.6 RPM - authentic aircraft radar scan rate)
    const sweepPeriod = 3400;
    const sweepAngle = ((Date.now() % sweepPeriod) / sweepPeriod) * Math.PI * 2;

    // Trailing Phosphor Persistence Wedge (Fading trailing sector)
    const trailAngle = 1.05; // ~60 degree trailing phosphor decay
    const slices = 18;
    for (let s = 0; s < slices; s++) {
      const a1 = sweepAngle - (s + 1) * (trailAngle / slices);
      const a2 = sweepAngle - s * (trailAngle / slices);
      const ratio = 1.0 - (s / slices);
      const alpha = Math.pow(ratio, 1.7) * (threatLevel === 2 ? 0.40 : (threatLevel === 1 ? 0.30 : 0.22));
      ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 370, a1, a2, false);
      ctx.closePath();
      ctx.fill();
    }

    // High-Contrast Leading Sweep Beam Line (Radar Arm)
    ctx.strokeStyle = `rgba(${baseColor}, 0.95)`;
    ctx.lineWidth = threatLevel === 2 ? 2.5 : 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * 370, cy + Math.sin(sweepAngle) * 370);
    ctx.stroke();

    // Antenna Central Emitter Core
    ctx.fillStyle = `rgba(${baseColor}, 0.9)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Sweep Tip Beacon Spark
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(sweepAngle) * 370, cy + Math.sin(sweepAngle) * 370, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Planned Trajectory Ribbon (Autonomous Agent Waypoint Path - Extended 350px Horizon)
  function drawPlannedTrajectory(startX, startY, targetCenterX) {
    ctx.save();
    const horizonDistance = 350; // Deep lookahead planning horizon
    const targetEndY = Math.max(50, startY - horizonDistance);
    const transitionY = Math.max(targetEndY + 70, startY - 170);

    // 1. Drivable Corridor Envelope (Vehicle Swept Clearance Envelope)
    const hw = 17; // Half-width clearance corridor
    const corridorGrad = ctx.createLinearGradient(0, startY, 0, targetEndY);
    corridorGrad.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
    corridorGrad.addColorStop(0.55, 'rgba(14, 165, 233, 0.10)');
    corridorGrad.addColorStop(1, 'rgba(14, 165, 233, 0.02)');
    ctx.fillStyle = corridorGrad;

    ctx.beginPath();
    ctx.moveTo(startX - hw, startY);
    ctx.bezierCurveTo(startX - hw, startY - 60, targetCenterX - hw, transitionY + 60, targetCenterX - hw, transitionY);
    ctx.lineTo(targetCenterX - hw, targetEndY);
    ctx.lineTo(targetCenterX + hw, targetEndY);
    ctx.lineTo(targetCenterX + hw, transitionY);
    ctx.bezierCurveTo(targetCenterX + hw, transitionY + 60, startX + hw, startY - 60, startX + hw, startY);
    ctx.closePath();
    ctx.fill();

    // Subtle side corridor boundary guides
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(startX - hw, startY);
    ctx.bezierCurveTo(startX - hw, startY - 60, targetCenterX - hw, transitionY + 60, targetCenterX - hw, transitionY);
    ctx.lineTo(targetCenterX - hw, targetEndY);
    ctx.moveTo(startX + hw, startY);
    ctx.bezierCurveTo(startX + hw, startY - 60, targetCenterX + hw, transitionY + 60, targetCenterX + hw, transitionY);
    ctx.lineTo(targetCenterX + hw, targetEndY);
    ctx.stroke();

    // 2. Primary Waypoint Trajectory Backbone (Animated Dynamic Flow)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.lineDashOffset = -trajDashOffset;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX, startY - 60, targetCenterX, transitionY + 60, targetCenterX, transitionY);
    ctx.lineTo(targetCenterX, targetEndY);
    ctx.stroke();

    // 3. Intermediate Horizon Waypoint Markers (0.8s, 1.6s, 2.5s lookahead ticks)
    ctx.setLineDash([]);
    const waypointOffsets = [90, 180, 270];
    for (let i = 0; i < waypointOffsets.length; i++) {
      const iy = startY - waypointOffsets[i];
      if (iy > targetEndY + 20) {
        let ix = targetCenterX;
        if (iy > transitionY) {
          const t = (startY - iy) / (startY - transitionY);
          ix = startX + (targetCenterX - startX) * (3 * t * t - 2 * t * t * t);
        }
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.beginPath();
        ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Cross-tick
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ix - 5, iy);
        ctx.lineTo(ix + 5, iy);
        ctx.stroke();
      }
    }

    // 4. Terminal Planning Horizon Node & Concentric Pulse Ring
    const pulse = Math.sin(Date.now() * 0.006) * 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(targetCenterX, targetEndY, 7 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(targetCenterX, targetEndY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(targetCenterX, targetEndY, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 5. Terminal HUD Label
    ctx.font = 'bold 8px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('PLAN 3.5s', targetCenterX, targetEndY - 11);

    ctx.restore();
  }

  // Autonomous Easter Egg AV Planning Trajectory Ribbon (Waymo, Tesla Cybercab, Zoox)
  function drawAVPlanningTrajectory(car) {
    ctx.save();
    const x = car.x;
    const y = car.y;
    const w = car.w;
    const h = car.h;
    const cx = x + w / 2;
    const cy = y + h; // front edge of oncoming AV pointing downwards (+y)

    let brandStroke = 'rgba(0, 212, 255, 0.85)'; // Waymo Cyan
    let brandFill = 'rgba(0, 212, 255, 0.12)';
    let brandLabel = 'WAYMO 5TH GEN';

    if (car.type === 'tesla') {
      brandStroke = 'rgba(245, 158, 11, 0.9)'; // Tesla Gold/Amber
      brandFill = 'rgba(245, 158, 11, 0.12)';
      brandLabel = 'TESLA FSD (VISION)';
    } else if (car.type === 'zoox') {
      brandStroke = 'rgba(16, 185, 129, 0.9)'; // Zoox Mint
      brandFill = 'rgba(16, 185, 129, 0.12)';
      brandLabel = 'ZOOX ROBOTAXI';
    }

    if (car.isBraking) {
      brandStroke = 'rgba(239, 68, 68, 0.95)';
      brandFill = 'rgba(239, 68, 68, 0.22)';
      brandLabel += ' [AEB BRAKING]';
    }

    const planDist = car.isBraking ? 65 : 140;
    const endY = cy + planDist;
    const corridorHalfW = 12;

    // 1. Vehicle Clearance Corridor Envelope
    ctx.fillStyle = brandFill;
    ctx.beginPath();
    ctx.moveTo(cx - corridorHalfW, cy);
    ctx.lineTo(cx - corridorHalfW, endY);
    ctx.lineTo(cx + corridorHalfW, endY);
    ctx.lineTo(cx + corridorHalfW, cy);
    ctx.closePath();
    ctx.fill();

    // Corridor side guide rails
    ctx.strokeStyle = brandStroke;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - corridorHalfW, cy);
    ctx.lineTo(cx - corridorHalfW, endY);
    ctx.moveTo(cx + corridorHalfW, cy);
    ctx.lineTo(cx + corridorHalfW, endY);
    ctx.stroke();

    // 2. Trajectory Centerline
    ctx.strokeStyle = brandStroke;
    ctx.lineWidth = car.isBraking ? 2.8 : 2.2;
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = -avTrajDashOffset;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Intermediate Waypoint Marker
    const midY = cy + planDist * 0.5;
    ctx.fillStyle = brandStroke;
    ctx.beginPath();
    ctx.arc(cx, midY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = brandStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, midY);
    ctx.lineTo(cx + 4, midY);
    ctx.stroke();

    // 4. Terminal Planning Horizon Node & Concentric Pulse Ring
    const pulse = Math.sin(Date.now() * 0.007) * 1.8;
    ctx.strokeStyle = brandStroke;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, endY, 5 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = brandStroke;
    ctx.beginPath();
    ctx.arc(cx, endY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, endY, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 5. Planner Label
    ctx.font = 'bold 7px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = brandStroke;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(brandLabel, cx, endY + 6);

    ctx.restore();
  }

  // Draw Vehicle with Multi-Class Graphics, Reticle Bounding Box, and Prediction HUD
  function drawVehicle(car) {
    ctx.save();
    const x = car.x;
    const y = car.y;
    const w = car.w;
    const h = car.h;

    // 1. Motion Forecasting Trajectory Vector (100% of NPC cars have planning / prediction trajectories)
    if (car.isEasterEgg) {
      drawAVPlanningTrajectory(car);
    } else {
      const predDist = car.threat === 2 ? 120 : (car.threat === 1 ? 95 : 70);
      let strokeCol = 'rgba(56, 189, 248, 0.45)';
      let dotCol = '#38bdf8';
      if (car.threat === 2) {
        strokeCol = 'rgba(239, 68, 68, 0.85)';
        dotCol = '#ef4444';
      } else if (car.threat === 1) {
        strokeCol = 'rgba(245, 158, 11, 0.75)';
        dotCol = '#f59e0b';
      }

      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = car.threat === 2 ? 2.2 : 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.lineTo(x + w / 2, y + h + predDist);
      ctx.stroke();
      ctx.setLineDash([]);

      // Predicted endpoint dot
      ctx.fillStyle = dotCol;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h + predDist, car.threat > 0 ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();

      // Lateral tick
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 4, y + h + predDist);
      ctx.lineTo(x + w / 2 + 4, y + h + predDist);
      ctx.stroke();
    }

    // 2. Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    roundRect(ctx, x + 2, y + 4, w, h, 6, true, false);

    // 3. Render Vehicle Geometry according to Type
    switch (car.type) {
      case 'truck':
        drawTruck(ctx, x, y, w, h, car.color);
        break;
      case 'bus':
        drawBus(ctx, x, y, w, h, car.color);
        break;
      case 'suv':
        drawSUV(ctx, x, y, w, h, car.color);
        break;
      case 'moto':
        drawMoto(ctx, x, y, w, h, car.color);
        break;
      case 'waymo':
        drawWaymo(ctx, x, y, w, h, car.color, car.isBraking);
        break;
      case 'zoox':
        drawZoox(ctx, x, y, w, h, car.color, car.isBraking);
        break;
      case 'tesla':
        drawTesla(ctx, x, y, w, h, car.color, car.isBraking);
        break;
      default:
        drawSedan(ctx, x, y, w, h, car.color);
        break;
    }

    // 4. Airplane Radar Return Echo Ping Wave (Illuminates when scan arm crosses vehicle)
    if (car.radarPing > 0.04) {
      const pingRadius = 10 + (1.0 - car.radarPing) * 26;
      ctx.strokeStyle = car.threat === 2 
        ? `rgba(239, 68, 68, ${car.radarPing * 0.85})` 
        : (car.boxColor ? `${car.boxColor}` : `rgba(245, 158, 11, ${car.radarPing * 0.75})`);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, pingRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 5. Autonomous Perception Bounding Box with Corner Reticles & Prediction Probability
    const showPerception = car.threat > 0 || isPaused;
    if (showPerception) {
      let boxColor;
      if (car.threat === 2) boxColor = '#ef4444';
      else if (car.threat === 1) boxColor = car.boxColor || '#f59e0b';
      else boxColor = car.boxColor || '#38bdf8';

      const offset = 4;
      const cornerLen = 8;

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = (car.threat === 2 ? 2.4 : 1.8) + (car.radarPing || 0) * 1.0;

      // Corner reticles: top-left
      ctx.beginPath();
      ctx.moveTo(x - offset, y - offset + cornerLen);
      ctx.lineTo(x - offset, y - offset);
      ctx.lineTo(x - offset + cornerLen, y - offset);
      ctx.stroke();

      // top-right
      ctx.beginPath();
      ctx.moveTo(x + w + offset - cornerLen, y - offset);
      ctx.lineTo(x + w + offset, y - offset);
      ctx.lineTo(x + w + offset, y - offset + cornerLen);
      ctx.stroke();

      // bottom-left
      ctx.beginPath();
      ctx.moveTo(x - offset, y + h + offset - cornerLen);
      ctx.lineTo(x - offset, y + h + offset);
      ctx.lineTo(x - offset + cornerLen, y + h + offset);
      ctx.stroke();

      // bottom-right
      ctx.beginPath();
      ctx.moveTo(x + w + offset - cornerLen, y + h + offset);
      ctx.lineTo(x + w + offset, y + h + offset);
      ctx.lineTo(x + w + offset, y + h + offset - cornerLen);
      ctx.stroke();

      // 5. Overhead HUD Tag: Class, ID, Prediction Probability & Range
      const dy = player.y - (y + h / 2);
      const distMeters = Math.max(2, Math.round(Math.abs(dy) / 7.5));
      let tagText;
      if (car.threat === 2) {
        tagText = `⚠️ HAZARD (p:${car.prob}%)`;
      } else if (car.threat === 1) {
        tagText = `[${car.sublabel || car.label} #${car.id}] p:${car.prob}%`;
      } else {
        tagText = `[${car.sublabel || car.label} #${car.id}]`;
      }
      const subTag = `${distMeters}m | ${car.intent}`;

      ctx.font = 'bold 9.5px "JetBrains Mono", Consolas, monospace';
      const textW = Math.max(w + 24, Math.max(ctx.measureText(tagText).width, ctx.measureText(subTag).width) + 14);
      const badgeH = 24;
      const badgeX = x + w / 2 - textW / 2;
      const badgeY = y - 28;

      // Tag background - solid high contrast dark glass
      ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
      roundRect(ctx, badgeX, badgeY, textW, badgeH, 5, true, false);

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 1.2;
      roundRect(ctx, badgeX, badgeY, textW, badgeH, 5, false, true);

      // Tag primary line
      ctx.fillStyle = boxColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tagText, x + w / 2, badgeY + 3.5);

      // Tag secondary line
      ctx.font = '700 8.5px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(subTag, x + w / 2, badgeY + 13.5);
    } else if (car.isNearMiss) {
      // Near miss safe mitigation boundary
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 8, false, true);
    }

    // 6. Autonomous AV Braking / Yield Warning Badge (Waymo, Tesla, Zoox)
    if (car.isBraking) {
      ctx.save();
      const strobe = Math.floor(Date.now() / 150) % 2 === 0;
      const alertW = 110;
      const alertH = 17;
      const ax = x + w / 2 - alertW / 2;
      const ay = y - 44; // floats above overhead badge or vehicle roof

      ctx.fillStyle = strobe ? 'rgba(239, 68, 68, 0.95)' : 'rgba(220, 38, 38, 0.9)';
      roundRect(ctx, ax, ay, alertW, alertH, 4, true, false);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      roundRect(ctx, ax, ay, alertW, alertH, 4, false, true);

      ctx.font = 'bold 7.5px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const brand = car.type === 'waymo' ? 'WAYMO: AEB BRAKE' : (car.type === 'tesla' ? 'TESLA: FSD BRAKE' : 'ZOOX: AV YIELD');
      ctx.fillText('⚠️ ' + brand, x + w / 2, ay + alertH / 2);

      // Warning perimeter halo
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 6, false, true);
      ctx.restore();
    }

    ctx.restore();
  }

  // --- Jaywalker Pedestrian Renderer & VRU Perception Bounding Box ---
  function drawJaywalker(j) {
    ctx.save();
    const cx = j.x + j.w / 2;
    const cy = j.y + j.h / 2;
    const isWalkingRight = j.vx > 0;

    // 1. Soft Drop Shadow on Road Asphalt
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Animated Walking Shoes & Legs
    const stride = Math.sin(j.walkCycle) * 4.5;
    ctx.fillStyle = '#1e293b'; // Dark pants / sneakers
    // Left leg/shoe
    ctx.beginPath();
    ctx.ellipse(cx - 3 + (isWalkingRight ? stride : -stride), cy + 7, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right leg/shoe
    ctx.beginPath();
    ctx.ellipse(cx + 3 - (isWalkingRight ? stride : -stride), cy + 7, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Torso & High-Visibility Streetwear Jacket
    ctx.fillStyle = '#06b6d4'; // Vibrant Electric Cyan Jacket
    roundRect(ctx, cx - 7, cy - 4, 14, 10, 4, true, false);

    // High-vis reflective neon chest stripe
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - 6, cy - 1, 12, 2);

    // 4. Animated Arms & Hands
    const armSwing = Math.cos(j.walkCycle) * 4.0;
    ctx.fillStyle = '#fed7aa'; // Natural skin tone
    // Front hand
    ctx.beginPath();
    ctx.arc(cx + (isWalkingRight ? 7 + armSwing : -7 - armSwing), cy + 1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Rear hand
    ctx.beginPath();
    ctx.arc(cx - (isWalkingRight ? 7 + armSwing : -7 - armSwing), cy + 1, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Urban Backpack
    ctx.fillStyle = '#334155';
    roundRect(ctx, cx - 5, cy - 6, 10, 4, 2, true, false);

    // 6. Head & Casual Baseball Cap
    ctx.fillStyle = '#f87171'; // Coral baseball cap
    ctx.beginPath();
    ctx.arc(cx, cy - 4.5, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Cap visor pointed towards walking direction
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    if (isWalkingRight) {
      ctx.ellipse(cx + 3, cy - 4.5, 3.5, 2, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(cx - 3, cy - 4.5, 3.5, 2, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // 7. Autonomous VRU Perception Bounding Box with Corner Reticles
    const showPerception = j.threat > 0 || isPaused;
    if (showPerception) {
      const boxColor = j.threat === 2 ? '#ef4444' : '#ec4899'; // Neon Pink (AV standard for Pedestrian/VRU)
      const offset = 4;
      const cornerLen = 6;

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = (j.threat === 2 ? 2.2 : 1.8) + (j.radarPing || 0) * 1.0;

      const bx = j.x - offset;
      const by = j.y - offset;
      const bw = j.w + offset * 2;
      const bh = j.h + offset * 2;

      // Corner reticles: top-left
      ctx.beginPath();
      ctx.moveTo(bx, by + cornerLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cornerLen, by);
      ctx.stroke();

      // top-right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cornerLen);
      ctx.stroke();

      // bottom-left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cornerLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cornerLen, by + bh);
      ctx.stroke();

      // bottom-right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cornerLen);
      ctx.stroke();

      // 8. Overhead HUD Tag: Class, Range & Direction
      const dy = player.y - cy;
      const distMeters = Math.max(1, Math.round(Math.abs(dy) / 7.5));
      const tagText = j.threat === 2 ? `⚠️ JAYWALKER (p:${j.prob}%)` : `🚶 JAYWALKER #${j.id} (p:${j.prob}%)`;
      const subTag = `${distMeters}m | CROSSING ${isWalkingRight ? '▶' : '◀'}`;

      ctx.font = 'bold 9px "JetBrains Mono", Consolas, monospace';
      const textW = Math.max(j.w + 32, Math.max(ctx.measureText(tagText).width, ctx.measureText(subTag).width) + 12);
      const badgeH = 24;
      const badgeX = cx - textW / 2;
      const badgeY = j.y - 28;

      // Dark glass HUD pill
      ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
      roundRect(ctx, badgeX, badgeY, textW, badgeH, 5, true, false);

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 1.2;
      roundRect(ctx, badgeX, badgeY, textW, badgeH, 5, false, true);

      // Primary tag
      ctx.fillStyle = boxColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tagText, cx, badgeY + 3.5);

      // Secondary tag
      ctx.font = '700 8px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(subTag, cx, badgeY + 13.5);
    } else if (j.isNearMiss) {
      // Near miss safe mitigation boundary
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      roundRect(ctx, j.x - 3, j.y - 3, j.w + 6, j.h + 6, 6, false, true);
    }

    ctx.restore();
  }

  // --- Specific Vehicle Renderers ---
  function drawSedan(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, 6, true, false);

    // Front Windshield (faces down)
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 4, y + h - 24, w - 8, 10, 2.5, true, false);

    // Rear Window
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 4, y + 8, w - 8, 9, 2.5, true, false);

    // Headlights (faces down)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 3, y + h - 3, 6, 3);
    ctx.fillRect(x + w - 9, y + h - 3, 6, 3);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 3, y, 6, 2.5);
    ctx.fillRect(x + w - 9, y, 6, 2.5);
  }

  function drawSUV(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, 7, true, false);

    // Roof rack rails
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 5, y + 16, 2.5, h - 32);
    ctx.fillRect(x + w - 7.5, y + 16, 2.5, h - 32);

    // Front Windshield
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 5, y + h - 25, w - 10, 11, 2.5, true, false);

    // Rear Window
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 5, y + 8, w - 10, 10, 2.5, true, false);

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 4, y + h - 3, 7, 3);
    ctx.fillRect(x + w - 11, y + h - 3, 7, 3);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 4, y, 7, 2.5);
    ctx.fillRect(x + w - 11, y, 6, 2.5);
  }

  function drawTruck(ctx, x, y, w, h, color) {
    // Cargo Box (Rear / Top)
    ctx.fillStyle = '#cbd5e1';
    roundRect(ctx, x, y, w, h - 30, 4, true, false);

    // Cargo Box Roof ribs
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let ry = y + 12; ry < y + h - 35; ry += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 3, ry);
      ctx.lineTo(x + w - 3, ry);
      ctx.stroke();
    }

    // Cab Section (Front / Bottom)
    ctx.fillStyle = color;
    roundRect(ctx, x + 2, y + h - 28, w - 4, 28, 4, true, false);

    // Front Windshield
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 5, y + h - 18, w - 10, 9, 2, true, false);

    // Clearance marker lights
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 4, y + h - 29, 3, 2);
    ctx.fillRect(x + w / 2 - 1.5, y + h - 29, 3, 2);
    ctx.fillRect(x + w - 7, y + h - 29, 3, 2);

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 4, y + h - 3, 7, 3);
    ctx.fillRect(x + w - 11, y + h - 3, 7, 3);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 2, y, 7, 3);
    ctx.fillRect(x + w - 9, y, 7, 3);
  }

  function drawBus(ctx, x, y, w, h, color) {
    // Main Bus Body
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, 6, true, false);

    // Roof HVAC unit
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x + 8, y + 25, w - 16, 26, 3, true, false);

    // Front Windshield
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 4, y + h - 22, w - 8, 14, 3, true, false);

    // Side Windows
    ctx.fillStyle = '#1e293b';
    for (let wy = y + 14; wy < y + h - 30; wy += 14) {
      ctx.fillRect(x + 2, wy, 2.5, 9);
      ctx.fillRect(x + w - 4.5, wy, 2.5, 9);
    }

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 4, y + h - 3, 8, 3);
    ctx.fillRect(x + w - 12, y + h - 3, 8, 3);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 4, y, 8, 3);
    ctx.fillRect(x + w - 12, y, 8, 3);
  }

  function drawMoto(ctx, x, y, w, h, color) {
    // Rider silhouette
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 6, y + 12, w - 12, 16, 3, true, false);

    // Helmet
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 24, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Body chassis
    ctx.fillStyle = color;
    roundRect(ctx, x + 4, y + 6, w - 8, h - 12, 4, true, false);

    // Headlight (central high-beam)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + w / 2 - 3, y + h - 3, 6, 3);

    // Taillight
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + w / 2 - 3, y, 6, 2.5);
  }

  // --- Easter Egg Autonomous Vehicles (Waymo AV, Zoox Robotaxi, Tesla Cybercab) ---
  function drawWaymo(ctx, x, y, w, h, color, isBraking) {
    // 1. Sleek Jaguar I-PACE White EV Silhouette
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    roundRect(ctx, x, y, w, h, 7, true, true);

    // 2. Waymo Signature Cyan Side Aerodynamic Stripes
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(x + 1, y + 15, 2.5, h - 30);
    ctx.fillRect(x + w - 3.5, y + 15, 2.5, h - 30);

    // 3. Panoramic Polarized Glass Roof & Windshields
    // Front windshield (faces downward toward player)
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 4, y + h - 26, w - 8, 12, 3, true, false);
    // Rear window (faces upward)
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 5, y + 8, w - 10, 10, 2.5, true, false);
    // Dark glass center roof section
    ctx.fillStyle = '#090d16';
    roundRect(ctx, x + 6, y + 20, w - 12, h - 44, 2, true, false);

    // 4. Waymo 5th-Gen Roof Sensor Dome
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 9, y + h / 2 - 10, w - 18, 18, 4, true, false);
    // Waymo Cyan LiDAR puck
    ctx.fillStyle = isBraking ? '#ef4444' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Inner sensor core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 5. 4 Perimeter LiDAR/Radar Pods (Mounted on corner fenders)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 2, y + h - 16, 3, 5);
    ctx.fillRect(x + w - 1, y + h - 16, 3, 5);
    ctx.fillRect(x - 2, y + 12, 3, 5);
    ctx.fillRect(x + w - 1, y + 12, 3, 5);

    // Cyan LED sensor beacons on pods
    ctx.fillStyle = isBraking ? '#ef4444' : '#00e5ff';
    ctx.fillRect(x - 1.5, y + h - 15, 2, 3);
    ctx.fillRect(x + w - 0.5, y + h - 15, 2, 3);
    ctx.fillRect(x - 1.5, y + 13, 2, 3);
    ctx.fillRect(x + w - 0.5, y + 13, 2, 3);

    // 6. Modern LED Headlights (Crisp Ice Blue/White, bottom)
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 4, y + h - 3, 8, 3);
    ctx.fillRect(x + w - 12, y + h - 3, 8, 3);

    // 7. Full-Width Slim LED Taillight Bar (top) & Active Brake Bloom
    if (isBraking) {
      ctx.save();
      ctx.fillStyle = '#ff1111';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(x + 2, y - 1, w - 4, 4);
      // Emergency front hazard strobes
      const strobe = Math.floor(Date.now() / 120) % 2 === 0;
      ctx.fillStyle = strobe ? '#ff2222' : '#fef08a';
      ctx.fillRect(x + 4, y + h - 3, 8, 3);
      ctx.fillRect(x + w - 12, y + h - 3, 8, 3);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 3, y, w - 6, 2.5);
    }
  }

  function drawZoox(ctx, x, y, w, h, color, isBraking) {
    ctx.save();

    // 1. Undercarriage Ground Shadow (Lifts vehicle cleanly off the dark asphalt road)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    roundRect(ctx, x - 2, y + 2, w + 4, h + 2, 10, true, false);

    // 2. The 4 Exposed Corner Wheels (Zoox signature four-corner stance)
    const wheelW = 5;
    const wheelH = 13;
    const wheelY1 = y + 3;
    const wheelY2 = y + h - 16;

    ctx.fillStyle = '#09090b'; // Tire rubber
    roundRect(ctx, x - 3, wheelY1, wheelW, wheelH, 2.5, true, false);
    roundRect(ctx, x - 3, wheelY2, wheelW, wheelH, 2.5, true, false);
    roundRect(ctx, x + w - 2, wheelY1, wheelW, wheelH, 2.5, true, false);
    roundRect(ctx, x + w - 2, wheelY2, wheelW, wheelH, 2.5, true, false);

    // Wheel alloy hub accents
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 2, wheelY1 + 3, 2, wheelH - 6);
    ctx.fillRect(x - 2, wheelY2 + 3, 2, wheelH - 6);
    ctx.fillRect(x + w, wheelY1 + 3, 2, wheelH - 6);
    ctx.fillRect(x + w, wheelY2 + 3, 2, wheelH - 6);

    // 3. Main Zoox Symmetrical Carriage Body (Sleek Obsidian Black with Metallic Highlight)
    // Deep piano black bodywork with a clear metallic perimeter bezel so it contrasts with asphalt
    ctx.fillStyle = color || '#18181b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.4;
    roundRect(ctx, x, y, w, h, 10, true, true);

    // Top glossy reflection sheen on body
    const glossGrad = ctx.createLinearGradient(x, y, x + w, y);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    glossGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.16)');
    glossGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.04)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.10)');
    ctx.fillStyle = glossGrad;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 9, true, false);

    // 4. Large Symmetrical Panoramic Glass Canopy (Greenhouse)
    const canopyX = x + 4;
    const canopyY = y + 7;
    const canopyW = w - 8;
    const canopyH = h - 14;

    ctx.fillStyle = '#030712'; // Obsidian dark solar glass
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    roundRect(ctx, canopyX, canopyY, canopyW, canopyH, 6, true, true);

    // 5. Interior Carriage Layout Viewable Through Panoramic Glass:
    // Symmetrical Face-to-Face Passenger Bench Seats (Real Zoox signature interior!)
    ctx.fillStyle = '#27272a'; // Charcoal premium upholstery
    roundRect(ctx, canopyX + 3, canopyY + 4, canopyW - 6, 7, 2, true, false);
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(canopyX + canopyW / 2 - 0.5, canopyY + 4, 1, 7);

    ctx.fillStyle = '#27272a';
    roundRect(ctx, canopyX + 3, canopyY + canopyH - 11, canopyW - 6, 7, 2, true, false);
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(canopyX + canopyW / 2 - 0.5, canopyY + canopyH - 11, 1, 7);

    // Center Cabin Floor & Ambient Lighting
    ctx.fillStyle = 'rgba(0, 212, 143, 0.18)'; // Zoox mint ambient floor glow
    roundRect(ctx, canopyX + 5, canopyY + 14, canopyW - 10, canopyH - 28, 2, true, false);

    // Glass Roof Center Structural Crossbar & Sensor Hub
    ctx.fillStyle = '#18181b';
    ctx.fillRect(canopyX + 1, canopyY + canopyH / 2 - 2, canopyW - 2, 4);

    // 6. Sliding Glass Doors Seams on Flanks
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x + 2, canopyY + 4);
    ctx.lineTo(x + 2, canopyY + canopyH - 4);
    ctx.moveTo(x + w - 2, canopyY + 4);
    ctx.lineTo(x + w - 2, canopyY + canopyH - 4);
    ctx.stroke();

    // 7. Iconic 4-Corner Raised Sensor Pod Towers ("Zoox Ears")
    const podRadius = 4;
    const podPositions = [
      { cx: x - 1, cy: y + 5 },       // Rear-Left
      { cx: x + w + 1, cy: y + 5 },   // Rear-Right
      { cx: x - 1, cy: y + h - 5 },   // Front-Left
      { cx: x + w + 1, cy: y + h - 5 } // Front-Right
    ];

    for (let pod of podPositions) {
      // Pod base mount
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(pod.cx, pod.cy, podRadius + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Spinning LiDAR Puck
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(pod.cx, pod.cy, podRadius - 1, 0, Math.PI * 2);
      ctx.fill();

      // Glowing LED Sensor Ring (Zoox Mint/Cyan ring, Red when braking)
      ctx.strokeStyle = isBraking ? '#ef4444' : '#00d48f';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(pod.cx, pod.cy, podRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8. Bidirectional Curved Light Blades (Front headlights facing down, Rear taillights facing up)
    if (isBraking) {
      ctx.fillStyle = '#ff1111';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      roundRect(ctx, x + 5, y - 1, w - 10, 3.5, 1.5, true, false);
      const strobe = Math.floor(Date.now() / 120) % 2 === 0;
      ctx.fillStyle = strobe ? '#ff2222' : '#fef08a';
      roundRect(ctx, x + 5, y + h - 2.5, w - 10, 3, 1.5, true, false);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 4;
      roundRect(ctx, x + 5, y + h - 2.5, w - 10, 2.5, 1.5, true, false);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 4;
      roundRect(ctx, x + 5, y, w - 10, 2.5, 1.5, true, false);
    }

    ctx.restore();
  }

  function drawTesla(ctx, x, y, w, h, color, isBraking) {
    ctx.save();

    // 1. Tesla Cybercab Aerodynamic Wedge Coupe Body
    // Rear is wide & squared with athletic haunches (Kamm-back), waist is sculpted, front tapers into an aggressive aerodynamic wedge
    ctx.beginPath();
    // Start at rear left corner
    ctx.moveTo(x + 3, y + 5);
    ctx.quadraticCurveTo(x + 3, y, x + 7, y);
    // Kamm-tail flat rear edge
    ctx.lineTo(x + w - 7, y);
    ctx.quadraticCurveTo(x + w - 3, y, x + w - 3, y + 5);
    // Muscular rear right fender haunch
    ctx.lineTo(x + w - 1, y + 20);
    // Tapered coupe waist / butterfly door cut
    ctx.quadraticCurveTo(x + w - 4, y + 34, x + w - 1.5, y + 46);
    // Aggressive wedge nose slope: sharply tapering inward towards the front
    ctx.lineTo(x + w - 7, y + h - 2);
    // Front wedge nose apex / beveled front spoiler
    ctx.quadraticCurveTo(x + w / 2, y + h + 1.5, x + 7, y + h - 2);
    // Left wedge nose slope
    ctx.lineTo(x + 1.5, y + 46);
    // Tapered coupe waist
    ctx.quadraticCurveTo(x + 4, y + 34, x + 1, y + 20);
    // Back to rear haunch
    ctx.closePath();

    // Fill Cybercab metallic champagne/gold paint
    ctx.fillStyle = color || '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 2. Aerodynamic Disc Wheels (Flush Cyber-wheel aero covers on sides)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 1, y + 10, 2.5, 10);
    ctx.fillRect(x + w - 1.5, y + 10, 2.5, 10);
    ctx.fillRect(x - 0.5, y + 40, 2.5, 9);
    ctx.fillRect(x + w - 2, y + 40, 2.5, 9);

    // 3. Wedge Fastback Coupe Glass Canopy (Teardrop-Wedge Greenhouse)
    // Sloping from a raked forward windshield back to a solid fastback decklid
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 14);
    ctx.lineTo(x + w - 8, y + 14);
    ctx.lineTo(x + w - 5, y + 34);
    ctx.lineTo(x + w - 7, y + 50);
    ctx.lineTo(x + 7, y + 50);
    ctx.lineTo(x + 5, y + 34);
    ctx.closePath();
    ctx.fillStyle = '#0f172a'; // High-gloss dark tinted canopy glass
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fastback rear decklid sloped glass / louvre lines
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 9, y + 16, w - 18, 12, 1.5, true, false);

    // Raked front windshield
    ctx.fillStyle = '#090d16';
    roundRect(ctx, x + 8, y + 33, w - 16, 15, 2, true, false);

    // 4. Triple Autopilot Vision Camera Triangle (Top Apex of Windshield)
    ctx.fillStyle = isBraking ? '#ef4444' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 44, 1.8, 0, Math.PI * 2);
    ctx.arc(x + w / 2 - 3.2, y + 42, 1.2, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + 3.2, y + 42, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Angular Butterfly Door Crease / Coupe Character Lines
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 26);
    ctx.lineTo(x + w / 2 - 5, y + 38);
    ctx.lineTo(x + 5, y + 48);
    ctx.moveTo(x + w - 6, y + 26);
    ctx.lineTo(x + w / 2 + 5, y + 38);
    ctx.lineTo(x + w - 5, y + 48);
    ctx.stroke();

    // 6. Full-Width Horizontal Cybertruck / Cybercab Light Bars
    // Front Wedge Nose: Single razor-thin continuous white LED blade spanning the wedge nose
    const frontNoseW = w - 14;
    const frontNoseX = x + 7;
    const frontNoseY = y + h - 3;
    if (isBraking) {
      // Active Brake Bloom & strobe
      ctx.fillStyle = '#ff1111';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(x + 4, y, w - 8, 3.5); // Rear taillight blade
      const strobe = Math.floor(Date.now() / 120) % 2 === 0;
      ctx.fillStyle = strobe ? '#ff2222' : '#f8fafc';
      ctx.fillRect(frontNoseX, frontNoseY, frontNoseW, 2.5);
    } else {
      // Normal Driving
      // Front LED light blade spanning the wedge nose
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(frontNoseX, frontNoseY, frontNoseW, 2.5);
      // Rear continuous red LED light blade spanning the flat Kamm-tail
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 5, y, w - 10, 2.5);
    }

    ctx.restore();
  }

  // Draw Player Cruise AV ("Poppy")
  function drawCruiseAV(x, y, w, h) {
    ctx.save();

    // Headlight beams
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(x + 5, y);
    ctx.lineTo(x - 12, y - 60);
    ctx.lineTo(x + 18, y - 60);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w - 5, y);
    ctx.lineTo(x + w - 18, y - 60);
    ctx.lineTo(x + w + 12, y - 60);
    ctx.closePath();
    ctx.fill();

    // Main Car Body (White Chevy Bolt / Cruise AV style)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 8, true, true);

    // Front windshield (dark glass)
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, x + 4, y + 15, w - 8, 14, 3, true, false);

    // Rear window
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 4, y + 46, w - 8, 11, 3, true, false);

    // Side windows
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 3, y + 31, 3, 13);
    ctx.fillRect(x + w - 6, y + 31, 3, 13);

    // Cruise Coral/Orange Roof Pod (LiDAR Sensor Housing)
    ctx.fillStyle = '#ff4d37'; // Cruise brand orange
    roundRect(ctx, x + 9, y + 26, w - 18, 18, 4, true, false);

    // Spinning LiDAR puck
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 35, 4, 0, Math.PI * 2);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 4, y + 1, 6, 3);
    ctx.fillRect(x + w - 10, y + 1, 6, 3);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 4, y + h - 3, 7, 3);
    ctx.fillRect(x + w - 11, y + h - 3, 7, 3);

    // Cruise AV Vehicle Name printed on rear deck: "POPPY"
    const cx = Math.round(x + w / 2);
    ctx.font = 'bold 8px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POPPY', cx, Math.round(y + 59));

    // Ego Vehicle Overhead / Rear Callout Badge (Razor-Sharp, Integer-Aligned)
    const egoBadgeW = 46;
    const egoBadgeH = 17;
    const egoBadgeX = cx - Math.round(egoBadgeW / 2);
    const egoBadgeY = Math.round(y + h + 6);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    roundRect(ctx, egoBadgeX, egoBadgeY + 1, egoBadgeW, egoBadgeH, 4, true, false);

    // Solid dark backing
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, egoBadgeX, egoBadgeY, egoBadgeW, egoBadgeH, 4, true, false);

    // Cruise Coral border
    ctx.strokeStyle = '#ff4d37';
    ctx.lineWidth = 1.4;
    roundRect(ctx, egoBadgeX, egoBadgeY, egoBadgeW, egoBadgeH, 4, false, true);

    // High contrast razor-sharp text
    ctx.font = 'bold 9.5px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POPPY', cx, egoBadgeY + Math.round(egoBadgeH / 2));

    // Drag / Touch Steering Active Indicator Halo
    if (isDragging) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Draw initial scene & initialize telemetry tags
  updateHud();
  draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCruiseSimulation);
  } else {
    initCruiseSimulation();
  }
})();