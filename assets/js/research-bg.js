/**
 * Minimalist Research Background Canvas
 * Inspired by OpenAI Research & Mathematics Aesthetics
 *
 * Core Research & Industry Themes Showcased (Pure Geometric Shapes, No Text):
 *  1. 2D Random Field on a Grid with 2 Peaks (RFT): 3D isometric surface mesh where grid curves into 2 Gaussian hill peaks
 *  2. Autonomous Vehicle Safety & Prediction (Cruise AV): Ego AV autonomously yielding to an aggressive car based on predicted trajectory
 *  3. Motorsport Circuit Apex & F1 Telemetry: Red/white rumble kerbs, optimal racing line, speed & brake/throttle telemetry
 *  4. Longitudinal Modeling & Biostatistics (CPRM): Diverging treatment trajectories & confidence envelope
 *  5. Experiment Design & Causal Inference: Randomization pipeline, causal DAG, potential outcomes & ATE
 *  6. Google Search & Information Retrieval: Search lens, semantic ranking vectors & Google 4-color nodes
 *  7. Smooth Floating Dots: Serene linear drift (no Brownian erratic motion, no connecting lines)
 */
(function() {
  'use strict';

  function init() {
    var canvas = document.getElementById('researchBgCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var animationId = null;
    var isVisible = true;
    var lastTimestamp = 0;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Interactive mouse tracker (gentle proximity deflection without lines)
    var mouse = {
      x: null,
      y: null,
      radius: 120
    };

    // Google signature color palette for background moving dots
    var googleDotColors = [
      'rgba(66, 133, 244, 0.65)', // Google Blue (#4285F4)
      'rgba(234, 67, 53, 0.65)',  // Google Red (#EA4335)
      'rgba(251, 188, 5, 0.70)',  // Google Yellow (#FBBC05)
      'rgba(52, 168, 83, 0.65)'   // Google Green (#34A853)
    ];

    // Elegant neutral slate/grey tones for background dots
    var greyDotColors = [
      'rgba(148, 163, 184, 0.60)', // Slate Grey
      'rgba(100, 116, 139, 0.55)', // Cool Grey
      'rgba(156, 163, 175, 0.60)'  // Neutral Grey
    ];

    // 1. Smooth Floating Dots (Google colors + Grey dots, serene linear drift, NO connecting lines)
    var dots = [];

    function initDots() {
      dots = [];
      var count = Math.max(42, Math.min(76, Math.floor((width * height) / 18000)));
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var spd = Math.random() * 0.28 + 0.14;
        var color;
        // Interleave Google colors and neutral grey dots
        if (i % 2 === 0) {
          color = googleDotColors[(i / 2) % googleDotColors.length];
        } else {
          color = greyDotColors[Math.floor(i / 2) % greyDotColors.length];
        }

        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: Math.random() * 1.5 + 1.6,
          color: color
        });
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (dots.length === 0) {
        initDots();
      } else {
        for (var i = 0; i < dots.length; i++) {
          dots[i].x = Math.min(dots[i].x, width);
          dots[i].y = Math.min(dots[i].y, height);
        }
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Mouse & Touch tracking with passive window listeners
    window.addEventListener('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    window.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function(e) {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function() {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    // Visibility optimization
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        isVisible = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else {
        isVisible = true;
        lastTimestamp = performance.now();
        if (!animationId && !prefersReducedMotion) {
          animationId = requestAnimationFrame(animate);
        }
      }
    });

    /* --------------------------------------------------------------------------
       HELPER: ROUNDED RECTANGLE
       -------------------------------------------------------------------------- */
    function drawRoundRect(c, x, y, w, h, r) {
      c.beginPath();
      if (c.roundRect) {
        c.roundRect(x, y, w, h, r);
      } else {
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.arcTo(x + w, y, x + w, y + r, r);
        c.lineTo(x + w, y + h - r);
        c.arcTo(x + w, y + h, x + w - r, y + h, r);
        c.lineTo(x + r, y + h);
        c.arcTo(x, y + h, x, y + h - r, r);
        c.lineTo(x, y + r);
        c.arcTo(x, y, x + r, y, r);
        c.closePath();
      }
    }

    /* --------------------------------------------------------------------------
       ORGANIC MOTIF PLACEMENTS & FROSTED GLASS INTERACTION
       Positions motifs organically (asymmetrical, non-grid) and tucks ~20-28% of each
       motif under the panel edges to showcase the blurry frosted glass effect!
       -------------------------------------------------------------------------- */
    function getMotifPlacements(time) {
      var sidebarEl = document.querySelector('.sidebar');
      var pageWrapEl = document.querySelector('.page__inner-wrap') || document.querySelector('.page');
      var mainEl = document.getElementById('main');

      var sidebarRect = sidebarEl ? sidebarEl.getBoundingClientRect() : null;
      var pageRect = pageWrapEl ? pageWrapEl.getBoundingClientRect() : null;
      var mainRect = mainEl ? mainEl.getBoundingClientRect() : null;

      var isDesktop = width >= 925 && sidebarRect && pageRect;

      var rft, av, f1, long, causal, search, invoker;

      if (isDesktop) {
        // 1. RFT (2D Random Field): Upper-left flank (outer-left)
        // Right edge of isometric grid (~52px radius) tucks ~24px under sidebar's left frosted border
        var rftScale = Math.min(1.0, Math.max(0.72, sidebarRect.left / 120));
        var rftRadius = 52 * rftScale;
        var rftX = Math.max(38, sidebarRect.left - rftRadius + 16 * rftScale);
        var rftY = Math.max(130, sidebarRect.top + 65 + Math.sin(time * 0.0008) * 12);

        // 2. Dota 2 Invoker (Three Elemental Orbs & Invoked Skills): Mid-left flank (distinct inner offset)
        // Positioned in the open left canvas between RFT and Causal/Longitudinal
        var invokerScale = Math.min(1.0, Math.max(0.72, sidebarRect.left / 120));
        var invokerX = Math.max(48, sidebarRect.left - 50 * invokerScale);
        var invokerY = Math.max(rftY + 200, sidebarRect.top + 290 + Math.sin(time * 0.00075 + 1.2) * 10);

        // 3. AV (High-Risk Yielding): Upper-right flank (INNER-MID track)
        var avScale = Math.min(1.0, Math.max(0.72, (width - pageRect.right) / 120));
        var avX = pageRect.right + 18 * avScale + Math.sin(time * 0.00063) * 14;
        var avY = Math.max(160, pageRect.top + 75 + Math.cos(time * 0.00051) * 12);

        // 4. Motorsport Circuit Apex & F1 Telemetry: Mid-right flank (FAR-OUTER track - pushed wide towards screen edge!)
        var f1Scale = Math.min(1.0, Math.max(0.72, (width - pageRect.right) / 120));
        // Push F1 outward towards the right viewport edge to create a wide spatial delta from AV and Search
        var f1X = Math.max(pageRect.right + 76 * f1Scale, width - 85 * f1Scale) + Math.cos(time * 0.00077 + 2.1) * 16;
        var f1Y = Math.max(avY + 245, Math.min(height * 0.50, height - 280)) + Math.sin(time * 0.00062 + 1.4) * 12;

        // 5. Longitudinal (Spaghetti Plot): Lower-mid flank (moved slightly to the right)
        // Positioned cleanly to the right of the causal inference motif, with right edge tucking under page
        var longScale = Math.min(1.0, Math.max(0.72, (pageRect.left) / 220));
        var longX = Math.max(92, pageRect.left - 48 * longScale);
        var targetY = sidebarRect ? sidebarRect.bottom + 75 * longScale : height * 0.78;
        var longY = Math.min(height - 80, Math.max(targetY, height * 0.78)) + Math.sin(time * 0.0009 + 2) * 6;

        // 6. Experiment Design & Causal Inference: Bottom-left flank
        // Positioned in the open lower-left canvas below sidebar, to the left of the longitudinal motif
        var causalScale = Math.min(1.0, Math.max(0.72, (pageRect.left) / 240));
        var causalX = Math.max(46, (pageRect.left - 50) * 0.35);
        var causalY = Math.min(height - 65, Math.max(sidebarRect ? sidebarRect.bottom + 105 * causalScale : height * 0.85, height * 0.85)) + Math.cos(time * 0.0007 + 3) * 6;

        // 7. Google Web Search: Lower-right quadrant (INWARD track - nestled under lower-right card boundary)
        // Tucked under the right card edge to create depth and completely shatter any collinear vertical column
        var searchScale = Math.min(1.0, Math.max(0.72, (width - pageRect.right) / 120));
        var searchX = pageRect.right - 55 * searchScale + Math.sin(time * 0.00055 + 4.3) * 18;
        var searchY = Math.max(f1Y + 230, Math.min(height * 0.84, height - 100)) + Math.cos(time * 0.00068 + 3.1) * 12;

        rft = { x: rftX, y: rftY, scale: rftScale };
        av = { x: avX, y: avY, scale: avScale };
        f1 = { x: f1X, y: f1Y, scale: f1Scale };
        long = { x: longX, y: longY, scale: longScale };
        causal = { x: causalX, y: causalY, scale: causalScale };
        search = { x: searchX, y: searchY, scale: searchScale };
        invoker = { x: invokerX, y: invokerY, scale: invokerScale };
      } else {
        // Mobile / tablet: organic non-symmetric spread breaking any column alignment
        rft = { x: Math.max(45, width * 0.14), y: Math.max(130, height * 0.14), scale: 0.65 };
        av = { x: Math.min(width - 45, width * 0.88), y: Math.max(220, height * 0.26), scale: 0.65 };
        invoker = { x: Math.max(48, width * 0.20), y: Math.max(340, height * 0.38), scale: 0.65 };
        f1 = { x: Math.min(width - 40, width * 0.82), y: Math.max(470, height * 0.50), scale: 0.65 };
        causal = { x: Math.max(48, width * 0.16), y: Math.max(590, height * 0.63), scale: 0.64 };
        search = { x: Math.min(width - 50, width * 0.55), y: Math.max(710, height * 0.76), scale: 0.65 };
        long = { x: Math.max(52, width * 0.26), y: Math.max(830, height * 0.89), scale: 0.64 };
      }

      return { rft: rft, av: av, f1: f1, long: long, causal: causal, search: search, invoker: invoker };
    }

    /* --------------------------------------------------------------------------
       DRAWING MODULES (PURE GEOMETRIC SHAPES, NO TEXT)
       -------------------------------------------------------------------------- */

    // 1. Background Coordinate Cross Matrix (OpenAI Mathematics Style)
    function drawCoordinateGrid() {
      var step = 64;
      var startX = step / 2;
      var startY = step / 2;

      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();

      for (var x = startX; x < width; x += step) {
        for (var y = startY; y < height; y += step) {
          ctx.moveTo(x - 3, y);
          ctx.lineTo(x + 3, y);
          ctx.moveTo(x, y - 3);
          ctx.lineTo(x, y + 3);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. 2D Random Field on a Grid with 2 Peaks (Upper-Left Flank)
    // 3D Isometric mesh surface where grid curves into 2 Gaussian hill peaks that move with the peak dots
    function drawRFT2DGridMotif(time, pos) {
      ctx.save();

      var cx = pos ? pos.x : Math.max(90, width * 0.1);
      var cy = pos ? pos.y : Math.max(160, Math.min(height * 0.28, 250));
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.75 : 0.95);

      // Peak 1 position on grid coordinates [-5, 5]
      var u1 = -1.8 + 1.1 * Math.cos(time * 0.0011);
      var v1 = -1.2 + 0.9 * Math.sin(time * 0.0014);
      var amp1 = 42 * scale;
      var sigma1 = 1.8;

      // Peak 2 position on grid coordinates [-5, 5]
      var u2 = 2.0 + 1.0 * Math.sin(time * 0.0015);
      var v2 = 1.4 + 0.8 * Math.cos(time * 0.0012);
      var amp2 = 35 * scale;
      var sigma2 = 1.7;

      // 2D Random Field surface height function Z(u, v)
      function getZ(u, v) {
        var d1Sq = (u - u1) * (u - u1) + (v - v1) * (v - v1);
        var z1 = amp1 * Math.exp(-d1Sq / (2 * sigma1 * sigma1));

        var d2Sq = (u - u2) * (u - u2) + (v - v2) * (v - v2);
        var z2 = amp2 * Math.exp(-d2Sq / (2 * sigma2 * sigma2));

        var ripple = 2.0 * scale * Math.sin(u * 0.6 + time * 0.001) * Math.cos(v * 0.6);
        return z1 + z2 + ripple;
      }

      // Isometric projection transform
      var cellW = 9.6 * scale;
      var cellH = 5.8 * scale;
      function project(u, v, z) {
        return {
          x: cx + (u - v) * cellW,
          y: cy + (u + v) * cellH - z
        };
      }

      var gridSize = 5; // Compact 11x11 grid that fits comfortably within open flank
      var step = 1;

      // Draw Grid Lines along U (Rows curving into Gaussian hills)
      ctx.lineWidth = 1.1 * scale;
      for (var u = -gridSize; u <= gridSize; u += step) {
        ctx.beginPath();
        var rowNearPeak = Math.abs(u - u1) < 1.4;
        ctx.strokeStyle = rowNearPeak ? 'rgba(79, 70, 229, 0.82)' : 'rgba(100, 116, 139, 0.44)';
        ctx.lineWidth = rowNearPeak ? (1.3 * scale) : (1.0 * scale);
        for (var v = -gridSize; v <= gridSize; v += 0.25) {
          var z = getZ(u, v);
          var pt = project(u, v, z);
          if (v === -gridSize) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Draw Grid Lines along V (Columns curving into Gaussian hills)
      for (var v = -gridSize; v <= gridSize; v += step) {
        ctx.beginPath();
        var colNearPeak = Math.abs(v - v2) < 1.4;
        ctx.strokeStyle = colNearPeak ? 'rgba(14, 165, 233, 0.82)' : 'rgba(100, 116, 139, 0.40)';
        ctx.lineWidth = colNearPeak ? (1.3 * scale) : (1.0 * scale);
        for (var u = -gridSize; u <= gridSize; u += 0.25) {
          var z = getZ(u, v);
          var pt = project(u, v, z);
          if (u === -gridSize) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Base Grid Boundary Box (Flat Ground Reference)
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 0.9 * scale;
      ctx.beginPath();
      var b1 = project(-gridSize, -gridSize, 0);
      var b2 = project(gridSize, -gridSize, 0);
      var b3 = project(gridSize, gridSize, 0);
      var b4 = project(-gridSize, gridSize, 0);
      ctx.moveTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b3.x, b3.y);
      ctx.lineTo(b4.x, b4.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Horizontal dashed threshold plane level set (u_thresh) cutting through the 2 peaks
      var threshZ = 22 * scale;
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.68)'; // Threshold Red
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      var t1 = project(-gridSize * 0.85, -gridSize * 0.85, threshZ);
      var t2 = project(gridSize * 0.85, -gridSize * 0.85, threshZ);
      var t3 = project(gridSize * 0.85, gridSize * 0.85, threshZ);
      var t4 = project(-gridSize * 0.85, gridSize * 0.85, threshZ);
      ctx.moveTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.lineTo(t3.x, t3.y);
      ctx.lineTo(t4.x, t4.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Peak 1 Dot (Local Maximum 1 Summit) with Dynamic Pulse
      var zPeak1 = getZ(u1, v1);
      var ptPeak1 = project(u1, v1, zPeak1);
      var pulse1 = (Math.sin(time * 0.003) + 1) * 0.5;

      ctx.fillStyle = 'rgba(79, 70, 229, 0.95)';
      ctx.beginPath();
      ctx.arc(ptPeak1.x, ptPeak1.y, 4.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(79, 70, 229, ' + (0.55 - pulse1 * 0.35) + ')';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(ptPeak1.x, ptPeak1.y, (7.0 + pulse1 * 4.5) * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Peak 2 Dot (Local Maximum 2 Summit) with Dynamic Pulse
      var zPeak2 = getZ(u2, v2);
      var ptPeak2 = project(u2, v2, zPeak2);
      var pulse2 = (Math.cos(time * 0.0028) + 1) * 0.5;

      ctx.fillStyle = 'rgba(14, 165, 233, 0.95)';
      ctx.beginPath();
      ctx.arc(ptPeak2.x, ptPeak2.y, 3.8 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(14, 165, 233, ' + (0.55 - pulse2 * 0.35) + ')';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(ptPeak2.x, ptPeak2.y, (6.5 + pulse2 * 4.0) * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Autonomous Vehicle Safety & Robotics (Upper-Right Flank)
    // Scenario: Ego AV Autonomously Yielding to an Aggressive Cut-in Car Based on Predicted Trajectory
    // Fast initial closing speed highlights hazard, reaction time, and emergency yielding (NO trailing box)
    function drawAVYieldingMotif(time, pos) {
      ctx.save();

      var px = pos ? pos.x : Math.min(width - 95, width * 0.88);
      var py = pos ? pos.y : Math.max(180, height * 0.32);
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.78 : 0.95);

      // Two Highway Lanes (Dashed boundary & lane center)
      var laneW = 38 * scale;
      var roadH = 180 * scale;
      var roadTop = py - roadH / 2;
      var roadBot = py + roadH / 2;

      var laneRightX = px + laneW / 2;  // Host Lane (Ego AV)
      var laneLeftX = px - laneW / 2;   // Adjacent Lane (Aggressive Car)

      // Road outer boundaries
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(px - laneW * 1.5, roadTop);
      ctx.lineTo(px - laneW * 1.5, roadBot);
      ctx.moveTo(px + laneW * 1.5, roadTop);
      ctx.lineTo(px + laneW * 1.5, roadBot);
      ctx.stroke();

      // Dashed lane divider
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.40)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(px, roadTop);
      ctx.lineTo(px, roadBot);
      ctx.stroke();
      ctx.restore();

      // Time progression loop for the scenario (0 to 1 loop over 5.0 seconds)
      var loopDuration = 5000;
      var t = (time % loopDuration) / loopDuration;

      // 1. Aggressive Car cutting in from adjacent left lane into host lane
      var cutInStartX = laneLeftX;
      var cutInStartY = py - 32 * scale;
      var cutInMidX = px + 2 * scale;
      var cutInMidY = py + 14 * scale;
      var cutInEndX = laneRightX;
      var cutInEndY = py + 54 * scale;

      // Predicted Trajectory Spline of Aggressive Car (Dashed Warning Orange/Red)
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.80)'; // Prediction Alert Red
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(cutInStartX, cutInStartY - 24 * scale);
      ctx.lineTo(cutInStartX, cutInStartY);
      ctx.bezierCurveTo(cutInStartX, cutInStartY + 16 * scale, cutInEndX, cutInMidY, cutInEndX, cutInEndY + 22 * scale);
      ctx.stroke();
      ctx.restore();

      // Predicted Conflict / Cut-in Entry Zone (Diamond marker)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)'; // Warning Amber
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(cutInMidX, cutInMidY - 4 * scale);
      ctx.lineTo(cutInMidX + 4 * scale, cutInMidY);
      ctx.lineTo(cutInMidX, cutInMidY + 4 * scale);
      ctx.lineTo(cutInMidX - 4 * scale, cutInMidY);
      ctx.closePath();
      ctx.stroke();

      // Current position of Aggressive Car (gliding along cut-in curve)
      var aggProg = Math.min(1.0, t * 1.15);
      var aggCarPt = getBezierPoint(aggProg, cutInStartX, cutInStartY - 22 * scale, cutInStartX + 6 * scale, cutInMidY - 8 * scale, cutInEndX, cutInMidY + 12 * scale, cutInEndX, cutInEndY + 24 * scale);

      // Aggressive Car Box
      ctx.fillStyle = 'rgba(239, 68, 68, 0.24)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.88)';
      ctx.lineWidth = 1.3 * scale;
      var carW = 12 * scale;
      var carH = 18 * scale;
      ctx.strokeRect(aggCarPt.x - carW / 2, aggCarPt.y - carH / 2, carW, carH);
      ctx.fillRect(aggCarPt.x - carW / 2, aggCarPt.y - carH / 2, carW, carH);

      // 2. Ego Autonomous Vehicle (Cruise AV in host lane)
      var avStartY = py - 75 * scale;
      var avEndY = py + 70 * scale;

      // Planned safe path (Solid Cyan)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.75)'; // AV Cyan
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(laneRightX, avStartY);
      ctx.lineTo(laneRightX, avEndY);
      ctx.stroke();

      // Waypoints along AV planned path
      var avWaypoints = [0.10, 0.22, 0.35, 0.44, 0.50, 0.60, 0.74, 0.88];
      ctx.fillStyle = 'rgba(14, 165, 233, 0.70)';
      for (var w = 0; w < avWaypoints.length; w++) {
        var wy = avStartY + (avEndY - avStartY) * avWaypoints[w];
        ctx.beginPath();
        ctx.arc(laneRightX, wy, 2.0 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // HIGH-RISK AV DYNAMICS & REACTION TIME:
      // AV is fast at the beginning (high cruising speed), rapidly closing headway!
      // At t ≈ 0.32-0.36, aggressive car cuts in close ahead (safety critical!).
      // AV perception immediately detects the hazard, flashes alert, and commands braking.
      var avProg;
      var isReactionPhase = (t >= 0.31 && t <= 0.45);
      if (t < 0.33) {
        // Fast initial closing speed! High risk!
        avProg = t * 1.38;
      } else if (t < 0.68) {
        // Instant reaction & rapid deceleration (yielding)
        avProg = 0.33 * 1.38 + (t - 0.33) * 0.32;
      } else {
        // Smoothly resume cruising once gap is restored
        avProg = (0.33 * 1.38 + 0.35 * 0.32) + (t - 0.68) * 0.95;
      }
      var avCarY = avStartY + (avEndY - avStartY) * avProg;

      // Forward Perception Tracking Beam: cyan normally, alert coral-red during reaction time window!
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = isReactionPhase ? 'rgba(239, 68, 68, 0.92)' : 'rgba(14, 165, 233, 0.55)';
      ctx.lineWidth = isReactionPhase ? 1.8 * scale : 1.1 * scale;
      ctx.beginPath();
      ctx.moveTo(laneRightX, avCarY - 6 * scale);
      ctx.lineTo(aggCarPt.x, aggCarPt.y + 6 * scale);
      ctx.stroke();
      ctx.restore();

      // If in reaction phase, show perception lock ping ring at sensor puck!
      if (isReactionPhase) {
        var rPulse = ((t - 0.31) / 0.14);
        ctx.strokeStyle = 'rgba(239, 68, 68, ' + (0.8 - rPulse * 0.7) + ')';
        ctx.lineWidth = 1.3 * scale;
        ctx.beginPath();
        ctx.arc(laneRightX, avCarY, (4.5 + rPulse * 8) * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ego AV Body Box (White with Cruise Coral LiDAR Roof Puck)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = isReactionPhase ? 'rgba(239, 68, 68, 0.95)' : 'rgba(79, 70, 229, 0.92)';
      ctx.lineWidth = 1.4 * scale;
      ctx.strokeRect(laneRightX - carW / 2, avCarY - carH / 2, carW, carH);
      ctx.fillRect(laneRightX - carW / 2, avCarY - carH / 2, carW, carH);

      // Cruise AV Coral Sensor Puck on roof
      ctx.fillStyle = '#ff4d37';
      ctx.beginPath();
      ctx.arc(laneRightX, avCarY, 3.0 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 4. Motorsport Circuit Grand Prix Racing Line & F1 Telemetry Motif (Mid-Right Flank)
    // Canonical Driver61 Corner Geometry & Apex Clipping Physics (Outside -> Inside Apex -> Outside Track-Out):
    // - Track Geometry: Approaching vertically from bottom -> 90° right-hand corner -> Exiting horizontally to right
    // - Reference Diagram Markers:
    //   1. Braking Point: Crimson transverse line across entry straight with "braking point" marker
    //   2. Turn-In Point: Orange transverse line where smooth arc begins with "turn-in point" marker
    //   3. Apex (Clipping Point) PROMINENTLY HIGHLIGHTED: Inside clipping apex with concentric gold/orange target rings,
    //      precision crosshairs, dynamic pulsing halo, alternating red/white kerb, and "apex" badge
    //   4. Exit Point: Green transverse line where arc tracks out flush to outside boundary with "exit point" marker
    // - Continuous Racing Line: Vibrant racing green (#16a34a) wide-radius arc (C1-continuous tangent transitions)
    // - Scuderia Ferrari Single-Seater: Zero drift, zero slip angle (collinear velocity vector), telemetry speed profile
    // - Synchronized Telemetry Box: v(s) speed profile, brake pressure, throttle application, live synchronized cursor
    function drawMotorsportTelemetryMotif(time, pos) {
      ctx.save();

      var cx = pos ? pos.x : Math.min(width - 95, width * 0.86);
      var cy = pos ? pos.y : Math.max(height * 0.48, 380);
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.76 : 0.94);

      // Track Corner Proportions & Boundaries
      var R = 38 * scale;
      var trackW = 22 * scale;
      var wHalf = trackW * 0.5; // 11 * scale
      var Rin = R - wHalf;      // 27 * scale (Inside boundary radius)
      var Rout = R + wHalf;     // 49 * scale (Outside boundary radius)

      var entryLen = 76 * scale; // Extended runway for high-speed approach
      var exitLen = 52 * scale;

      // Center of curvature O for the 90° right-hand arc
      var ox = Math.min(width - exitLen - 18 * scale, cx + 8 * scale);
      var oy = Math.max(Rout + 18 * scale, cy - 22 * scale);

      // A. Track Surface & Solid Boundaries (Approaching from bottom, turning right, exiting right)
      // 1. Tarmac Asphalt Surface Fill
      ctx.beginPath();
      // Inside boundary: bottom entry straight -> 90° corner arc -> exit straight
      ctx.moveTo(ox - Rin, oy + entryLen);
      ctx.lineTo(ox - Rin, oy);
      ctx.arc(ox, oy, Rin, Math.PI, Math.PI * 1.5, false);
      ctx.lineTo(ox + exitLen, oy - Rin);
      // Across track at exit
      ctx.lineTo(ox + exitLen, oy - Rout);
      // Outside boundary: exit straight -> 90° corner arc -> bottom entry straight
      ctx.lineTo(ox, oy - Rout);
      ctx.arc(ox, oy, Rout, Math.PI * 1.5, Math.PI, true);
      ctx.lineTo(ox - Rout, oy + entryLen);
      ctx.closePath();
      ctx.fillStyle = 'rgba(241, 245, 249, 0.48)';
      ctx.fill();

      // 2. Track Boundary Lines (Slate grey)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.50)';
      ctx.lineWidth = 1.1 * scale;

      // Inside boundary
      ctx.beginPath();
      ctx.moveTo(ox - Rin, oy + entryLen);
      ctx.lineTo(ox - Rin, oy);
      ctx.arc(ox, oy, Rin, Math.PI, Math.PI * 1.5, false);
      ctx.lineTo(ox + exitLen, oy - Rin);
      ctx.stroke();

      // Outside boundary
      ctx.beginPath();
      ctx.moveTo(ox - Rout, oy + entryLen);
      ctx.lineTo(ox - Rout, oy);
      ctx.arc(ox, oy, Rout, Math.PI * 1.5, Math.PI, true);
      ctx.lineTo(ox + exitLen, oy - Rout);
      ctx.stroke();

      // 3. Track Centerline (Faint dashed reference)
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(ox - R, oy + entryLen);
      ctx.lineTo(ox - R, oy);
      ctx.arc(ox, oy, R, Math.PI, Math.PI * 1.5, false);
      ctx.lineTo(ox + exitLen, oy - R);
      ctx.stroke();
      ctx.restore();

      // B. Rumble Kerbs (Alternating Scuderia Red & White)
      var kerbW = 4.0 * scale;

      // 1. Inside Apex Kerb (Around inside arc from 205° to 245°, framing apex at 225°)
      var apexKerbCount = 8;
      var aThetaStart = Math.PI + 0.14 * Math.PI; // ~205°
      var aThetaEnd = Math.PI + 0.36 * Math.PI;   // ~245°
      var aThetaStep = (aThetaEnd - aThetaStart) / apexKerbCount;

      for (var ki = 0; ki < apexKerbCount; ki++) {
        var tA1 = aThetaStart + ki * aThetaStep;
        var tA2 = tA1 + aThetaStep;
        var cos1 = Math.cos(tA1);
        var sin1 = Math.sin(tA1);
        var cos2 = Math.cos(tA2);
        var sin2 = Math.sin(tA2);

        var inX1 = ox + Rin * cos1;
        var inY1 = oy + Rin * sin1;
        var inX2 = ox + Rin * cos2;
        var inY2 = oy + Rin * sin2;

        var extX1 = ox + (Rin - kerbW) * cos1;
        var extY1 = oy + (Rin - kerbW) * sin1;
        var extX2 = ox + (Rin - kerbW) * cos2;
        var extY2 = oy + (Rin - kerbW) * sin2;

        var isRed = (ki % 2 === 0);
        ctx.fillStyle = isRed ? 'rgba(234, 67, 53, 0.90)' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(inX1, inY1);
        ctx.lineTo(extX1, extY1);
        ctx.lineTo(extX2, extY2);
        ctx.lineTo(inX2, inY2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isRed ? 'rgba(234, 67, 53, 0.95)' : 'rgba(203, 213, 225, 0.85)';
        ctx.lineWidth = 0.7 * scale;
        ctx.stroke();
      }

      // 2. Outside Exit Kerb (Where car tracks out onto outer curb on exit)
      var exitKerbCount = 6;
      var exitKerbXStart = ox + 8 * scale;
      var exitKerbStep = 4.2 * scale;
      for (var ei = 0; ei < exitKerbCount; ei++) {
        var ekX1 = exitKerbXStart + ei * exitKerbStep;
        var ekX2 = ekX1 + exitKerbStep;
        var ekYTrack = oy - Rout;
        var ekYExt = ekYTrack - kerbW;

        var eIsRed = (ei % 2 === 0);
        ctx.fillStyle = eIsRed ? 'rgba(234, 67, 53, 0.88)' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(ekX1, ekYTrack);
        ctx.lineTo(ekX1, ekYExt);
        ctx.lineTo(ekX2, ekYExt);
        ctx.lineTo(ekX2, ekYTrack);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = eIsRed ? 'rgba(234, 67, 53, 0.92)' : 'rgba(203, 213, 225, 0.85)';
        ctx.lineWidth = 0.7 * scale;
        ctx.stroke();
      }

      // C. Canonical Outside -> Inside Apex -> Outside Racing Line Formulation
      var deltaEdge = 3.2 * scale; // Margin from outside curb
      var deltaApex = 2.4 * scale; // Margin from inside apex curb

      var X_out_race = ox - Rout + deltaEdge;
      var Y_out_race = oy - Rout + deltaEdge;

      // Inside apex clipping coordinates (theta = 225° / 5pi/4)
      var rRaceApex = Rin + deltaApex;
      var dApex = rRaceApex * Math.SQRT1_2;
      var apexRaceX = ox - dApex;
      var apexRaceY = oy - dApex;

      // Large circular arc radius RL and center (Cx, Cy)
      var K = (ox - X_out_race) - dApex;
      var RL = (2.0 + Math.SQRT2) * K;
      var Cx = X_out_race + RL;
      var Cy = Y_out_race + RL;

      // Transition points
      var yEntryStart = oy + entryLen;
      var yTurnIn = Cy;                  // Turn-in point (tangent to entry straight)
      var yBrake = yTurnIn + 18 * scale; // Braking point (placed nicely along runway)
      var xExit = Cx;                    // Exit point (tangent to exit straight)
      var xExitEnd = ox + exitLen;

      // Piecewise segment lengths and normalized coordinate s in [0, 1]
      var L1 = yEntryStart - yTurnIn; // Vertical entry straight
      var L2 = RL * (Math.PI * 0.5);  // Smooth large-radius cornering arc
      var L3 = xExitEnd - xExit;      // Horizontal exit straight
      var Ltotal = L1 + L2 + L3;

      var sBrake = Math.max(0.04, (yEntryStart - yBrake) / Ltotal);
      var s1 = L1 / Ltotal;           // Normalized turn-in point
      var sApex = (L1 + RL * (Math.PI * 0.25)) / Ltotal; // Normalized apex point
      var s2 = (L1 + L2) / Ltotal;     // Normalized exit point

      // Continuous Analytical Racing Line Position & Velocity Heading Function
      function getRacingPt(s) {
        if (s <= s1) {
          var u = s / s1;
          return {
            x: X_out_race,
            y: yEntryStart - u * L1,
            heading: -Math.PI * 0.5 // Upwards (-y)
          };
        } else if (s <= s2) {
          var u2 = (s - s1) / (s2 - s1);
          var phi = Math.PI + u2 * (Math.PI * 0.5);
          return {
            x: Cx + RL * Math.cos(phi),
            y: Cy + RL * Math.sin(phi),
            heading: phi + Math.PI * 0.5 // Pure circular tangent
          };
        } else {
          var u3 = (s - s2) / (1.0 - s2);
          return {
            x: Cx + u3 * L3,
            y: Y_out_race,
            heading: 0 // Rightwards (+x)
          };
        }
      }

      // D. Sub-Optimal Comparison Line (Faint dashed slate)
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.38)';
      ctx.lineWidth = 0.9 * scale;
      ctx.beginPath();
      for (var d = 0; d <= 26; d++) {
        var sDef = d / 26;
        var defPt;
        if (sDef <= s1) {
          var du1 = sDef / s1;
          defPt = { x: ox - R, y: yEntryStart - du1 * L1 }; // Middle of entry straight
        } else if (sDef <= s2) {
          var du2 = (sDef - s1) / (s2 - s1);
          var dTheta = Math.PI + du2 * (Math.PI * 0.5);
          var dR = Rin + 1.8 * scale; // Early inside dive (pinched radius)
          defPt = { x: ox + dR * Math.cos(dTheta), y: oy + dR * Math.sin(dTheta) };
        } else {
          var du3 = (sDef - s2) / (1.0 - s2);
          defPt = { x: ox + du3 * exitLen, y: oy - R }; // Washes out towards center
        }
        if (d === 0) ctx.moveTo(defPt.x, defPt.y);
        else ctx.lineTo(defPt.x, defPt.y);
      }
      ctx.stroke();
      ctx.restore();

      // E. Continuous Racing Line (Driver61 Vibrant Racing Green)
      // 1. Soft vibrant green glow / aura
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.24)';
      ctx.lineWidth = 4.8 * scale;
      ctx.beginPath();
      var rSteps = 48;
      for (var rs = 0; rs <= rSteps; rs++) {
        var sVal = rs / rSteps;
        var rPt = getRacingPt(sVal);
        if (rs === 0) ctx.moveTo(rPt.x, rPt.y);
        else ctx.lineTo(rPt.x, rPt.y);
      }
      ctx.stroke();

      // 2. Main crisp racing line
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2.4 * scale;
      ctx.beginPath();
      for (var rs2 = 0; rs2 <= rSteps; rs2++) {
        var sVal2 = rs2 / rSteps;
        var rPt2 = getRacingPt(sVal2);
        if (rs2 === 0) ctx.moveTo(rPt2.x, rPt2.y);
        else ctx.lineTo(rPt2.x, rPt2.y);
      }
      ctx.stroke();

      // F. The 4 Reference Diagram Geometric Markers (Braking, Turn-In, Apex, Exit)
      // 1. Braking Point Marker (Crimson Red transverse line)
      var brkY = yBrake;
      var brkX1 = ox - Rout - 2.5 * scale;
      var brkX2 = ox - Rin + 2.5 * scale;
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.92)';
      ctx.lineWidth = 2.0 * scale;
      ctx.beginPath();
      ctx.moveTo(brkX1, brkY);
      ctx.lineTo(brkX2, brkY);
      ctx.stroke();

      // 2. Turn-In Point Marker (Warm Orange transverse line)
      var turnY = yTurnIn;
      var turnX1 = ox - Rout - 2.5 * scale;
      var turnX2 = ox - Rin + 2.5 * scale;
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.92)';
      ctx.lineWidth = 2.0 * scale;
      ctx.beginPath();
      ctx.moveTo(turnX1, turnY);
      ctx.lineTo(turnX2, turnY);
      ctx.stroke();

      // 3. Apex (Clipping Point) - PROMINENTLY HIGHLIGHTED
      var apexInX = ox - Rin * Math.SQRT1_2;
      var apexInY = oy - Rin * Math.SQRT1_2;

      // a. Reference diagram orange radial tick mark cutting through inside curb
      var tickLenIn = 3.5 * scale;
      var tickLenOut = 6.5 * scale;
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.95)';
      ctx.lineWidth = 2.2 * scale;
      ctx.beginPath();
      ctx.moveTo(apexInX - tickLenIn * Math.SQRT1_2, apexInY - tickLenIn * Math.SQRT1_2);
      ctx.lineTo(apexInX + tickLenOut * Math.SQRT1_2, apexInY + tickLenOut * Math.SQRT1_2);
      ctx.stroke();

      // b. Concentric target & precision crosshairs at apex clipping point
      ctx.fillStyle = '#FBBC05'; // Golden amber center
      ctx.beginPath();
      ctx.arc(apexRaceX, apexRaceY, 3.4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // White focal core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(apexRaceX, apexRaceY, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Target ring
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.95)';
      ctx.lineWidth = 1.3 * scale;
      ctx.beginPath();
      ctx.arc(apexRaceX, apexRaceY, 5.6 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Precision crosshairs along apex normal & tangent
      var chLen = 8.0 * scale;
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.80)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(apexRaceX - chLen * Math.SQRT1_2, apexRaceY + chLen * Math.SQRT1_2);
      ctx.lineTo(apexRaceX + chLen * Math.SQRT1_2, apexRaceY - chLen * Math.SQRT1_2);
      ctx.moveTo(apexRaceX - chLen * Math.SQRT1_2, apexRaceY - chLen * Math.SQRT1_2);
      ctx.lineTo(apexRaceX + chLen * Math.SQRT1_2, apexRaceY + chLen * Math.SQRT1_2);
      ctx.stroke();

      // c. Dynamic radiant pulse halo beacon
      var apexPulse = (Math.sin(time * 0.0038) + 1) * 0.5;
      var haloR = (6.5 + apexPulse * 8.0) * scale;
      var haloAlpha = 0.80 - apexPulse * 0.65;
      ctx.strokeStyle = 'rgba(245, 158, 11, ' + haloAlpha + ')';
      ctx.lineWidth = 1.3 * scale;
      ctx.beginPath();
      ctx.arc(apexRaceX, apexRaceY, haloR, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Exit Point Marker (Green transverse line)
      var exitX = xExit;
      var exitY1 = oy - Rout - 2.5 * scale;
      var exitY2 = oy - Rin + 2.5 * scale;
      ctx.strokeStyle = 'rgba(22, 163, 74, 0.92)';
      ctx.lineWidth = 2.0 * scale;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY1);
      ctx.lineTo(exitX, exitY2);
      ctx.stroke();

      // G. F1 Telemetry Data Trace Box (Below track corner)
      var telX = ox - Rout - 2 * scale;
      var telY = oy + entryLen + 14 * scale;
      var telW = (ox + exitLen) - telX;
      var telH = 26 * scale;

      // Coordinate axes
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      // Distance axis
      ctx.moveTo(telX, telY + telH);
      ctx.lineTo(telX + telW, telY + telH);
      // Speed axis
      ctx.moveTo(telX, telY);
      ctx.lineTo(telX, telY + telH);
      ctx.stroke();

      // Vertical phase markers aligned with reference diagram points
      var telMarkers = [
        { s: sBrake, color: 'rgba(220, 38, 38, 0.65)' },
        { s: s1,     color: 'rgba(234, 88, 12, 0.65)' },
        { s: sApex,  color: 'rgba(245, 158, 11, 0.75)' },
        { s: s2,     color: 'rgba(22, 163, 74, 0.65)' }
      ];
      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 0.9 * scale;
      for (var tm = 0; tm < telMarkers.length; tm++) {
        var mX = telX + telW * telMarkers[tm].s;
        ctx.strokeStyle = telMarkers[tm].color;
        ctx.beginPath();
        ctx.moveTo(mX, telY - 1 * scale);
        ctx.lineTo(mX, telY + telH + 2 * scale);
        ctx.stroke();
      }
      ctx.restore();

      // Speed profile function V(s) normalized in [0, 1]
      // Corner minimum speed is ~60% of straight-line top speed (realistic racing physics, preserves momentum)
      function getSpeedNorm(s) {
        if (s <= sBrake) {
          return 0.95; // Full high-speed approach down the straight
        } else if (s <= sApex) {
          var prog = (s - sBrake) / (sApex - sBrake);
          // Smooth threshold deceleration into apex Vmin (~0.60)
          return 0.60 + 0.35 * Math.cos(prog * Math.PI * 0.5);
        } else {
          var prog2 = (s - sApex) / (1.0 - sApex);
          // Smooth progressive throttle acceleration out of apex back up to full speed (~0.95)
          return 0.60 + 0.35 * Math.sin(prog2 * Math.PI * 0.5);
        }
      }

      // Brake Pressure Telemetry (Red fill: braking into apex)
      ctx.fillStyle = 'rgba(234, 67, 53, 0.16)';
      ctx.beginPath();
      var brkTelStart = telX + telW * sBrake;
      var apexTelX = telX + telW * sApex;
      ctx.moveTo(brkTelStart, telY + telH);
      for (var bu = sBrake; bu <= sApex; bu += 0.02) {
        var bx = telX + telW * bu;
        var bPressure;
        if (bu < s1) bPressure = 0.95; // Threshold braking
        else bPressure = 0.95 * (1 - (bu - s1) / (sApex - s1)); // Trail braking
        var by = telY + telH - bPressure * (12 * scale);
        ctx.lineTo(bx, by);
      }
      ctx.lineTo(apexTelX, telY + telH);
      ctx.closePath();
      ctx.fill();

      // Brake outline
      ctx.strokeStyle = 'rgba(234, 67, 53, 0.85)';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(brkTelStart, telY + telH);
      for (var bu2 = sBrake; bu2 <= sApex; bu2 += 0.02) {
        var bx2 = telX + telW * bu2;
        var bPressure2;
        if (bu2 < s1) bPressure2 = 0.95;
        else bPressure2 = 0.95 * (1 - (bu2 - s1) / (sApex - s1));
        var by2 = telY + telH - bPressure2 * (12 * scale);
        ctx.lineTo(bx2, by2);
      }
      ctx.lineTo(apexTelX, telY + telH);
      ctx.stroke();

      // Throttle Application Telemetry (Green fill: progressive throttle roll-on from apex)
      ctx.fillStyle = 'rgba(52, 168, 83, 0.16)';
      ctx.beginPath();
      ctx.moveTo(apexTelX, telY + telH);
      for (var tu = sApex; tu <= 1.0; tu += 0.02) {
        var tx = telX + telW * tu;
        var tApplication = Math.min(1.0, (tu - sApex) / (s2 - sApex));
        var ty = telY + telH - tApplication * (12 * scale);
        ctx.lineTo(tx, ty);
      }
      ctx.lineTo(telX + telW, telY + telH);
      ctx.closePath();
      ctx.fill();

      // Throttle outline
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.85)';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(apexTelX, telY + telH);
      for (var tu2 = sApex; tu2 <= 1.0; tu2 += 0.02) {
        var tx2 = telX + telW * tu2;
        var tApplication2 = Math.min(1.0, (tu2 - sApex) / (s2 - sApex));
        var ty2 = telY + telH - tApplication2 * (12 * scale);
        ctx.lineTo(tx2, ty2);
      }
      ctx.stroke();

      // Continuous Telemetry Speed Curve v(s) (Google Blue)
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.95)';
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      for (var su = 0; su <= 1.0; su += 0.02) {
        var sx = telX + telW * su;
        var sy = telY + telH - getSpeedNorm(su) * (telH - 4 * scale);
        if (su === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // H. Dynamic Racing Car Simulation (Continuous C^2 Harmonic Motion, No Dead Stops, Smooth Lap Crossfade)
      var lapLoop = 3800;
      var uRaw = (time % lapLoop) / lapLoop;

      // Analytical closed-form C^2 harmonic velocity profile:
      // - Full high-speed momentum on approach straight (s'(0) = 1.23)
      // - Decelerates smoothly into apex Vmin (~62% of top speed, never crawls)
      // - Accelerates progressively out of apex back to top speed (s'(1) = 1.23)
      // - Velocity and acceleration match at boundaries (s'(0) == s'(1), s''(0) == s''(1))
      var uApex = 0.50;
      var sCar = uRaw - 0.038 * (Math.sin(Math.PI * 2 * (uRaw - uApex)) + Math.sin(Math.PI * 2 * uApex));
      sCar = Math.min(1.0, Math.max(0.0, sCar));

      var carInfo = getRacingPt(sCar);

      // Smooth crossfade between laps: car moves at full speed off exit and on entry
      var carAlpha = 1.0;
      if (sCar < 0.08) {
        carAlpha = sCar / 0.08;
      } else if (sCar > 0.92) {
        carAlpha = (1.0 - sCar) / 0.08;
      }

      // Draw car body aligned with exact analytical trajectory velocity vector
      ctx.save();
      ctx.globalAlpha = carAlpha;
      ctx.translate(carInfo.x, carInfo.y);
      ctx.rotate(carInfo.heading);

      var isBraking = (sCar >= sBrake && sCar <= sApex);
      var isOnThrottle = (sCar > sApex && sCar <= 0.95);

      // Crisp Formula 1 Single-Seater Silhouette
      var fuseL = 13.5 * scale;
      var fuseW = 4.8 * scale;

      // Chassis body (Scuderia Ferrari Rosso Corsa #EA4335)
      ctx.fillStyle = '#EA4335';
      drawRoundRect(ctx, -fuseL * 0.5, -fuseW * 0.5, fuseL, fuseW, 2.0 * scale);
      ctx.fill();

      // Front multi-element aerodynamic wing
      ctx.strokeStyle = '#EA4335';
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(fuseL * 0.48, -4.8 * scale);
      ctx.lineTo(fuseL * 0.48, 4.8 * scale);
      ctx.stroke();

      // Front wing endplates (Carbon slate)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(fuseL * 0.40, -4.8 * scale);
      ctx.lineTo(fuseL * 0.52, -4.8 * scale);
      ctx.moveTo(fuseL * 0.40, 4.8 * scale);
      ctx.lineTo(fuseL * 0.52, 4.8 * scale);
      ctx.stroke();

      // Driver Cockpit & Halo Hoop (White safety halo)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0.5 * scale, 0, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Rear wing with carbon endplates
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.0 * scale;
      ctx.beginPath();
      ctx.moveTo(-fuseL * 0.48, -5.2 * scale);
      ctx.lineTo(-fuseL * 0.48, 5.2 * scale);
      ctx.stroke();

      // Rear crash structure & FIA rain light (crisp light pulse during braking)
      if (isBraking) {
        ctx.fillStyle = '#EA4335';
        ctx.fillRect(-fuseL * 0.55, -1.0 * scale, 1.5 * scale, 2.0 * scale);
      }

      ctx.restore();

      // I. Live Synchronized Telemetry Cursor on Speed Chart
      var curTelX = telX + telW * sCar;
      var curTelY = telY + telH - getSpeedNorm(sCar) * (telH - 4 * scale);

      ctx.save();
      ctx.globalAlpha = Math.max(0.25, carAlpha);
      ctx.strokeStyle = isBraking ? 'rgba(234, 67, 53, 0.70)' : (isOnThrottle ? 'rgba(52, 168, 83, 0.70)' : 'rgba(66, 133, 244, 0.70)');
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(curTelX, telY);
      ctx.lineTo(curTelX, telY + telH);
      ctx.stroke();

      // Cursor pulse dot
      ctx.fillStyle = isBraking ? '#EA4335' : (isOnThrottle ? '#34A853' : '#4285F4');
      ctx.beginPath();
      ctx.arc(curTelX, curTelY, 2.4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // 5. Longitudinal Linear Mixed Effects Spaghetti Plot (Treatment vs Control)
    // Elongated 7-visit time span (0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5 years):
    // - Control Group (Google Blue): Bold mean curve + individual patient trajectories fanning around it
    // - Treatment Group (Google Green): Bold mean curve + individual patient trajectories fanning around it
    function drawLongitudinalSpaghettiMotif(time, pos) {
      ctx.save();

      var lx = pos ? pos.x : Math.max(90, width * 0.1);
      var ly = pos ? pos.y : Math.max(height * 0.82, height - 110);
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.72 : 0.95);

      // Time axis (7 observation visits: 0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5)
      var tOffsets = [0, 24 * scale, 48 * scale, 72 * scale, 96 * scale, 120 * scale, 144 * scale];
      var axisStartX = lx - 38 * scale;
      var axisEndX = lx + 164 * scale;
      var axisY = ly + 12 * scale;

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.55)';
      ctx.lineWidth = 1.1 * scale;

      // Horizontal time axis
      ctx.beginPath();
      ctx.moveTo(axisStartX, axisY);
      ctx.lineTo(axisEndX, axisY);
      ctx.stroke();

      // Vertical response axis
      ctx.beginPath();
      ctx.moveTo(axisStartX, axisY);
      ctx.lineTo(axisStartX, axisY - 68 * scale);
      ctx.stroke();

      // Discrete visit time tick marks (7 visits)
      for (var k = 0; k < tOffsets.length; k++) {
        var tx = lx - 24 * scale + tOffsets[k];
        ctx.beginPath();
        ctx.moveTo(tx, axisY - 2.5 * scale);
        ctx.lineTo(tx, axisY + 2.5 * scale);
        ctx.stroke();
      }

      // Vertical axis tick marks
      var yTickOffsets = [15 * scale, 30 * scale, 45 * scale, 60 * scale];
      for (var yt = 0; yt < yTickOffsets.length; yt++) {
        var ty = axisY - yTickOffsets[yt];
        ctx.beginPath();
        ctx.moveTo(axisStartX - 2.5 * scale, ty);
        ctx.lineTo(axisStartX + 2.5 * scale, ty);
        ctx.stroke();
      }

      // 1. Control Group Individual Trajectories (Dashed lines: Google Blue)
      var ctrlSpaghetti = [
        [ {x: 0, y: 4.0}, {x: 24, y: 7.0}, {x: 48, y: 9.5}, {x: 72, y: 13.0}, {x: 96, y: 16.5}, {x: 120, y: 20.5}, {x: 144, y: 24.5} ],
        [ {x: 0, y: 2.5}, {x: 24, y: 5.0}, {x: 48, y: 8.0}, {x: 72, y: 11.5}, {x: 96, y: 14.5}, {x: 120, y: 18.0}, {x: 144, y: 21.5} ],
        [ {x: 0, y: 0.5}, {x: 24, y: 3.0}, {x: 48, y: 5.5}, {x: 72, y: 9.0},  {x: 96, y: 12.0}, {x: 120, y: 15.5}, {x: 144, y: 19.0} ],
        [ {x: 0, y: 1.5}, {x: 24, y: -0.5}, {x: 48, y: 2.0}, {x: 72, y: 6.0}, {x: 96, y: 9.5},  {x: 120, y: 13.0}, {x: 144, y: 16.5} ],
        [ {x: 0, y: -2.0}, {x: 24, y: -1.0}, {x: 48, y: 1.0}, {x: 72, y: 3.5}, {x: 96, y: 6.5},  {x: 120, y: 10.0}, {x: 144, y: 13.5} ]
      ];

      ctx.save();
      ctx.setLineDash([3.5, 3.5]);
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.38)';
      ctx.lineWidth = 1.0 * scale;

      for (var ci = 0; ci < ctrlSpaghetti.length; ci++) {
        var cLine = ctrlSpaghetti[ci];
        ctx.beginPath();
        for (var cp = 0; cp < cLine.length; cp++) {
          var cx = lx - 24 * scale + cLine[cp].x * scale;
          var cy = ly - cLine[cp].y * scale;
          if (cp === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(66, 133, 244, 0.45)';
        for (var cp2 = 0; cp2 < cLine.length; cp2++) {
          var cx2 = lx - 24 * scale + cLine[cp2].x * scale;
          var cy2 = ly - cLine[cp2].y * scale;
          ctx.beginPath();
          ctx.arc(cx2, cy2, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 2. Control Group Population Mean Trajectory (Solid Google Blue)
      var ctrlMean = [
        {x: 0, y: 1.0}, {x: 24, y: 4.2}, {x: 48, y: 7.4}, {x: 72, y: 10.6}, {x: 96, y: 13.8}, {x: 120, y: 17.0}, {x: 144, y: 20.2}
      ];
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.95)';
      ctx.lineWidth = 2.2 * scale;
      ctx.beginPath();
      for (var cm = 0; cm < ctrlMean.length; cm++) {
        var cmX = lx - 24 * scale + ctrlMean[cm].x * scale;
        var cmY = ly - ctrlMean[cm].y * scale;
        if (cm === 0) ctx.moveTo(cmX, cmY);
        else ctx.lineTo(cmX, cmY);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(66, 133, 244, 0.95)';
      for (var cm2 = 0; cm2 < ctrlMean.length; cm2++) {
        var cmX2 = lx - 24 * scale + ctrlMean[cm2].x * scale;
        var cmY2 = ly - ctrlMean[cm2].y * scale;
        ctx.beginPath();
        ctx.arc(cmX2, cmY2, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Treatment Group Individual Trajectories (Dashed lines: Google Green, fanning around green curve)
      var trtSpaghetti = [
        [ {x: 0, y: 7.5}, {x: 24, y: 13.5}, {x: 48, y: 20.0}, {x: 72, y: 28.0}, {x: 96, y: 35.5}, {x: 120, y: 43.0}, {x: 144, y: 50.0} ],
        [ {x: 0, y: 5.5}, {x: 24, y: 11.0}, {x: 48, y: 17.5}, {x: 72, y: 24.5}, {x: 96, y: 31.5}, {x: 120, y: 38.5}, {x: 144, y: 45.0} ],
        [ {x: 0, y: 3.0}, {x: 24, y: 7.0},  {x: 48, y: 13.5}, {x: 72, y: 19.5}, {x: 96, y: 26.5}, {x: 120, y: 33.5}, {x: 144, y: 40.5} ],
        [ {x: 0, y: 1.5}, {x: 24, y: 5.0},  {x: 48, y: 10.5}, {x: 72, y: 17.5}, {x: 96, y: 25.0}, {x: 120, y: 32.5}, {x: 144, y: 38.5} ],
        [ {x: 0, y: -0.5}, {x: 24, y: 4.0}, {x: 48, y: 9.5},  {x: 72, y: 15.0}, {x: 96, y: 21.5}, {x: 120, y: 28.5}, {x: 144, y: 34.5} ]
      ];

      ctx.save();
      ctx.setLineDash([3.5, 3.5]);
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.38)';
      ctx.lineWidth = 1.0 * scale;

      for (var ti = 0; ti < trtSpaghetti.length; ti++) {
        var tLine = trtSpaghetti[ti];
        ctx.beginPath();
        for (var tp = 0; tp < tLine.length; tp++) {
          var txPt = lx - 24 * scale + tLine[tp].x * scale;
          var tyPt = ly - tLine[tp].y * scale;
          if (tp === 0) ctx.moveTo(txPt, tyPt);
          else ctx.lineTo(txPt, tyPt);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(52, 168, 83, 0.45)';
        for (var tp2 = 0; tp2 < tLine.length; tp2++) {
          var txPt2 = lx - 24 * scale + tLine[tp2].x * scale;
          var tyPt2 = ly - tLine[tp2].y * scale;
          ctx.beginPath();
          ctx.arc(txPt2, tyPt2, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Treatment Group Population Mean Trajectory (Solid Google Green)
      var trtMean = [
        {x: 0, y: 3.5}, {x: 24, y: 8.5}, {x: 48, y: 14.5}, {x: 72, y: 21.0}, {x: 96, y: 28.0}, {x: 120, y: 35.0}, {x: 144, y: 41.5}
      ];
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.95)';
      ctx.lineWidth = 2.4 * scale;
      ctx.beginPath();
      for (var tm = 0; tm < trtMean.length; tm++) {
        var tmX = lx - 24 * scale + trtMean[tm].x * scale;
        var tmY = ly - trtMean[tm].y * scale;
        if (tm === 0) ctx.moveTo(tmX, tmY);
        else ctx.lineTo(tmX, tmY);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(52, 168, 83, 0.95)';
      for (var tm2 = 0; tm2 < trtMean.length; tm2++) {
        var tmX2 = lx - 24 * scale + trtMean[tm2].x * scale;
        var tmY2 = ly - trtMean[tm2].y * scale;
        ctx.beginPath();
        ctx.arc(tmX2, tmY2, 2.8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 6. Experiment Design & Causal Inference Motif (Bottom-Left Flank)
    // Showcases modern experimental design (A/B testing, randomized allocation) and
    // causal inference (Pearl's causal DAG, Rubin's potential outcomes Y(1)/Y(0),
    // counterfactual contrast ATE, and treatment effect distribution with confidence interval):
    // - Randomization Pipeline: Population pool -> Randomizer diamond bifurcation into Treatment (T=1, Green) and Control (T=0, Blue)
    // - Causal DAG: Confounder Z neutralized by randomization with unconfounded directed arrows
    // - Potential Outcomes: Factual observed outcomes vs dashed counterfactual ghost paths (Rubin Causal Model)
    // - Causal Treatment Effect (ATE): Dimension contrast bracket between Y(1) and Y(0)
    // - Effect Distribution & CI: Shifted Gaussian lift distribution, null line, and point estimate tau with confidence interval
    // - Live streaming randomized unit flow
    function drawCausalInferenceMotif(time, pos) {
      ctx.save();

      var cx = pos ? pos.x : Math.max(60, width * 0.12);
      var cy = pos ? pos.y : Math.max(height * 0.84, height - 90);
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.72 : 0.92);

      // Key anchors
      var popX = cx - 52 * scale;
      var randX = cx - 34 * scale;
      var nodeTX = cx - 8 * scale;
      var nodeTY = cy - 18 * scale;
      var nodeCX = cx - 8 * scale;
      var nodeCY = cy + 18 * scale;

      var outY1X = cx + 24 * scale;
      var outY1Y = cy - 22 * scale; // Treated outcome Y(1)
      var outY0X = cx + 24 * scale;
      var outY0Y = cy + 12 * scale; // Control outcome Y(0)

      var effCenterX = cx + 52 * scale;
      var effAxisY = cy - 5 * scale;

      // 1. Population Inflow Pipeline
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 1.1 * scale;
      ctx.beginPath();
      ctx.moveTo(popX - 8 * scale, cy);
      ctx.lineTo(randX, cy);
      ctx.stroke();

      // Population Pool Double Ring
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.75)';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(popX, cy, 4.0 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(100, 116, 139, 0.85)';
      ctx.beginPath();
      ctx.arc(popX, cy, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 2. Randomization Decision Diamond (Bifurcating Random Assignment R ~ Bern(0.5))
      var diaR = 3.4 * scale;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.95)';
      ctx.lineWidth = 1.3 * scale;
      ctx.beginPath();
      ctx.moveTo(randX, cy - diaR);
      ctx.lineTo(randX + diaR, cy);
      ctx.lineTo(randX, cy + diaR);
      ctx.lineTo(randX - diaR, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Randomization pulse ring
      var rPulse = (Math.sin(time * 0.0032) + 1) * 0.5;
      ctx.strokeStyle = 'rgba(66, 133, 244, ' + (0.45 - rPulse * 0.35) + ')';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.arc(randX, cy, (4.2 + rPulse * 3.8) * scale, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Random Assignment Branches to Treatment (T=1) & Control (T=0)
      // Treatment Arm (Upper branch: Google Green)
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.85)';
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(randX + diaR, cy);
      ctx.bezierCurveTo(randX + 12 * scale, cy, nodeTX - 12 * scale, nodeTY, nodeTX, nodeTY);
      ctx.stroke();

      // Control Arm (Lower branch: Google Blue)
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.85)';
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(randX + diaR, cy);
      ctx.bezierCurveTo(randX + 12 * scale, cy, nodeCX - 12 * scale, nodeCY, nodeCX, nodeCY);
      ctx.stroke();

      // 4. Confounder Node Z (Neutralized / Unconfounded by Randomization)
      var confX = cx - 20 * scale;
      var confY = cy;
      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(251, 188, 5, 0.65)'; // Google Yellow / Amber
      ctx.lineWidth = 0.9 * scale;
      ctx.beginPath();
      ctx.moveTo(confX, confY - 3 * scale);
      ctx.lineTo(nodeTX, nodeTY + 3 * scale);
      ctx.moveTo(confX, confY + 3 * scale);
      ctx.lineTo(nodeCX, nodeCY - 3 * scale);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = 'rgba(251, 188, 5, 0.95)';
      ctx.beginPath();
      ctx.arc(confX, confY, 2.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 5. Treatment (T=1) & Control (T=0) Nodes
      // Treatment Node (Google Green)
      ctx.fillStyle = 'rgba(52, 168, 83, 0.95)';
      ctx.beginPath();
      ctx.arc(nodeTX, nodeTY, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Control Node (Google Blue)
      ctx.fillStyle = 'rgba(66, 133, 244, 0.95)';
      ctx.beginPath();
      ctx.arc(nodeCX, nodeCY, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 6. Causal Pathways & Potential Outcomes
      // Factual Treatment Path: T -> Y(1) (Solid Green)
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.90)';
      ctx.lineWidth = 1.8 * scale;
      ctx.beginPath();
      ctx.moveTo(nodeTX, nodeTY);
      ctx.lineTo(outY1X, outY1Y);
      ctx.stroke();

      // Factual Control Path: C -> Y(0) (Solid Blue)
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.90)';
      ctx.lineWidth = 1.8 * scale;
      ctx.beginPath();
      ctx.moveTo(nodeCX, nodeCY);
      ctx.lineTo(outY0X, outY0Y);
      ctx.stroke();

      // Counterfactual Ghost Paths (The Rubin Causal Model: Dashed unobserved potential outcomes)
      ctx.save();
      ctx.setLineDash([2, 3]);

      // Treatment counterfactual Y_T(0) (What if treated subjects hadn't received treatment?)
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.40)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(nodeTX, nodeTY);
      ctx.bezierCurveTo(cx + 8 * scale, nodeTY, cx + 14 * scale, outY0Y - 4 * scale, outY0X - 4 * scale, outY0Y - 4 * scale);
      ctx.stroke();

      // Control counterfactual Y_C(1) (What if control subjects had received treatment?)
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.40)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(nodeCX, nodeCY);
      ctx.bezierCurveTo(cx + 8 * scale, nodeCY, cx + 14 * scale, outY1Y + 4 * scale, outY1X - 4 * scale, outY1Y + 4 * scale);
      ctx.stroke();
      ctx.restore();

      // Observed Outcome Nodes:
      // Y(1) Treatment Outcome Node (Google Green with Halo)
      ctx.fillStyle = 'rgba(52, 168, 83, 0.95)';
      ctx.beginPath();
      ctx.arc(outY1X, outY1Y, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      var y1Pulse = (Math.cos(time * 0.0026) + 1) * 0.5;
      ctx.strokeStyle = 'rgba(52, 168, 83, ' + (0.55 - y1Pulse * 0.40) + ')';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.arc(outY1X, outY1Y, (4.8 + y1Pulse * 3.5) * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Y(0) Control Outcome Node (Google Blue)
      ctx.fillStyle = 'rgba(66, 133, 244, 0.95)';
      ctx.beginPath();
      ctx.arc(outY0X, outY0Y, 3.0 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 7. Causal Treatment Effect (ATE = Y(1) - Y(0)) Dimension Bracket
      var brkX = outY1X + 8 * scale;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.65)';
      ctx.lineWidth = 1.1 * scale;
      ctx.beginPath();
      // Upper bracket arm
      ctx.moveTo(brkX - 2.5 * scale, outY1Y);
      ctx.lineTo(brkX + 2.0 * scale, outY1Y);
      // Vertical line
      ctx.lineTo(brkX + 2.0 * scale, cy - 5 * scale - 2.5 * scale);
      // Center notch pointing right
      ctx.lineTo(brkX + 4.5 * scale, cy - 5 * scale);
      ctx.lineTo(brkX + 2.0 * scale, cy - 5 * scale + 2.5 * scale);
      // Lower vertical line
      ctx.lineTo(brkX + 2.0 * scale, outY0Y);
      // Lower bracket arm
      ctx.lineTo(brkX - 2.5 * scale, outY0Y);
      ctx.stroke();

      // 8. Causal Treatment Effect Distribution & Confidence Interval
      // Null Hypothesis Line (tau = 0, Dashed grey line)
      var nullX = cx + 42 * scale;
      var distBaseY = effAxisY + 12 * scale;
      var distTopY = effAxisY - 14 * scale;

      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.lineWidth = 0.9 * scale;
      ctx.beginPath();
      ctx.moveTo(nullX, distBaseY + 2 * scale);
      ctx.lineTo(nullX, distTopY - 2 * scale);
      ctx.stroke();
      ctx.restore();

      // Base effect axis
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.50)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(nullX - 4 * scale, distBaseY);
      ctx.lineTo(effCenterX + 16 * scale, distBaseY);
      ctx.stroke();

      // Gaussian Causal Effect Distribution (Bell curve centered at positive lift)
      ctx.beginPath();
      for (var gx = -11; gx <= 11; gx += 1) {
        var gz = Math.exp(-(gx * gx) / 32);
        var gpx = effCenterX + gx * scale;
        var gpy = distBaseY - gz * (16 * scale);
        if (gx === -11) ctx.moveTo(gpx, gpy);
        else ctx.lineTo(gpx, gpy);
      }
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.85)';
      ctx.lineWidth = 1.3 * scale;
      ctx.stroke();

      // Subtle distribution fill
      ctx.lineTo(effCenterX + 11 * scale, distBaseY);
      ctx.lineTo(effCenterX - 11 * scale, distBaseY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(52, 168, 83, 0.12)';
      ctx.fill();

      // Confidence Interval Bar [CI_low, CI_high]
      var ciLowX = effCenterX - 6.5 * scale;
      var ciHighX = effCenterX + 6.5 * scale;
      var ciY = effAxisY + 2 * scale;

      ctx.strokeStyle = 'rgba(52, 168, 83, 0.95)';
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(ciLowX, ciY);
      ctx.lineTo(ciHighX, ciY);
      // Whiskers
      ctx.moveTo(ciLowX, ciY - 2.5 * scale);
      ctx.lineTo(ciLowX, ciY + 2.5 * scale);
      ctx.moveTo(ciHighX, ciY - 2.5 * scale);
      ctx.lineTo(ciHighX, ciY + 2.5 * scale);
      ctx.stroke();

      // Point estimate tau dot (Google Green)
      ctx.fillStyle = 'rgba(52, 168, 83, 0.95)';
      ctx.beginPath();
      ctx.arc(effCenterX, ciY, 2.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 9. Live Streaming Randomized Unit Particles
      var pLoop = 3200;
      var pCount = 4;
      for (var p = 0; p < pCount; p++) {
        var pProg = ((time + p * (pLoop / pCount)) % pLoop) / pLoop;
        var isTreatedUnit = (p % 2 === 0);
        var partPt, partColor;

        if (pProg < 0.28) {
          // Approaching randomization gate from population pool
          var s1 = pProg / 0.28;
          partPt = { x: popX + (randX - popX) * s1, y: cy };
          partColor = 'rgba(100, 116, 139, 0.85)';
        } else if (pProg < 0.62) {
          // Flowing along randomized arm to Treatment or Control node
          var s2 = (pProg - 0.28) / 0.34;
          if (isTreatedUnit) {
            partPt = getBezierPoint(s2, randX + diaR, cy, randX + 12 * scale, cy, nodeTX - 12 * scale, nodeTY, nodeTX, nodeTY);
            partColor = 'rgba(52, 168, 83, 0.90)';
          } else {
            partPt = getBezierPoint(s2, randX + diaR, cy, randX + 12 * scale, cy, nodeCX - 12 * scale, nodeCY, nodeCX, nodeCY);
            partColor = 'rgba(66, 133, 244, 0.90)';
          }
        } else {
          // Flowing from Treatment/Control node to Outcome Y
          var s3 = (pProg - 0.62) / 0.38;
          if (isTreatedUnit) {
            partPt = { x: nodeTX + (outY1X - nodeTX) * s3, y: nodeTY + (outY1Y - nodeTY) * s3 };
            partColor = 'rgba(52, 168, 83, 0.95)';
          } else {
            partPt = { x: nodeCX + (outY0X - nodeCX) * s3, y: nodeCY + (outY0Y - nodeCY) * s3 };
            partColor = 'rgba(66, 133, 244, 0.95)';
          }
        }

        ctx.fillStyle = partColor;
        ctx.beginPath();
        ctx.arc(partPt.x, partPt.y, 1.6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 7. Google Web Search & Information Retrieval (Lower-Right Flank)
    // Web search capsule, PageRank crawl graph, and SERP document ranking cards
    function drawGoogleSearchMotif(time, pos) {
      ctx.save();

      var gx = pos ? pos.x : Math.min(width - 95, width * 0.86);
      var gy = pos ? pos.y : Math.max(height * 0.72, height - 200);
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.78 : 0.95);

      // A. Google Search Capsule Bar (Iconic rounded search pill)
      var barW = 96 * scale;
      var barH = 22 * scale;
      var barX = gx - barW * 0.48;
      var barY = gy - 40 * scale;
      var barR = barH * 0.5;

      // Outer search capsule pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      drawRoundRect(ctx, barX, barY, barW, barH, barR);
      ctx.fill();

      ctx.strokeStyle = 'rgba(66, 133, 244, 0.75)'; // Google Blue outline
      ctx.lineWidth = 1.3 * scale;
      drawRoundRect(ctx, barX, barY, barW, barH, barR);
      ctx.stroke();

      // Search Magnifying Lens Icon on left inside bar
      var lensX = barX + 11 * scale;
      var lensY = barY + barH * 0.5;
      var lensR = 4.0 * scale;

      ctx.strokeStyle = 'rgba(66, 133, 244, 0.90)';
      ctx.lineWidth = 1.3 * scale;
      ctx.beginPath();
      ctx.arc(lensX, lensY, lensR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      var hCos = Math.SQRT1_2;
      ctx.moveTo(lensX + lensR * hCos, lensY + lensR * hCos);
      ctx.lineTo(lensX + (lensR + 3.2 * scale) * hCos, lensY + (lensR + 3.2 * scale) * hCos);
      ctx.stroke();

      // Blinking Query Cursor / Query Line inside search bar
      var cursorPulse = Math.sin(time * 0.005) > 0;
      var queryEndX = lensX + 14 * scale + (Math.sin(time * 0.001) + 1) * 10 * scale;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.55)';
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(lensX + 10 * scale, lensY);
      ctx.lineTo(queryEndX, lensY);
      ctx.stroke();

      if (cursorPulse) {
        ctx.strokeStyle = 'rgba(66, 133, 244, 0.85)';
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(queryEndX + 2 * scale, lensY - 4 * scale);
        ctx.lineTo(queryEndX + 2 * scale, lensY + 4 * scale);
        ctx.stroke();
      }

      // 4 Google Colors on right of search bar (Blue, Red, Yellow, Green)
      var gColors = [
        'rgba(66, 133, 244, 0.90)', // Blue
        'rgba(234, 67, 53, 0.90)',  // Red
        'rgba(251, 188, 5, 0.95)',  // Yellow
        'rgba(52, 168, 83, 0.90)'   // Green
      ];
      for (var gc = 0; gc < 4; gc++) {
        ctx.fillStyle = gColors[gc];
        ctx.beginPath();
        ctx.arc(barX + barW - 20 * scale + gc * 4.5 * scale, lensY, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // B. Web Crawling & PageRank Hyperlink Graph (Crawled web page nodes)
      var crawlNodes = [
        { x: gx - 32 * scale, y: gy - 2 * scale, r: 4.0 * scale },
        { x: gx + 2 * scale,  y: gy - 12 * scale, r: 4.8 * scale },
        { x: gx + 36 * scale, y: gy - 4 * scale, r: 4.2 * scale }
      ];

      // Directed hyperlink crawl edges
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.50)';
      ctx.lineWidth = 1.0 * scale;
      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(crawlNodes[0].x, crawlNodes[0].y);
      ctx.lineTo(crawlNodes[1].x, crawlNodes[1].y);
      ctx.lineTo(crawlNodes[2].x, crawlNodes[2].y);
      ctx.stroke();
      ctx.restore();

      // Crawl nodes (Web Page document nodes)
      for (var cn = 0; cn < crawlNodes.length; cn++) {
        var cNode = crawlNodes[cn];
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = gColors[cn % 4];
        ctx.lineWidth = 1.3 * scale;
        ctx.beginPath();
        ctx.arc(cNode.x, cNode.y, cNode.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mini document lines inside page node
        ctx.strokeStyle = gColors[cn % 4];
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cNode.x - 1.8 * scale, cNode.y);
        ctx.lineTo(cNode.x + 1.8 * scale, cNode.y);
        ctx.stroke();
      }

      // C. SERP (Search Engine Results Page) Ranked Snippets
      var serpStartX = gx - 36 * scale;
      var serpY1 = gy + 14 * scale;

      // Result #1 (Rank #1 Document - High Relevance)
      // Blue Title
      ctx.fillStyle = 'rgba(66, 133, 244, 0.92)';
      drawRoundRect(ctx, serpStartX, serpY1, 56 * scale, 3.2 * scale, 1.5 * scale);
      ctx.fill();

      // Green URL Breadcrumb
      ctx.fillStyle = 'rgba(52, 168, 83, 0.80)';
      drawRoundRect(ctx, serpStartX, serpY1 + 5.5 * scale, 34 * scale, 2.0 * scale, 1.0 * scale);
      ctx.fill();

      // Snippet Lines
      ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
      drawRoundRect(ctx, serpStartX, serpY1 + 10 * scale, 64 * scale, 2.0 * scale, 1.0 * scale);
      ctx.fill();
      drawRoundRect(ctx, serpStartX, serpY1 + 13.5 * scale, 45 * scale, 2.0 * scale, 1.0 * scale);
      ctx.fill();

      // Result #2 (Rank #2 Document)
      var serpY2 = serpY1 + 22 * scale;
      ctx.fillStyle = 'rgba(66, 133, 244, 0.75)';
      drawRoundRect(ctx, serpStartX, serpY2, 46 * scale, 3.0 * scale, 1.5 * scale);
      ctx.fill();

      ctx.fillStyle = 'rgba(52, 168, 83, 0.65)';
      drawRoundRect(ctx, serpStartX, serpY2 + 5.2 * scale, 28 * scale, 1.8 * scale, 1.0 * scale);
      ctx.fill();

      ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
      drawRoundRect(ctx, serpStartX, serpY2 + 9.5 * scale, 52 * scale, 1.8 * scale, 1.0 * scale);
      ctx.fill();

      // D. Semantic Retrieval Vector connecting Search Bar to Top Ranked Document
      var qBeamProgress = (time % 2400) / 2400;
      var beamStartY = barY + barH;
      var beamEndY = serpY1;
      var beamX = serpStartX + 12 * scale;

      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.55)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      ctx.moveTo(beamX, beamStartY);
      ctx.lineTo(beamX, beamEndY);
      ctx.stroke();
      ctx.restore();

      // Live query evaluation pulse dot traveling down to result
      var pulseY = beamStartY + (beamEndY - beamStartY) * qBeamProgress;
      ctx.fillStyle = 'rgba(66, 133, 244, 0.95)';
      ctx.beginPath();
      ctx.arc(beamX, pulseY, 2.0 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 8. Dota 2 Invoker - Receptive Elemental Orbs & Invoked Skill Slot (Mid-Left Flank)
    // Narrative Sequence (Pure Vector Geometry, No Text/Keycaps):
    // 1. Ball 1 manifests from the nexus core and joins the celestial orbit
    // 2. Ball 2 manifests and joins the orbit (spaced opposite at 180°)
    // 3. Ball 3 manifests and joins the orbit (tri-orbital harmony at 120°)
    // 4. Arcane filaments focus into the Skill Slot below -> Invoked Skill Icon appears!
    // 5. Skill Slot flashes with radiant power -> THE SKILL IS CAST (Deafening Blast / Sun Strike)!
    function drawInvokerMotif(time, pos) {
      ctx.save();

      var cx = pos ? pos.x : Math.max(50, width * 0.12);
      var cy = pos ? pos.y : Math.max(380, height * 0.44);
      var scale = (pos ? pos.scale : 1.0) * (width < 768 ? 0.74 : 0.92);

      // Loop duration per combo (6.4 seconds per invocation cycle)
      var cycleDuration = 6400;
      var totalCycles = Math.floor(time / cycleDuration);
      var t = time % cycleDuration; // 0 to 6400 ms

      // Alternating combos:
      // Combo 0: Deafening Blast (Quas -> Wex -> Exort -> Deafening Blast Cast)
      // Combo 1: Cataclysm (Exort -> Exort -> Exort -> Cataclysm Global Strikes)
      // Combo 2: Aghanim's Shard EMP (Wex -> Wex -> Wex -> Magnetic Vortex Suction & EMP Detonation)
      var comboIdx = totalCycles % 3;

      // Elemental definitions
      var REAGENTS = {
        Q: { name: 'Quas',  color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.35)', sym: 'frost' },
        W: { name: 'Wex',   color: '#a855f7', glow: 'rgba(168, 85, 247, 0.35)', sym: 'spark' },
        E: { name: 'Exort', color: '#f97316', glow: 'rgba(249, 115, 22, 0.35)', sym: 'solar' }
      };

      var comboOrbs;
      if (comboIdx === 0) {
        comboOrbs = [REAGENTS.Q, REAGENTS.W, REAGENTS.E];
      } else if (comboIdx === 1) {
        comboOrbs = [REAGENTS.E, REAGENTS.E, REAGENTS.E];
      } else {
        comboOrbs = [REAGENTS.W, REAGENTS.W, REAGENTS.W];
      }

      // Sequential Timestamps
      var tSpawn1 = 500;       // Ball 1 manifests and begins orbiting
      var tSpawn2 = 1450;      // Ball 2 manifests and joins orbit
      var tSpawn3 = 2400;      // Ball 3 manifests and completes the triad
      var tInvoke = 3300;      // Energy channels down into Skill Slot
      var tSkillAppear = 3500; // Skill Icon appears in slot
      var tCast = 4400;        // Skill triggers & is cast!
      var tFade = 5700;        // Smooth crossfade / reset

      // Global fade factor for seamless loop reset
      var comboFade = 1.0;
      if (t > tFade) {
        comboFade = Math.max(0, (cycleDuration - t) / (cycleDuration - tFade));
      } else if (t < 250) {
        comboFade = Math.min(1.0, t / 250);
      }
      ctx.globalAlpha = comboFade;

      // Geometry Layout:
      // Orbit Center (Top)
      var nexusY = cy - 14 * scale;
      var orbR = 25 * scale;
      var tiltRatio = 0.44;

      // Skill Slot (Directly below orbit, perfectly centered)
      var slotY = cy + 22 * scale;
      var slotSize = 17 * scale;
      var slotR = 3.6 * scale;

      // ------------------------------------------------------------------------
      // 1. CELESTIAL ORBIT & RECEPTIVE BALLS (Appear one by one!)
      // ------------------------------------------------------------------------

      // Orbital elliptical guide ring
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 0.9 * scale;
      ctx.beginPath();
      ctx.ellipse(cx, nexusY, orbR, orbR * tiltRatio, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Central Arcane Invoke Nexus Core
      ctx.save();
      var isInvoking = (t >= tInvoke && t < tCast);
      ctx.strokeStyle = isInvoking ? 'rgba(251, 188, 5, 0.95)' : 'rgba(203, 213, 225, 0.70)';
      ctx.lineWidth = isInvoking ? 1.4 * scale : 0.9 * scale;
      ctx.beginPath();
      ctx.arc(cx, nexusY, (isInvoking ? 11.5 : 10) * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Counter-rotating 3-blade arcane glyph
      var spin = time * -0.0015;
      ctx.strokeStyle = isInvoking ? '#FBBC05' : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1.0 * scale;
      ctx.beginPath();
      for (var b = 0; b < 3; b++) {
        var ba = spin + b * (Math.PI * 2 / 3);
        var bx = cx + Math.cos(ba) * (8 * scale);
        var by = nexusY + Math.sin(ba) * (8 * scale);
        ctx.moveTo(cx, nexusY);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();

      // Center golden core pip
      ctx.fillStyle = '#FBBC05';
      ctx.beginPath();
      ctx.arc(cx, nexusY, 3.0 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, nexusY, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Determine active balls (1, 2, or 3 balls appearing sequentially)
      var activeBalls = [];
      if (t >= tSpawn1) activeBalls.push({ reagent: comboOrbs[0], spawnT: tSpawn1 });
      if (t >= tSpawn2) activeBalls.push({ reagent: comboOrbs[1], spawnT: tSpawn2 });
      if (t >= tSpawn3) activeBalls.push({ reagent: comboOrbs[2], spawnT: tSpawn3 });

      var numBalls = activeBalls.length;
      var orbOrbitSpeed = time * 0.0018;

      // Draw the balls that have appeared so far
      for (var k = 0; k < numBalls; k++) {
        var ball = activeBalls[k];
        var ballAge = t - ball.spawnT;

        // Birth pop scale (scale bounces in quickly from 0 -> 1.3 -> 1.0)
        var popScale = 1.0;
        if (ballAge < 250) {
          var popProg = ballAge / 250;
          popScale = Math.sin(popProg * Math.PI * 0.5) * 1.3;
        }

        // Orbital angular spacing adjusts dynamically:
        // 1 ball: 0
        // 2 balls: opposite (180°)
        // 3 balls: equilateral triad (120°)
        var angleSpacing = (numBalls === 1) ? 0 : ((numBalls === 2) ? Math.PI : (Math.PI * 2 / 3));
        var oAngle = orbOrbitSpeed + k * angleSpacing;

        var ox = cx + Math.cos(oAngle) * orbR;
        var oy = nexusY + Math.sin(oAngle) * (orbR * tiltRatio);

        var rInfo = ball.reagent;

        // Arcane energy filament connecting Nexus to Orb
        ctx.save();
        ctx.strokeStyle = rInfo.glow;
        ctx.lineWidth = 1.0 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, nexusY);
        ctx.lineTo(ox, oy);
        ctx.stroke();
        ctx.restore();

        // Trailing comet sparks
        for (var tr = 1; tr <= 3; tr++) {
          var tAng = oAngle - tr * 0.14;
          var tx = cx + Math.cos(tAng) * orbR;
          var ty = nexusY + Math.sin(tAng) * (orbR * tiltRatio);
          ctx.fillStyle = rInfo.color;
          ctx.globalAlpha = comboFade * (0.38 - tr * 0.10);
          ctx.beginPath();
          ctx.arc(tx, ty, (1.8 - tr * 0.4) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = comboFade;

        // Orb Glowing Aura
        ctx.fillStyle = rInfo.glow;
        ctx.beginPath();
        ctx.arc(ox, oy, 6.2 * scale * popScale, 0, Math.PI * 2);
        ctx.fill();

        // Orb Solid Core Sphere
        ctx.fillStyle = rInfo.color;
        ctx.beginPath();
        ctx.arc(ox, oy, 4.0 * scale * popScale, 0, Math.PI * 2);
        ctx.fill();

        // Internal Elemental Symbol
        ctx.fillStyle = '#ffffff';
        if (rInfo.sym === 'frost') {
          // Frost diamond
          ctx.beginPath();
          ctx.moveTo(ox, oy - 2.0 * scale * popScale);
          ctx.lineTo(ox + 1.8 * scale * popScale, oy);
          ctx.lineTo(ox, oy + 2.0 * scale * popScale);
          ctx.lineTo(ox - 1.8 * scale * popScale, oy);
          ctx.closePath();
          ctx.fill();
        } else if (rInfo.sym === 'spark') {
          // Electric spark cross
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(ox - 1.8 * scale * popScale, oy);
          ctx.lineTo(ox + 1.8 * scale * popScale, oy);
          ctx.moveTo(ox, oy - 1.8 * scale * popScale);
          ctx.lineTo(ox, oy + 1.8 * scale * popScale);
          ctx.stroke();
        } else {
          // Solar radiant center pip
          ctx.beginPath();
          ctx.arc(ox, oy, 1.6 * scale * popScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ------------------------------------------------------------------------
      // 2. INVOCATION ENERGY BEAMS (Focusing from Orbit into Skill Slot)
      // ------------------------------------------------------------------------
      if (t >= tInvoke && t < tCast) {
        var invProg = Math.min(1.0, (t - tInvoke) / (tSkillAppear - tInvoke));
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 188, 5, ' + (0.85 - (t > tSkillAppear ? (t - tSkillAppear) * 0.0008 : 0)) + ')';
        ctx.lineWidth = 1.3 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, nexusY + 8 * scale);
        ctx.lineTo(cx, slotY - slotSize * 0.5);
        ctx.stroke();

        // Radiant focus spark at top of skill slot
        ctx.fillStyle = '#FBBC05';
        ctx.beginPath();
        ctx.arc(cx, slotY - slotSize * 0.5, 2.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ------------------------------------------------------------------------
      // 3. THE SKILL SLOT (Appears & reveals invoked skill!)
      // ------------------------------------------------------------------------
      var hasSkill = (t >= tSkillAppear);
      var isCasting = (t >= tCast && t < tFade);

      // Slot Base Card
      var slotHalf = slotSize * 0.5;
      var slotBg = hasSkill ? 'rgba(255, 255, 255, 0.90)' : 'rgba(241, 245, 249, 0.55)';
      var slotBorder = hasSkill ? (isCasting ? '#EA4335' : 'rgba(251, 188, 5, 0.92)') : 'rgba(148, 163, 184, 0.45)';

      // Outer socket box
      ctx.fillStyle = slotBg;
      drawRoundRect(ctx, cx - slotHalf, slotY - slotHalf, slotSize, slotSize, slotR);
      ctx.fill();

      ctx.strokeStyle = slotBorder;
      ctx.lineWidth = (hasSkill ? 1.5 : 1.0) * scale;
      drawRoundRect(ctx, cx - slotHalf, slotY - slotHalf, slotSize, slotSize, slotR);
      ctx.stroke();

      // Golden Invoke flash ripple when skill first appears
      if (t >= tSkillAppear && t < tSkillAppear + 350) {
        var flashProg = (t - tSkillAppear) / 350;
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 188, 5, ' + (0.9 - flashProg * 0.9) + ')';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(cx, slotY, (slotSize * 0.6) + flashProg * (12 * scale), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Cast trigger flash pulse when cast begins
      if (t >= tCast && t < tCast + 300) {
        var castFlashProg = (t - tCast) / 300;
        ctx.save();
        ctx.strokeStyle = 'rgba(234, 67, 53, ' + (0.95 - castFlashProg * 0.95) + ')';
        ctx.lineWidth = 1.8 * scale;
        ctx.beginPath();
        ctx.arc(cx, slotY, (slotSize * 0.6) + castFlashProg * (14 * scale), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Inner Content of Skill Slot:
      if (hasSkill) {
        // SKILL ICON HAS APPEARED!
        var appearProg = Math.min(1.0, (t - tSkillAppear) / 250);
        var iconScale = appearProg * (isCasting ? 0.95 : 1.0);

        ctx.save();
        ctx.translate(cx, slotY);
        ctx.scale(iconScale, iconScale);

        if (comboIdx === 0) {
          // Deafening Blast Icon (Tri-elemental radiating sonic crest)
          ctx.fillStyle = '#0ea5e9'; // Quas cyan
          ctx.beginPath();
          ctx.arc(-2.6 * scale, -2.4 * scale, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#a855f7'; // Wex violet
          ctx.beginPath();
          ctx.arc(2.6 * scale, -2.4 * scale, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f97316'; // Exort flame
          ctx.beginPath();
          ctx.arc(0, 2.6 * scale, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Sonic wave crest
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.0 * scale;
          ctx.beginPath();
          ctx.arc(0, 0, 3.6 * scale, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        } else if (comboIdx === 1) {
          // Cataclysm Icon (Double / Quad solar flare reticle with radiating beams)
          // Central radiant solar core
          ctx.fillStyle = '#FBBC05';
          ctx.beginPath();
          ctx.arc(0, 0, 2.6 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Surrounding paired solar flares (showing dual-strike nature of Cataclysm)
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(-2.4 * scale, -2.2 * scale, 1.4 * scale, 0, Math.PI * 2);
          ctx.arc(2.4 * scale, 2.2 * scale, 1.4 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Cardinal & diagonal targeting laser crosshairs
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 0.9 * scale;
          ctx.beginPath();
          ctx.moveTo(-5.0 * scale, 0);
          ctx.lineTo(5.0 * scale, 0);
          ctx.moveTo(0, -5.0 * scale);
          ctx.lineTo(0, 5.0 * scale);
          ctx.stroke();

          // White-hot center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 1.1 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Aghanim's Shard EMP Icon (Vortex suction sphere with central crystal shard & lightning)
          // Radiant violet vortex disc
          ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
          ctx.beginPath();
          ctx.arc(0, 0, 4.4 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Inward curved suction vortex spirals
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.0 * scale;
          ctx.beginPath();
          ctx.arc(0, 0, 3.6 * scale, -0.6, 1.2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 3.6 * scale, 2.5, 4.3);
          ctx.stroke();

          // Aghanim's Shard Crystal (Geometric cyan-violet diamond shard)
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.moveTo(0, -3.2 * scale);
          ctx.lineTo(1.8 * scale, 0);
          ctx.lineTo(0, 3.2 * scale);
          ctx.lineTo(-1.8 * scale, 0);
          ctx.closePath();
          ctx.fill();

          // White-hot inner lightning spark
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.9 * scale;
          ctx.beginPath();
          ctx.moveTo(-0.9 * scale, -1.8 * scale);
          ctx.lineTo(0.5 * scale, -0.2 * scale);
          ctx.lineTo(-0.5 * scale, 0.4 * scale);
          ctx.lineTo(0.9 * scale, 1.8 * scale);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 1.1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        // Dormant Socket: elegant geometric corner guides
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 0.8 * scale;
        var guideD = 3.5 * scale;
        ctx.beginPath();
        // Top-left corner
        ctx.moveTo(cx - slotHalf + guideD, slotY - slotHalf);
        ctx.lineTo(cx - slotHalf, slotY - slotHalf);
        ctx.lineTo(cx - slotHalf, slotY - slotHalf + guideD);
        // Bottom-right corner
        ctx.moveTo(cx + slotHalf - guideD, slotY + slotHalf);
        ctx.lineTo(cx + slotHalf, slotY + slotHalf);
        ctx.lineTo(cx + slotHalf, slotY + slotHalf - guideD);
        ctx.stroke();

        // Center dormant pip
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, slotY, 1.4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // ------------------------------------------------------------------------
      // 4. THE SKILL IS CAST! (Dynamic Spell Projection below Skill Slot)
      // ------------------------------------------------------------------------
      if (t >= tCast && t < tFade) {
        var castProg = (t - tCast) / (tFade - tCast); // 0 to 1
        var spellCastY = slotY + slotSize * 0.5 + 16 * scale;

        if (comboIdx === 0) {
          // 1. DEAFENING BLAST CAST:
          // Sonic tri-wave shockwave expanding downwards in a wide fanning cone
          var waveRadius = (6 + castProg * 32) * scale;
          var waveAlpha = Math.max(0, 0.95 - castProg * 0.90);

          // Quas Leading Shockwave (Frost Cyan)
          ctx.strokeStyle = 'rgba(14, 165, 233, ' + waveAlpha + ')';
          ctx.lineWidth = 1.8 * scale;
          ctx.beginPath();
          ctx.arc(cx, spellCastY - 6 * scale, waveRadius, Math.PI * 0.2, Math.PI * 0.8, false);
          ctx.stroke();

          // Wex Middle Shockwave (Storm Violet)
          ctx.strokeStyle = 'rgba(168, 85, 247, ' + waveAlpha + ')';
          ctx.lineWidth = 1.8 * scale;
          ctx.beginPath();
          ctx.arc(cx, spellCastY - 6 * scale, waveRadius * 0.82, Math.PI * 0.22, Math.PI * 0.78, false);
          ctx.stroke();

          // Exort Inner Shockwave (Flame Orange)
          ctx.strokeStyle = 'rgba(249, 115, 22, ' + waveAlpha + ')';
          ctx.lineWidth = 1.8 * scale;
          ctx.beginPath();
          ctx.arc(cx, spellCastY - 6 * scale, waveRadius * 0.64, Math.PI * 0.24, Math.PI * 0.76, false);
          ctx.stroke();

          // Radiating Acoustic Sonic Rays
          ctx.strokeStyle = 'rgba(148, 163, 184, ' + (waveAlpha * 0.7) + ')';
          ctx.lineWidth = 0.9 * scale;
          var rayAngles = [Math.PI * 0.32, Math.PI * 0.44, Math.PI * 0.56, Math.PI * 0.68];
          for (var ra = 0; ra < rayAngles.length; ra++) {
            var ang = rayAngles[ra];
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * (4 * scale), (spellCastY - 6 * scale) + Math.sin(ang) * (4 * scale));
            ctx.lineTo(cx + Math.cos(ang) * (waveRadius + 5 * scale), (spellCastY - 6 * scale) + Math.sin(ang) * (waveRadius + 5 * scale));
            ctx.stroke();
          }
        } else if (comboIdx === 1) {
          // 2. CATACLYSM GLOBAL STRIKES CAST:
          // Global multi-target Cataclysm: 4 enemy pairs (8 simultaneous orbital strikes across the flank!)
          var strikeProg = castProg; // 0 to 1

          // 8 strikes arranged in 4 distinct tactical pairs (Dota 2 Cataclysm dual-strike mechanics)
          var cStrikes = [
            // Pair 1 (North-west target)
            { dx: -38 * scale, dy: -14 * scale, delay: 0.00, beamAng: 0.20 },
            { dx: -24 * scale, dy: -24 * scale, delay: 0.02, beamAng: 0.12 },
            // Pair 2 (North-east target)
            { dx: +16 * scale, dy: -20 * scale, delay: 0.01, beamAng: -0.15 },
            { dx: +34 * scale, dy: -8 * scale,  delay: 0.03, beamAng: -0.22 },
            // Pair 3 (Mid target)
            { dx: -16 * scale, dy: +18 * scale, delay: 0.01, beamAng: 0.08 },
            { dx: +12 * scale, dy: +12 * scale, delay: 0.02, beamAng: -0.10 },
            // Pair 4 (South target)
            { dx: -30 * scale, dy: +44 * scale, delay: 0.03, beamAng: 0.18 },
            { dx: +24 * scale, dy: +40 * scale, delay: 0.02, beamAng: -0.16 }
          ];

          // Global atmospheric Cataclysm flare illumination
          if (strikeProg >= 0.28 && strikeProg <= 0.60) {
            var flashPhase = (strikeProg - 0.28) / 0.32;
            var skyGlowAlpha = Math.sin(flashPhase * Math.PI) * 0.12;
            ctx.save();
            ctx.fillStyle = 'rgba(251, 188, 5, ' + skyGlowAlpha + ')';
            ctx.beginPath();
            ctx.arc(cx, spellCastY + 12 * scale, 65 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Render each of the 8 global orbital strikes
          for (var si = 0; si < cStrikes.length; si++) {
            var cs = cStrikes[si];
            var sx = cx + cs.dx;
            var sy = spellCastY + cs.dy;

            // Local progress for this strike
            var sProg = Math.max(0, Math.min(1.0, (strikeProg - cs.delay) / (1.0 - cs.delay)));

            // A. Pre-impact targeting reticle (charging inward)
            if (sProg < 0.48) {
              var retAlpha = Math.min(1.0, sProg / 0.15) * Math.max(0, 1.0 - (sProg - 0.35) / 0.13);
              var retShrink = (1.0 - sProg / 0.40);
              var ringR = (3.5 + retShrink * 4.5) * scale;

              // Outer golden ring
              ctx.strokeStyle = 'rgba(251, 188, 5, ' + (retAlpha * 0.90) + ')';
              ctx.lineWidth = 1.0 * scale;
              ctx.beginPath();
              ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
              ctx.stroke();

              // Inner focal amber ring with crosshair ticks
              ctx.strokeStyle = 'rgba(249, 115, 22, ' + (retAlpha * 0.85) + ')';
              ctx.lineWidth = 0.8 * scale;
              ctx.beginPath();
              ctx.arc(sx, sy, 2.5 * scale, 0, Math.PI * 2);
              ctx.stroke();

              var tLen = 3.2 * scale;
              ctx.beginPath();
              ctx.moveTo(sx - tLen, sy); ctx.lineTo(sx + tLen, sy);
              ctx.moveTo(sx, sy - tLen); ctx.lineTo(sx, sy + tLen);
              ctx.stroke();
            }

            // B. High-energy orbital laser beam plunging from the heavens
            if (sProg >= 0.18 && sProg <= 0.52) {
              var beamPhase = (sProg - 0.18) / 0.34;
              var bAlpha = Math.sin(beamPhase * Math.PI);
              var beamTopX = sx + Math.tan(cs.beamAng) * (70 * scale);
              var beamTopY = sy - 70 * scale;

              ctx.save();
              // Outer fiery beam sheath
              ctx.strokeStyle = 'rgba(249, 115, 22, ' + (bAlpha * 0.75) + ')';
              ctx.lineWidth = 2.4 * scale;
              ctx.beginPath();
              ctx.moveTo(beamTopX, beamTopY);
              ctx.lineTo(sx, sy);
              ctx.stroke();

              // Inner white-hot laser core
              ctx.strokeStyle = 'rgba(255, 255, 255, ' + (bAlpha * 0.95) + ')';
              ctx.lineWidth = 1.1 * scale;
              ctx.beginPath();
              ctx.moveTo(beamTopX, beamTopY);
              ctx.lineTo(sx, sy);
              ctx.stroke();
              ctx.restore();
            }

            // C. Solar Detonation & Blast Wave (Cataclysmic impact)
            if (sProg >= 0.32) {
              var blastPhase = (sProg - 0.32) / 0.68; // 0 to 1
              var blastR = (3.0 + Math.pow(blastPhase, 0.6) * 9.0) * scale;
              var blastAlpha = Math.max(0, 1.0 - Math.pow(blastPhase, 1.2));

              // Expanding fiery shockwave ring
              ctx.strokeStyle = 'rgba(249, 115, 22, ' + (blastAlpha * 0.85) + ')';
              ctx.lineWidth = 1.2 * scale;
              ctx.beginPath();
              ctx.arc(sx, sy, blastR, 0, Math.PI * 2);
              ctx.stroke();

              // Radiant golden solar fireball
              ctx.fillStyle = 'rgba(251, 188, 5, ' + (blastAlpha * 0.65) + ')';
              ctx.beginPath();
              ctx.arc(sx, sy, blastR * 0.65, 0, Math.PI * 2);
              ctx.fill();

              // White-hot focal core
              if (blastPhase < 0.50) {
                ctx.fillStyle = 'rgba(255, 255, 255, ' + ((1 - blastPhase / 0.50) * 0.95) + ')';
                ctx.beginPath();
                ctx.arc(sx, sy, 1.8 * scale, 0, Math.PI * 2);
                ctx.fill();
              }

              // Radiant solar spark ejecta
              var sparkDist = (4.0 + blastPhase * 8.5) * scale;
              ctx.fillStyle = 'rgba(249, 115, 22, ' + (blastAlpha * 0.70) + ')';
              for (var sp = 0; sp < 4; sp++) {
                var sAng = sp * (Math.PI * 0.5) + cs.beamAng;
                ctx.beginPath();
                ctx.arc(sx + Math.cos(sAng) * sparkDist, sy + Math.sin(sAng) * sparkDist, 0.9 * scale, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        } else {
          // 3. AGHANIM'S SHARD EMP CAST (Subtle, sleek & minimalist):
          // Phase 1: Subtle vacuum suction (collapsing boundary rings & inward particles)
          // Phase 2: Crisp electromagnetic pulse ring & minimalist electric discharge
          var empProg = castProg; // 0 to 1

          if (empProg < 0.62) {
            // -------------------------------------------------------------
            // PHASE 1: SUBTLE VACUUM SUCTION (Pulls surroundings inward)
            // -------------------------------------------------------------
            var sPhase = empProg / 0.62; // 0 to 1

            // 1. Two delicate contracting vacuum horizon rings
            ctx.save();
            ctx.setLineDash([2 * scale, 3 * scale]);
            for (var hr = 0; hr < 2; hr++) {
              var hCycle = (sPhase * 1.4 + hr * 0.5) % 1.0;
              var rHoriz = (24 * Math.pow(1 - hCycle, 1.2) + 2.5) * scale;
              var hAlpha = Math.sin(hCycle * Math.PI) * 0.50;

              ctx.strokeStyle = 'rgba(168, 85, 247, ' + hAlpha + ')';
              ctx.lineWidth = 0.9 * scale;
              ctx.beginPath();
              ctx.arc(cx, spellCastY, rHoriz, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.restore();

            // 2. Six subtle ambient particles accelerating inward into the core
            for (var p = 0; p < 6; p++) {
              var pInitDist = (16 + ((p * 5) % 10)) * scale;
              var pAng = p * (Math.PI * 2 / 6) - sPhase * 1.5;
              var pDist = pInitDist * Math.pow(Math.max(0, 1 - sPhase), 1.5);
              var px = cx + Math.cos(pAng) * pDist;
              var py = spellCastY + Math.sin(pAng) * pDist;

              // Subtle inward motion tail
              var tailLen = Math.min(3.5 * scale, (pInitDist - pDist) * 0.2);
              var tailAng = pAng + 0.25;
              ctx.strokeStyle = 'rgba(192, 132, 252, ' + (0.25 + 0.30 * sPhase) + ')';
              ctx.lineWidth = 0.8 * scale;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px + Math.cos(tailAng) * tailLen, py + Math.sin(tailAng) * tailLen);
              ctx.stroke();

              // Clean particle pip
              ctx.fillStyle = (p % 2 === 0) ? '#ffffff' : '#c084fc';
              ctx.beginPath();
              ctx.arc(px, py, 1.0 * scale, 0, Math.PI * 2);
              ctx.fill();
            }

            // 3. Compact pulsing Singularity Core
            var coreR = (2.2 + sPhase * 1.0) * scale;
            ctx.fillStyle = 'rgba(168, 85, 247, ' + (0.18 + 0.20 * sPhase) + ')';
            ctx.beginPath();
            ctx.arc(cx, spellCastY, coreR * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(cx, spellCastY, coreR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, spellCastY, 1.0 * scale, 0, Math.PI * 2);
            ctx.fill();

          } else {
            // -------------------------------------------------------------
            // PHASE 2: CRISP ELECTROMAGNETIC PULSE & DISCHARGE
            // -------------------------------------------------------------
            var dPhase = (empProg - 0.62) / 0.38; // 0 to 1
            var dAlpha = Math.max(0, 1.0 - Math.pow(dPhase, 1.3));

            // 1. Single sleek expanding electromagnetic pulse ring
            var shockR = (3.0 + Math.pow(dPhase, 0.7) * 22.0) * scale;
            ctx.strokeStyle = 'rgba(168, 85, 247, ' + (dAlpha * 0.75) + ')';
            ctx.lineWidth = 1.2 * scale;
            ctx.beginPath();
            ctx.arc(cx, spellCastY, shockR, 0, Math.PI * 2);
            ctx.stroke();

            // 2. Four crisp, clean single-fold lightning arcs
            var boltReach = Math.min(1.0, dPhase / 0.35);
            for (var b = 0; b < 4; b++) {
              var bAng = b * (Math.PI * 0.5) + 0.25;
              var bLen = 14 * scale * boltReach;
              var sign = (b % 2 === 0) ? 1 : -1;

              var b0x = cx, b0y = spellCastY;
              var b1x = cx + Math.cos(bAng) * (bLen * 0.5) + Math.cos(bAng + Math.PI * 0.5) * (2.0 * scale * sign);
              var b1y = spellCastY + Math.sin(bAng) * (bLen * 0.5) + Math.sin(bAng + Math.PI * 0.5) * (2.0 * scale * sign);
              var b2x = cx + Math.cos(bAng) * bLen;
              var b2y = spellCastY + Math.sin(bAng) * bLen;

              ctx.strokeStyle = 'rgba(192, 132, 252, ' + (dAlpha * 0.60) + ')';
              ctx.lineWidth = 1.1 * scale;
              ctx.beginPath();
              ctx.moveTo(b0x, b0y); ctx.lineTo(b1x, b1y); ctx.lineTo(b2x, b2y);
              ctx.stroke();

              ctx.strokeStyle = 'rgba(255, 255, 255, ' + (dAlpha * 0.85) + ')';
              ctx.lineWidth = 0.7 * scale;
              ctx.beginPath();
              ctx.moveTo(b0x, b0y); ctx.lineTo(b1x, b1y); ctx.lineTo(b2x, b2y);
              ctx.stroke();
            }

            // 3. Four subtle sparks drifting outward
            for (var sp = 0; sp < 4; sp++) {
              var spAng = sp * (Math.PI * 0.5) + 0.65;
              var spDist = (4.0 + dPhase * 18.0) * scale;
              ctx.fillStyle = 'rgba(192, 132, 252, ' + (dAlpha * 0.65) + ')';
              ctx.beginPath();
              ctx.arc(cx + Math.cos(spAng) * spDist, spellCastY + Math.sin(spAng) * spDist, 0.9 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      ctx.restore();
    }

    // 9. Smooth Floating Dots (Google 4-color pattern + Grey dots, serene linear drift, NO lines, gentle mouse deflection)
    function drawFloatingDots() {
      ctx.save();

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];

        if (!prefersReducedMotion) {
          // Smooth steady linear float
          d.x += d.vx;
          d.y += d.vy;

          // Gentle mouse avoidance deflection (no lines drawn)
          if (mouse.x !== null && mouse.y !== null) {
            var mdx = d.x - mouse.x;
            var mdy = d.y - mouse.y;
            var mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < mouse.radius && mdist > 1) {
              var force = (1 - mdist / mouse.radius) * 0.45;
              d.x += (mdx / mdist) * force;
              d.y += (mdy / mdist) * force;
            }
          }

          // Soft boundary bounce
          if (d.x < 15) { d.x = 15; d.vx = Math.abs(d.vx); }
          else if (d.x > width - 15) { d.x = width - 15; d.vx = -Math.abs(d.vx); }
          if (d.y < 15) { d.y = 15; d.vy = Math.abs(d.vy); }
          else if (d.y > height - 15) { d.y = height - 15; d.vy = -Math.abs(d.vy); }
        }

        // Draw clean floating dot (Google colors, NO lines)
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Cubic Bézier calculation helper
    function getBezierPoint(t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
      var mt = 1 - t;
      var mt2 = mt * mt;
      var mt3 = mt2 * mt;
      var t2 = t * t;
      var t3 = t2 * t;

      return {
        x: mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x,
        y: mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y
      };
    }

    /* --------------------------------------------------------------------------
       MAIN ANIMATION LOOP
       -------------------------------------------------------------------------- */
    function animate(timestamp) {
      if (!isVisible) return;

      if (!lastTimestamp) lastTimestamp = timestamp;
      var elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Clear canvas to pristine pure white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Organic placements: asymmetrical layout with ~25% tucking under frosted panel edges
      var placements = getMotifPlacements(timestamp);

      // 1. Base Mathematical Coordinate Matrix Grid
      drawCoordinateGrid();

      // 2. 2D Random Field on a Grid with 2 Peaks (RFT) - Partially tucks under sidebar
      drawRFT2DGridMotif(timestamp, placements.rft);

      // 3. AV Autonomously Yielding to Aggressive Cut-in Car - Fast reaction, no trailing box
      drawAVYieldingMotif(timestamp, placements.av);

      // 4. Motorsport Circuit Apex & F1 Telemetry - Red/white rumble kerbs, optimal racing line, speed & brake/throttle telemetry
      drawMotorsportTelemetryMotif(timestamp, placements.f1);

      // 5. Longitudinal Linear Random Effects Spaghetti Plot - 2 colors (Treatment vs Control)
      drawLongitudinalSpaghettiMotif(timestamp, placements.long);

      // 6. Experiment Design & Causal Inference - Randomization Pipeline, Causal DAG, Potential Outcomes, ATE
      drawCausalInferenceMotif(timestamp, placements.causal);

      // 7. Google Web Search & Ranking Graph - Web search capsule, crawl graph, SERP
      drawGoogleSearchMotif(timestamp, placements.search);

      // 8. Dota 2 Invoker - Three Elemental Orbs & Invoked Skills (Mid-Left Flank)
      drawInvokerMotif(timestamp, placements.invoker);

      // 9. Smooth Floating Dots - Google colors + Grey dots (pure minimal aesthetics)
      drawFloatingDots();

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(animate);
      }
    }

    // Initial kickoff
    animationId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
