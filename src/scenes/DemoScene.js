/**
 * DemoScene - Interactive Showcase of Godot 4 Juice & UI Kit in Phaser 3
 * Ported from Godot 4 scenes/demo.tscn & scripts/demo.gd
 */
import Phaser from 'phaser';
import { Juice } from '../core/Juice.js';
import { JuicePalette } from '../ui/JuicePalette.js';
import { JuiceButton } from '../ui/JuiceButton.js';
import { JuiceBar } from '../ui/JuiceBar.js';
import { JuiceCounter } from '../ui/JuiceCounter.js';
import { ToastLayer } from '../ui/ToastLayer.js';
import { JuiceMenu } from '../ui/JuiceMenu.js';
import { JuiceTooltip } from '../ui/JuiceTooltip.js';
import { JuiceTween } from '../core/JuiceTween.js';

export class DemoScene extends Phaser.Scene {
  constructor() {
    super('DemoScene');
  }

  create() {
    // 1. Initialize Juice Engine Singleton
    this.juice = Juice.init(this);
    this.cameras.main.setBackgroundColor('#0f0f1b');

    // 2. Add Ambient Animated Background Grid & Particles
    this.createBackgroundGrid();

    // 3. Create UI Layers
    this.toastLayer = new ToastLayer(this);
    this.juice.setToastLayer(this.toastLayer);

    this.tooltip = new JuiceTooltip(this);

    // 4. Create Modal Dialog (Hidden initially)
    this.modalMenu = new JuiceMenu(this, {
      title: 'JUICE MODAL DIALOG',
      message: 'This modal demonstrates smooth backdrop dimming, Back.easeOut pop-in scaling, and tactile button controls.',
      onConfirm: () => {
        this.juice.toast('Action Confirmed', 'Modal confirmed successfully!', 'success');
      }
    });

    // 5. Build Demo Layout & Sections
    this.buildHeader();
    this.buildLeftColumn();
    this.buildCenterColumn();
    this.buildRightColumn();
    this.buildAudioAndSfxControls();

    // 6. Spawn initial welcoming toast
    this.time.delayedCall(400, () => {
      this.juice.toast('Juice Kit Loaded', 'Phaser 3 ES6 + Vite UI port is ready!', 'success', 3500);
    });

    // 7. Handle resize responsiveness
    this.scale.on('resize', this.onResize, this);

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  createBackgroundGrid() {
    const { width, height } = this.scale;

    // Ambient radial glow in center
    const ambientGlow = this.add.image(width / 2, height / 2, 'glow_wide');
    ambientGlow.setDisplaySize(width * 1.2, height * 1.2);
    ambientGlow.setTint(0x1a1a3a);
    ambientGlow.setAlpha(0.4);
    ambientGlow.setDepth(-10);

    // Subtle grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1f1f38, 0.4);
    for (let x = 0; x < width; x += 40) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      grid.lineBetween(0, y, width, y);
    }
    grid.setDepth(-9);

    // Floating background decorative particles
    for (let i = 0; i < 15; i++) {
      const tex = Phaser.Math.RND.pick(['spark', 'star', 'diamond', 'shard']);
      const p = this.add.image(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(20, height - 20),
        tex
      );
      p.setDisplaySize(Phaser.Math.Between(10, 20), Phaser.Math.Between(10, 20));
      p.setAlpha(Phaser.Math.FloatBetween(0.1, 0.25));
      p.setTint(Phaser.Math.RND.pick([0xe94560, 0x4361ee, 0xf7b731, 0x06d6a0]));
      p.setDepth(-8);

      JuiceTween.floatIdle(this, p, {
        distance: Phaser.Math.Between(6, 14),
        duration: Phaser.Math.Between(2500, 4500)
      });
    }
  }

  buildHeader() {
    const { width } = this.scale;

    // Header container
    const header = this.add.container(width / 2, 38);
    header.setDepth(100);

    const title = this.add.text(0, -10, '⚡ GEMSLOOT JUICE UI KIT', {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 3, color: '#e94560', blur: 10, fill: true, stroke: true }
    });
    title.setOrigin(0.5, 0.5);
    header.add(title);

    const subtitle = this.add.text(0, 16, 'Godot 4 "Juice" & Tactile UI Library Ported to Phaser 3 (ES6 + Vite)', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#a4b0be'
    });
    subtitle.setOrigin(0.5, 0.5);
    header.add(subtitle);

    // Quick Action Bar: CRT Toggle, Modal Button, Mute Toggle
    const crtBtn = new JuiceButton(this, width - 250, 36, 'CRT SHADER: OFF', {
      width: 140,
      height: 32,
      theme: 'surface',
      fontSize: '10px',
      onClick: (btn) => {
        const isEnabled = this.juice && this.juice.screenFX ? this.juice.screenFX.toggleCRT() : false;
        btn.setText(isEnabled ? 'CRT SHADER: ON' : 'CRT SHADER: OFF');
        this.juice.toast('Shader Mode', `CRT Post-Processing ${isEnabled ? 'Enabled' : 'Disabled'}`, isEnabled ? 'info' : 'warning');
      }
    });

    const modalBtn = new JuiceButton(this, width - 90, 36, 'OPEN DIALOG', {
      width: 130,
      height: 32,
      theme: 'accent',
      fontSize: '10px',
      onClick: () => {
        this.modalMenu.open();
      }
    });
  }

  buildLeftColumn() {
    const startX = 140;
    let currY = 95;

    // Card 1: Camera Shake & Trauma
    this.createPanelBackground(startX, currY + 65, 230, 155, 'SCREEN SHAKE / TRAUMA');

    new JuiceButton(this, startX, currY + 20, 'LIGHT SHAKE', {
      width: 200,
      height: 34,
      theme: 'secondary',
      fontSize: '11px',
      onClick: () => {
        this.juice.shake('light');
        this.juice.playSFX('hit_light');
      }
    });

    new JuiceButton(this, startX, currY + 60, 'MEDIUM SHAKE', {
      width: 200,
      height: 34,
      theme: 'primary',
      fontSize: '11px',
      onClick: () => {
        this.juice.shake('medium');
        this.juice.playSFX('hit_heavy');
      }
    });

    new JuiceButton(this, startX, currY + 100, 'HEAVY SHAKE + TRAUMA', {
      width: 200,
      height: 34,
      theme: 'danger',
      fontSize: '11px',
      onClick: () => {
        this.juice.shake('heavy');
        this.juice.playSFX('explode');
      }
    });

    currY += 165;

    // Card 2: Time Manipulation (Hit-Stop & Slow-Mo)
    this.createPanelBackground(startX, currY + 75, 230, 175, 'TIME / HIT-STOP');

    new JuiceButton(this, startX, currY + 20, 'HIT-STOP (80ms)', {
      width: 200,
      height: 34,
      theme: 'accent',
      fontSize: '11px',
      onClick: () => {
        this.juice.hitStop(80);
        this.juice.shake(0.3);
        this.juice.playSFX('hit_heavy');
      }
    });

    new JuiceButton(this, startX, currY + 60, 'HEAVY FREEZE (160ms)', {
      width: 200,
      height: 34,
      theme: 'danger',
      fontSize: '11px',
      onClick: () => {
        this.juice.hitStop(160);
        this.juice.shake(0.6);
        this.juice.playSFX('explode');
      }
    });

    new JuiceButton(this, startX, currY + 100, 'SLOW-MOTION (1.2s)', {
      width: 200,
      height: 34,
      theme: 'secondary',
      fontSize: '11px',
      onClick: () => {
        this.juice.slowMotion(0.2, 1400);
        this.juice.playSFX('confirm', { rate: 0.6 });
        this.juice.toast('Bullet Time', 'Game speed slowed to 20%', 'info');
      }
    });

    new JuiceButton(this, startX, currY + 140, 'FULLSCREEN FLASH', {
      width: 200,
      height: 34,
      theme: 'surface',
      fontSize: '11px',
      onClick: () => {
        this.juice.screenFlash(0xffffff, 0.7, 300);
        this.juice.playSFX('confirm');
      }
    });
  }

  buildCenterColumn() {
    const { width } = this.scale;
    const centerX = width / 2;
    let currY = 95;

    // Card 1: Interactive Target Dummy & Combat Spawner
    this.createPanelBackground(centerX, currY + 115, 340, 255, 'COMBAT TARGET & DAMAGE TEXT');

    // Target Dummy Graphic / Character Box
    this.targetContainer = this.add.container(centerX, currY + 65);

    this.targetGlow = this.add.image(0, 0, 'glow_tight');
    this.targetGlow.setDisplaySize(120, 120);
    this.targetGlow.setTint(0xe94560);
    this.targetGlow.setAlpha(0.5);
    this.targetContainer.add(this.targetGlow);

    this.targetIcon = this.add.image(0, 0, 'hexagon');
    this.targetIcon.setDisplaySize(72, 72);
    this.targetIcon.setTint(0x1a1a2e);
    this.targetContainer.add(this.targetIcon);

    this.targetInner = this.add.image(0, 0, 'spark');
    this.targetInner.setDisplaySize(44, 44);
    this.targetInner.setTint(0xe94560);
    this.targetContainer.add(this.targetInner);

    this.targetContainer.setSize(80, 80);
    this.targetContainer.setInteractive(new Phaser.Geom.Rectangle(-40, -40, 80, 80), Phaser.Geom.Rectangle.Contains);

    // Click on target dummy triggers hit!
    this.targetContainer.on('pointerdown', () => {
      this.triggerDummyHit(false);
    });

    JuiceTween.floatIdle(this, this.targetContainer, { distance: 6, duration: 2400 });

    // Target Spawner Buttons
    new JuiceButton(this, centerX - 80, currY + 145, 'HIT (DAMAGE)', {
      width: 145,
      height: 34,
      theme: 'primary',
      fontSize: '11px',
      onClick: () => this.triggerDummyHit(false)
    });

    new JuiceButton(this, centerX + 80, currY + 145, 'CRIT HIT ★', {
      width: 145,
      height: 34,
      theme: 'accent',
      fontSize: '11px',
      onClick: () => this.triggerDummyHit(true)
    });

    new JuiceButton(this, centerX - 80, currY + 190, 'HEAL (+HP)', {
      width: 145,
      height: 34,
      theme: 'success',
      fontSize: '11px',
      onClick: () => {
        const amt = Phaser.Math.Between(25, 60);
        this.juice.damage(this.targetContainer.x, this.targetContainer.y - 15, amt, { isHeal: true });
        this.juice.playSFX('pickup');
        this.healthBar.heal(amt);
        JuiceTween.punchScale(this, this.targetContainer, { factor: 1.15, duration: 150 });
      }
    });

    new JuiceButton(this, centerX + 80, currY + 190, 'SHIELD (+DEF)', {
      width: 145,
      height: 34,
      theme: 'secondary',
      fontSize: '11px',
      onClick: () => {
        const amt = Phaser.Math.Between(15, 40);
        this.juice.damage(this.targetContainer.x, this.targetContainer.y - 15, amt, { isShield: true });
        this.juice.playSFX('confirm');
        this.shieldBar.heal(amt);
        JuiceTween.punchScale(this, this.targetContainer, { factor: 1.15, duration: 150 });
      }
    });

    currY += 260;

    // Card 2: Numeric Counters
    this.createPanelBackground(centerX, currY + 45, 340, 115, 'INTERPOLATING COUNTERS');

    this.coinCounter = new JuiceCounter(this, centerX - 80, currY + 25, 1250, {
      prefix: '🪙 ',
      fontSize: '18px',
      color: '#ffd166'
    });

    this.scoreCounter = new JuiceCounter(this, centerX + 80, currY + 25, 45800, {
      suffix: ' PTS',
      fontSize: '18px',
      color: '#4cc9f0'
    });

    new JuiceButton(this, centerX - 80, currY + 65, '+250 COINS', {
      width: 140,
      height: 30,
      theme: 'surface',
      fontSize: '10px',
      onClick: () => {
        this.coinCounter.add(250);
        this.juice.playSFX('pickup');
      }
    });

    new JuiceButton(this, centerX + 80, currY + 65, '+5,000 SCORE', {
      width: 140,
      height: 30,
      theme: 'surface',
      fontSize: '10px',
      onClick: () => {
        this.scoreCounter.add(5000);
        this.juice.playSFX('confirm');
      }
    });
  }

  buildRightColumn() {
    const { width } = this.scale;
    const rightX = width - 145;
    let currY = 95;

    // Card 1: Dual-Fill Progress Bars (Health, Mana, Shield)
    this.createPanelBackground(rightX, currY + 115, 250, 255, 'DUAL-FILL "GHOST" BARS');

    this.healthBar = new JuiceBar(this, rightX, currY + 22, {
      width: 220,
      height: 24,
      max: 100,
      value: 100,
      type: 'health',
      labelPrefix: 'HP'
    });

    this.manaBar = new JuiceBar(this, rightX, currY + 54, {
      width: 220,
      height: 24,
      max: 100,
      value: 80,
      type: 'mana',
      labelPrefix: 'MP'
    });

    this.shieldBar = new JuiceBar(this, rightX, currY + 86, {
      width: 220,
      height: 24,
      max: 100,
      value: 60,
      type: 'shield',
      labelPrefix: 'SHIELD'
    });

    new JuiceButton(this, rightX - 58, currY + 130, '-25 DMG', {
      width: 100,
      height: 32,
      theme: 'danger',
      fontSize: '10px',
      onClick: () => {
        this.healthBar.damage(25);
        this.manaBar.damage(15);
        this.shieldBar.damage(20);
        this.juice.shake('light');
        this.juice.playSFX('hit_light');
      }
    });

    new JuiceButton(this, rightX + 58, currY + 130, '+25 HEAL', {
      width: 100,
      height: 32,
      theme: 'success',
      fontSize: '10px',
      onClick: () => {
        this.healthBar.heal(25);
        this.manaBar.heal(20);
        this.shieldBar.heal(25);
        this.juice.playSFX('pickup');
      }
    });

    new JuiceButton(this, rightX, currY + 172, 'RESET ALL BARS (100%)', {
      width: 216,
      height: 32,
      theme: 'secondary',
      fontSize: '10px',
      onClick: () => {
        this.healthBar.setValue(100);
        this.manaBar.setValue(100);
        this.shieldBar.setValue(100);
        this.juice.playSFX('confirm');
      }
    });

    currY += 260;

    // Card 2: Toast Notifications Stack
    this.createPanelBackground(rightX, currY + 45, 250, 115, 'TOAST NOTIFICATION STACK');

    new JuiceButton(this, rightX - 58, currY + 20, 'SUCCESS TOAST', {
      width: 105,
      height: 30,
      theme: 'success',
      fontSize: '9px',
      onClick: () => {
        this.juice.toast('Level Up!', 'Player reached Level 42', 'success');
      }
    });

    new JuiceButton(this, rightX + 58, currY + 20, 'ERROR TOAST', {
      width: 105,
      height: 30,
      theme: 'danger',
      fontSize: '9px',
      onClick: () => {
        this.juice.toast('Insufficient Mana', 'Cannot cast Blizzard spell', 'error');
      }
    });

    new JuiceButton(this, rightX - 58, currY + 60, 'INFO TOAST', {
      width: 105,
      height: 30,
      theme: 'secondary',
      fontSize: '9px',
      onClick: () => {
        this.juice.toast('Inventory Saved', 'All 24 items synchronized', 'info');
      }
    });

    new JuiceButton(this, rightX + 58, currY + 60, 'WARNING TOAST', {
      width: 105,
      height: 30,
      theme: 'accent',
      fontSize: '9px',
      onClick: () => {
        this.juice.toast('Low Battery', 'Plug in device to prevent sleep', 'warning');
      }
    });
  }

  buildAudioAndSfxControls() {
    const { width, height } = this.scale;
    const footerY = height - 55;

    // Footer background tray
    const footerBg = this.add.graphics();
    footerBg.fillStyle(JuicePalette.surface, 0.95);
    footerBg.fillRoundedRect(20, footerY - 26, width - 40, 52, 10);
    footerBg.lineStyle(1.5, JuicePalette.surfaceBorder, 0.8);
    footerBg.strokeRoundedRect(20, footerY - 26, width - 40, 52, 10);

    const label = this.add.text(35, footerY, 'SFX BANKS:', {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '11px',
      color: JuicePalette.accentHex
    });
    label.setOrigin(0, 0.5);

    const sfxBanks = [
      { name: 'CLICK', key: 'click' },
      { name: 'CONFIRM', key: 'confirm' },
      { name: 'ERROR', key: 'error' },
      { name: 'EXPLODE', key: 'explode' },
      { name: 'FOOTSTEP', key: 'footstep' },
      { name: 'HIT HEAVY', key: 'hit_heavy' },
      { name: 'HIT LIGHT', key: 'hit_light' },
      { name: 'HIT METAL', key: 'hit_metal' },
      { name: 'PICKUP', key: 'pickup' }
    ];

    const btnWidth = Math.min(105, (width - 180) / sfxBanks.length);
    let startX = 140 + btnWidth / 2;

    sfxBanks.forEach((sfx) => {
      new JuiceButton(this, startX, footerY, sfx.name, {
        width: btnWidth - 6,
        height: 30,
        theme: 'surface',
        fontSize: '9px',
        onClick: () => {
          this.juice.playSFX(sfx.key);
          JuiceTween.punchScale(this, label, { factor: 1.15, duration: 120 });
        }
      });
      startX += btnWidth;
    });
  }

  triggerDummyHit(isCrit = false) {
    const damage = isCrit ? Phaser.Math.Between(120, 240) : Phaser.Math.Between(25, 65);

    // 1. Damage Number
    this.juice.damage(this.targetContainer.x, this.targetContainer.y - 10, damage, { isCrit });

    // 2. Hit Flash
    this.juice.hitFlash(this.targetInner, isCrit ? 160 : 100, isCrit ? 0xffd166 : 0xffffff);

    // 3. Screen Shake & Hit Stop
    if (isCrit) {
      this.juice.shake('heavy');
      this.juice.hitStop(120);
      this.juice.playSFX('explode');
      JuiceTween.wobble(this, this.targetContainer, { angle: 18, duration: 300 });
      JuiceTween.squish(this, this.targetContainer, { squishX: 1.35, squishY: 0.7, duration: 220 });
    } else {
      this.juice.shake('light');
      this.juice.hitStop(50);
      this.juice.playSFX('hit_heavy');
      JuiceTween.squish(this, this.targetContainer, { squishX: 1.18, squishY: 0.85, duration: 160 });
    }

    // 4. Update Bars & Counters
    this.healthBar.damage(damage * 0.35);
    this.scoreCounter.add(damage * 10);
  }

  createPanelBackground(centerX, centerY, width, height, title) {
    const panel = this.add.graphics();
    const halfW = width / 2;
    const halfH = height / 2;

    // Drop shadow
    panel.fillStyle(0x000000, 0.4);
    panel.fillRoundedRect(centerX - halfW, centerY - halfH + 4, width, height, 10);

    // Surface
    panel.fillStyle(JuicePalette.surface, 0.9);
    panel.fillRoundedRect(centerX - halfW, centerY - halfH, width, height, 10);
    panel.lineStyle(1.5, JuicePalette.surfaceBorder, 0.8);
    panel.strokeRoundedRect(centerX - halfW, centerY - halfH, width, height, 10);

    // Title tag
    const titleText = this.add.text(centerX, centerY - halfH + 10, title, {
      fontFamily: 'Bungee, sans-serif',
      fontSize: '10px',
      color: JuicePalette.textDimHex
    });
    titleText.setOrigin(0.5, 0.5);
  }

  onResize(gameSize) {
    // Refresh camera viewport on resize
    this.cameras.main.setSize(gameSize.width, gameSize.height);
  }
}

export default DemoScene;
