/**
 * Dota 2 Invoker Spell Simulator
 * Pure JS interactive simulator for practicing Invoker's 10 skills
 */
(function() {
  'use strict';

  var INVOKER_SPELLS = [
    {
      id: 'cold_snap',
      name: 'Cold Snap',
      reagents: { q: 3, w: 0, e: 0 },
      formula: 'Q · Q · Q',
      desc: 'Freezes the target, dealing damage and stunning whenever attacked.',
      color: '#0284c7',
      icon: '/images/invoker/invoker_cold_snap.png'
    },
    {
      id: 'ghost_walk',
      name: 'Ghost Walk',
      reagents: { q: 2, w: 1, e: 0 },
      formula: 'Q · Q · W',
      desc: 'Manipulates ice and electric energy to turn invisible, slowing nearby enemies.',
      color: '#3b82f6',
      icon: '/images/invoker/invoker_ghost_walk.png'
    },
    {
      id: 'ice_wall',
      name: 'Ice Wall',
      reagents: { q: 2, w: 0, e: 1 },
      formula: 'Q · Q · E',
      desc: 'Generates a frigid barrier of ice that heavily slows and chills enemies.',
      color: '#0ea5e9',
      icon: '/images/invoker/invoker_ice_wall.png'
    },
    {
      id: 'emp',
      name: 'EMP',
      reagents: { q: 0, w: 3, e: 0 },
      formula: 'W · W · W',
      desc: 'Charges an electromagnetic vortex that detonates, draining mana and dealing damage.',
      color: '#9333ea',
      icon: '/images/invoker/invoker_emp.png'
    },
    {
      id: 'tornado',
      name: 'Tornado',
      reagents: { q: 1, w: 2, e: 0 },
      formula: 'W · W · Q',
      desc: 'Unleashes a rushing cyclone that lifts enemy units into the air and purges buffs.',
      color: '#8b5cf6',
      icon: '/images/invoker/invoker_tornado.png'
    },
    {
      id: 'alacrity',
      name: 'Alacrity',
      reagents: { q: 0, w: 2, e: 1 },
      formula: 'W · W · E',
      desc: 'Infuses an ally or Invoker with immense combat focus, granting bonus attack speed and damage.',
      color: '#d946ef',
      icon: '/images/invoker/invoker_alacrity.png'
    },
    {
      id: 'sun_strike',
      name: 'Sun Strike',
      reagents: { q: 0, w: 0, e: 3 },
      formula: 'E · E · E',
      desc: 'Directs solar rays to incinerate a target area anywhere on the map after a brief delay.',
      color: '#ea580c',
      icon: '/images/invoker/invoker_sun_strike.png'
    },
    {
      id: 'forge_spirit',
      name: 'Forge Spirit',
      reagents: { q: 1, w: 0, e: 2 },
      formula: 'E · E · Q',
      desc: 'Summons an elemental warrior forged from fire and ice whose scorching attacks melt armor.',
      color: '#f97316',
      icon: '/images/invoker/invoker_forge_spirit.png'
    },
    {
      id: 'chaos_meteor',
      name: 'Chaos Meteor',
      reagents: { q: 0, w: 1, e: 2 },
      formula: 'E · E · W',
      desc: 'Pulls a massive flaming meteor down from the heavens that rolls forward, searing enemies.',
      color: '#dc2626',
      icon: '/images/invoker/invoker_chaos_meteor.png'
    },
    {
      id: 'deafening_blast',
      name: 'Deafening Blast',
      reagents: { q: 1, w: 1, e: 1 },
      formula: 'Q · W · E',
      desc: 'Projects a mighty sonic shockwave that knocks back enemies, disarms them, and deals damage.',
      color: '#ca8a04',
      icon: '/images/invoker/invoker_deafening_blast.png'
    }
  ];

  var ORB_IMAGES = {
    Q: '/images/invoker/invoker_quas.png',
    W: '/images/invoker/invoker_wex.png',
    E: '/images/invoker/invoker_exort.png'
  };

  var state = {
    currentSpell: null,
    activeOrbs: ['Q', 'W', 'E'],
    score: 0,
    streak: 0,
    bestStreak: 0,
    attempts: 0,
    fastestCast: null,
    mode: 'casual', // 'casual' or 'sprint'
    sprintTimeLeft: 30,
    sprintTimerId: null,
    isSprintRunning: false,
    showGuide: false,
    castStartTime: Date.now(),
    castTimes: []
  };

  function highlightButton(btnId) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.add('key-pressed');
    setTimeout(function() {
      btn.classList.remove('key-pressed');
    }, 120);
  }

  function addOrb(orbType) {
    var overlay = document.getElementById('invokerResultsOverlay');
    if (overlay && overlay.style.display === 'flex') return;

    if (state.mode === 'sprint' && !state.isSprintRunning && state.sprintTimeLeft === 30) {
      startSprintTimer();
    }
    state.activeOrbs.push(orbType);
    if (state.activeOrbs.length > 3) {
      state.activeOrbs.shift();
    }
    updateOrbTrayDisplay();
    highlightButton('btn' + orbType);
  }

  function updateOrbTrayDisplay() {
    for (var i = 0; i < 3; i++) {
      var slot = document.getElementById('orbSlot' + i);
      if (!slot) continue;
      var orb = state.activeOrbs[i];
      slot.className = 'orb-slot';
      if (orb && ORB_IMAGES[orb]) {
        slot.classList.add('has-orb', 'orb-' + orb.toLowerCase());
        slot.innerHTML = '<img src="' + ORB_IMAGES[orb] + '" class="tray-orb-img" alt="' + orb + '">';
      } else {
        slot.innerHTML = '<span class="orb-empty-pip"></span>';
      }
    }
  }

  function updateStatsDisplay() {
    var streakEl = document.getElementById('invokerStreak');
    var bestEl = document.getElementById('invokerBest');
    var speedEl = document.getElementById('invokerSpeed');
    var timerEl = document.getElementById('invokerTimer');

    if (streakEl) streakEl.textContent = state.streak;
    if (bestEl) bestEl.textContent = state.bestStreak;

    if (speedEl) {
      if (state.castTimes.length > 0) {
        var sum = 0;
        var recent = state.castTimes.slice(-5);
        for (var i = 0; i < recent.length; i++) sum += recent[i];
        var avg = sum / recent.length;
        speedEl.textContent = avg.toFixed(2) + 's';
      } else {
        speedEl.textContent = '--';
      }
    }

    if (timerEl) {
      if (state.mode === 'sprint') {
        timerEl.style.display = 'inline-flex';
        var tVal = document.getElementById('invokerTimerVal');
        if (tVal) tVal.textContent = state.sprintTimeLeft + 's';
      } else {
        timerEl.style.display = 'none';
      }
    }
  }

  function renderTargetSpell() {
    if (!state.currentSpell) return;
    var nameEl = document.getElementById('targetSpellName');
    var descEl = document.getElementById('targetSpellDesc');
    var imgEl = document.getElementById('targetSpellImg');
    var hintEl = document.getElementById('targetSpellHint');

    if (nameEl) nameEl.textContent = state.currentSpell.name;
    if (descEl) descEl.textContent = state.currentSpell.desc;
    if (imgEl) {
      imgEl.src = state.currentSpell.icon;
      imgEl.alt = state.currentSpell.name;
    }
    if (hintEl) {
      var formulaHtml = '';
      var letters = state.currentSpell.formula.split(' · ');
      for (var i = 0; i < letters.length; i++) {
        var letChar = letters[i].trim();
        var orbImg = ORB_IMAGES[letChar];
        formulaHtml += '<span class="hint-orb-item"><img src="' + orbImg + '" class="hint-orb-img" alt="' + letChar + '"> ' + letChar + '</span>' + (i < letters.length - 1 ? ' <span class="hint-sep">·</span> ' : '');
      }
      hintEl.innerHTML = formulaHtml;
    }
  }

  function pickNextSpell() {
    var pool = INVOKER_SPELLS.filter(function(s) {
      return !state.currentSpell || s.id !== state.currentSpell.id;
    });
    var next = pool[Math.floor(Math.random() * pool.length)];
    state.currentSpell = next;
    state.castStartTime = Date.now();
    renderTargetSpell();
  }

  function invokeSpell() {
    var overlay = document.getElementById('invokerResultsOverlay');
    if (overlay && overlay.style.display === 'flex') return;

    highlightButton('btnR');

    if (state.mode === 'sprint') {
      if (!state.isSprintRunning && state.sprintTimeLeft === 30) {
        startSprintTimer();
      }
      state.attempts++;
    }

    var counts = { q: 0, w: 0, e: 0 };
    for (var i = 0; i < state.activeOrbs.length; i++) {
      var o = state.activeOrbs[i];
      if (o === 'Q') counts.q++;
      else if (o === 'W') counts.w++;
      else if (o === 'E') counts.e++;
    }

    var matched = null;
    for (var j = 0; j < INVOKER_SPELLS.length; j++) {
      var sp = INVOKER_SPELLS[j];
      if (sp.reagents.q === counts.q && sp.reagents.w === counts.w && sp.reagents.e === counts.e) {
        matched = sp;
        break;
      }
    }

    var card = document.getElementById('invokerCard');
    var feedback = document.getElementById('invokerFeedback');

    if (matched && matched.id === state.currentSpell.id) {
      // SUCCESS!
      var castTime = (Date.now() - state.castStartTime) / 1000;
      state.castTimes.push(castTime);
      if (!state.fastestCast || castTime < state.fastestCast) {
        state.fastestCast = castTime;
      }

      state.score++;
      state.streak++;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
      }

      if (card) {
        card.classList.remove('invoke-error-shake');
        card.classList.add('invoke-success-glow');
        setTimeout(function() {
          card.classList.remove('invoke-success-glow');
        }, 450);
      }

      if (feedback) {
        feedback.className = 'invoker-feedback-banner feedback-success';
        feedback.textContent = '✨ ' + matched.name + ' Invoked! (' + castTime.toFixed(2) + 's) +1';
      }

      updateStatsDisplay();

      setTimeout(function() {
        if (state.mode !== 'sprint' || state.isSprintRunning) {
          pickNextSpell();
        }
      }, 350);

    } else {
      // WRONG COMBINATION
      state.streak = 0;

      if (card) {
        card.classList.remove('invoke-success-glow');
        card.classList.add('invoke-error-shake');
        setTimeout(function() {
          card.classList.remove('invoke-error-shake');
        }, 420);
      }

      if (feedback) {
        feedback.className = 'invoker-feedback-banner feedback-error';
        if (matched) {
          feedback.textContent = '❌ Cast ' + matched.name + ' (' + matched.formula + '). Wanted ' + state.currentSpell.name + ' (' + state.currentSpell.formula + ')';
        } else {
          feedback.textContent = '❌ Incomplete combination! Target: ' + state.currentSpell.name + ' (' + state.currentSpell.formula + ')';
        }
      }

      updateStatsDisplay();
    }
  }

  function startSprintTimer() {
    if (state.sprintTimerId) clearInterval(state.sprintTimerId);
    state.isSprintRunning = true;
    state.sprintTimeLeft = 30;
    updateStatsDisplay();

    state.sprintTimerId = setInterval(function() {
      state.sprintTimeLeft--;
      updateStatsDisplay();
      if (state.sprintTimeLeft <= 0) {
        clearInterval(state.sprintTimerId);
        state.sprintTimerId = null;
        state.isSprintRunning = false;
        endSprint();
      }
    }, 1000);
  }

  function endSprint() {
    var overlay = document.getElementById('invokerResultsOverlay');
    var resScore = document.getElementById('resScore');
    var resStreak = document.getElementById('resStreak');
    var resSpeed = document.getElementById('resSpeed');
    var resAccuracy = document.getElementById('resAccuracy');
    var resFastest = document.getElementById('resFastest');
    var resAttempts = document.getElementById('resAttempts');
    var resRank = document.getElementById('resRank');

    var attempts = Math.max(state.score, state.attempts);
    var accuracy = attempts > 0 ? Math.round((state.score / attempts) * 100) : 0;

    var avgSpeed = '--';
    if (state.castTimes.length > 0) {
      var sum = 0;
      for (var i = 0; i < state.castTimes.length; i++) sum += state.castTimes[i];
      avgSpeed = (sum / state.castTimes.length).toFixed(2) + 's';
    }

    var fastest = state.fastestCast ? state.fastestCast.toFixed(2) + 's' : '--';

    var rank = 'Apprentice Wizard';
    if (state.score >= 20) {
      rank = '👑 The Arsenal God';
    } else if (state.score >= 15) {
      rank = '⚡ Grand Magus';
    } else if (state.score >= 10) {
      rank = '🔥 Arsenal Master';
    } else if (state.score >= 5) {
      rank = '✨ Adept Magus';
    }

    if (resScore) resScore.textContent = state.score;
    if (resStreak) resStreak.textContent = state.bestStreak;
    if (resSpeed) resSpeed.textContent = avgSpeed;
    if (resAccuracy) resAccuracy.textContent = accuracy + '%';
    if (resFastest) resFastest.textContent = fastest;
    if (resAttempts) resAttempts.textContent = attempts;
    if (resRank) resRank.textContent = rank;

    if (overlay) overlay.style.display = 'flex';

    var feedback = document.getElementById('invokerFeedback');
    if (feedback) {
      feedback.className = 'invoker-feedback-banner feedback-neutral';
      feedback.innerHTML = '🏁 Time up! Final Score: <strong>' + state.score + '</strong> | Rank: <strong>' + rank + '</strong>';
    }
  }

  function startSprintRound() {
    var overlay = document.getElementById('invokerResultsOverlay');
    if (overlay) overlay.style.display = 'none';

    state.mode = 'sprint';
    var modeBtn = document.getElementById('btnToggleMode');
    if (modeBtn) {
      modeBtn.textContent = '⏱️ 30s Sprint';
      modeBtn.classList.add('is-active');
    }

    resetGame();
    startSprintTimer();
  }

  function switchToCasual() {
    var overlay = document.getElementById('invokerResultsOverlay');
    if (overlay) overlay.style.display = 'none';

    state.mode = 'casual';
    var modeBtn = document.getElementById('btnToggleMode');
    if (modeBtn) {
      modeBtn.textContent = '🎯 Casual';
      modeBtn.classList.remove('is-active');
    }

    resetGame();
  }

  function resetGame() {
    if (state.sprintTimerId) {
      clearInterval(state.sprintTimerId);
      state.sprintTimerId = null;
    }
    state.isSprintRunning = false;
    state.sprintTimeLeft = 30;
    state.score = 0;
    state.streak = 0;
    state.attempts = 0;
    state.fastestCast = null;
    state.castTimes = [];

    var overlay = document.getElementById('invokerResultsOverlay');
    if (overlay) overlay.style.display = 'none';

    var feedback = document.getElementById('invokerFeedback');
    if (feedback) {
      feedback.className = 'invoker-feedback-banner feedback-neutral';
      feedback.innerHTML = 'Ready! Click buttons or press&nbsp;<kbd>Q</kbd>,&nbsp; <kbd>W</kbd>,&nbsp; <kbd>E</kbd>,&nbsp; <kbd>R</kbd>&nbsp; on your keyboard.';
    }
    updateStatsDisplay();
    pickNextSpell();
  }

  function buildCheatSheet() {
    var grid = document.getElementById('invokerGuideGrid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < INVOKER_SPELLS.length; i++) {
      var sp = INVOKER_SPELLS[i];
      var dots = '';
      var orbs = sp.formula.split(' · ');
      for (var k = 0; k < orbs.length; k++) {
        var o = orbs[k].trim();
        var orbImg = ORB_IMAGES[o];
        dots += '<img src="' + orbImg + '" class="guide-orb-thumb" alt="' + o + '">';
      }
      html += '<div class="guide-spell-pill">' +
                '<img src="' + sp.icon + '" class="guide-spell-thumb" alt="' + sp.name + '">' +
                '<div class="guide-spell-info">' +
                  '<span class="g-name">' + sp.name + '</span>' +
                  '<div class="g-formula">' + dots + '<small>' + sp.formula + '</small></div>' +
                '</div>' +
              '</div>';
    }
    grid.innerHTML = html;
  }

  function init() {
    var card = document.getElementById('invokerCard');
    if (!card) return;

    var btnQ = document.getElementById('btnQ');
    var btnW = document.getElementById('btnW');
    var btnE = document.getElementById('btnE');
    var btnR = document.getElementById('btnR');

    if (btnQ) btnQ.addEventListener('click', function() { addOrb('Q'); });
    if (btnW) btnW.addEventListener('click', function() { addOrb('W'); });
    if (btnE) btnE.addEventListener('click', function() { addOrb('E'); });
    if (btnR) btnR.addEventListener('click', function() { invokeSpell(); });

    var modeBtn = document.getElementById('btnToggleMode');
    if (modeBtn) {
      modeBtn.addEventListener('click', function() {
        if (state.mode === 'casual') {
          state.mode = 'sprint';
          modeBtn.textContent = '⏱️ 30s Sprint';
          modeBtn.classList.add('is-active');
        } else {
          state.mode = 'casual';
          modeBtn.textContent = '🎯 Casual';
          modeBtn.classList.remove('is-active');
        }
        resetGame();
      });
    }

    var guideBtn = document.getElementById('btnToggleGuide');
    var guidePanel = document.getElementById('invokerGuidePanel');
    if (guideBtn && guidePanel) {
      guideBtn.addEventListener('click', function() {
        state.showGuide = !state.showGuide;
        guidePanel.style.display = state.showGuide ? 'block' : 'none';
        guideBtn.classList.toggle('is-active', state.showGuide);
      });
    }

    var resetBtn = document.getElementById('btnResetTrainer');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetGame);
    }

    var btnPlayAgain = document.getElementById('btnPlayAgain');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', startSprintRound);
    }

    var btnCloseResults = document.getElementById('btnCloseResults');
    if (btnCloseResults) {
      btnCloseResults.addEventListener('click', switchToCasual);
    }

    window.addEventListener('keydown', function(e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(tag) !== -1 || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }

      var overlay = document.getElementById('invokerResultsOverlay');
      var isResultsVisible = overlay && overlay.style.display === 'flex';

      if (isResultsVisible) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startSprintRound();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          switchToCasual();
        }
        return;
      }

      var key = e.key.toUpperCase();
      if (key === 'Q') {
        e.preventDefault();
        addOrb('Q');
      } else if (key === 'W') {
        e.preventDefault();
        addOrb('W');
      } else if (key === 'E') {
        e.preventDefault();
        addOrb('E');
      } else if (key === 'R') {
        e.preventDefault();
        invokeSpell();
      } else if (key === ' ' && state.mode === 'sprint' && !state.isSprintRunning) {
        e.preventDefault();
        startSprintRound();
      }
    });

    buildCheatSheet();
    updateOrbTrayDisplay();
    updateStatsDisplay();
    pickNextSpell();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
