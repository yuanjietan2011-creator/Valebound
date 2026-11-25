import { GRID_ROWS, TILE_SIZE } from './levels';
import type { EnemyEntity, PickupEntity, PlayerEntity, WeatherKind } from './types';
import type { WorldState } from './physics';

export const VIRTUAL_HEIGHT = GRID_ROWS * TILE_SIZE; // 512

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  world: WorldState,
  canvasWidth: number,
  canvasHeight: number,
  timeSec: number,
  isTitleMode: boolean
) {
  const scale = canvasHeight / VIRTUAL_HEIGHT;
  const viewWidthVirtual = canvasWidth / scale;

  // Smooth camera tracking (with title framing near start shrine)
  const targetCamX = isTitleMode
    ? 0
    : Math.max(
        0,
        Math.min(
          world.cols * TILE_SIZE - viewWidthVirtual,
          world.player.x + world.player.w / 2 - viewWidthVirtual * 0.38
        )
      );
  world.cameraX += (targetCamX - world.cameraX) * 0.14;
  const camX = Math.max(0, world.cameraX);

  ctx.save();
  ctx.scale(scale, scale);

  const pal = world.stage.palette;

  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
  skyGrad.addColorStop(0, pal.skyTop);
  skyGrad.addColorStop(1, pal.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, viewWidthVirtual, VIRTUAL_HEIGHT);

  // 2. Calm Parallax Far Silhouettes & Sky Weather Backdrops
  drawSkyClouds(ctx, viewWidthVirtual, camX, timeSec, world.stage.weather);
  drawParallaxLayer(ctx, viewWidthVirtual, camX * 0.15, pal.farSilhouette, 280, 95, 220);
  drawParallaxLayer(ctx, viewWidthVirtual, camX * 0.32, pal.horizonHill, 345, 65, 160);

  ctx.save();
  ctx.translate(-Math.round(camX), 0);

  // 3. Visible Tile Range
  const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
  const endCol = Math.min(
    world.cols - 1,
    Math.ceil((camX + viewWidthVirtual) / TILE_SIZE) + 1
  );

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const ch = world.grid[r][c];
      if (ch === '.') continue;
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      if (ch === '#') {
        const above = r > 0 ? world.grid[r - 1][c] : '.';
        ctx.fillStyle = pal.groundFill;
        ctx.fillRect(x, y, TILE_SIZE + 0.8, TILE_SIZE + 0.8);
        if (above !== '#') {
          ctx.fillStyle = pal.groundTop;
          ctx.fillRect(x, y, TILE_SIZE + 0.8, 6);
        }
      } else if (ch === 'S') {
        ctx.fillStyle = pal.stoneFill;
        ctx.fillRect(x, y, TILE_SIZE + 0.5, TILE_SIZE + 0.5);
        ctx.strokeStyle = 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 3);
      } else if (ch === 'B') {
        ctx.fillStyle = pal.brickFill;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(15,23,42,0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        ctx.beginPath();
        ctx.moveTo(x, y + 16);
        ctx.lineTo(x + TILE_SIZE, y + 16);
        ctx.moveTo(x + 16, y);
        ctx.lineTo(x + 16, y + 16);
        ctx.stroke();
      } else if (ch === '?') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, 3);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        // Simple rune diamond
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 9);
        ctx.lineTo(x + 22, y + 16);
        ctx.lineTo(x + 16, y + 23);
        ctx.lineTo(x + 10, y + 16);
        ctx.closePath();
        ctx.fill();
      } else if (ch === 'U') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      } else if (ch === '=') {
        ctx.fillStyle = '#855836';
        ctx.fillRect(x, y, TILE_SIZE, 9);
        ctx.fillStyle = '#b07b4f';
        ctx.fillRect(x, y, TILE_SIZE, 3);
      } else if (ch === '^') {
        ctx.fillStyle = '#94a3b8';
        for (let s = 0; s < 2; s++) {
          const sx = x + s * 16;
          ctx.beginPath();
          ctx.moveTo(sx + 1, y + TILE_SIZE);
          ctx.lineTo(sx + 8, y + 12);
          ctx.lineTo(sx + 15, y + TILE_SIZE);
          ctx.closePath();
          ctx.fill();
        }
      } else if (ch === '~') {
        const cr = world.crumbles.get(`${c},${r}`);
        if (!cr || cr.state !== 'gone') {
          const jitter = cr?.state === 'shaking' ? (Math.sin(timeSec * 45) > 0 ? 1 : -1) : 0;
          ctx.fillStyle = cr?.state === 'shaking' ? '#94a3b8' : '#64748b';
          ctx.fillRect(x + jitter, y, TILE_SIZE, 12);
          ctx.fillStyle = 'rgba(15,23,42,0.5)';
          ctx.fillRect(x + 10 + jitter, y + 2, 2, 7);
          ctx.fillRect(x + 22 + jitter, y + 4, 2, 6);
        }
      }
    }
  }

  // 4. Moving Platforms
  for (const mp of world.movingPlatforms) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(mp.x + 2, mp.y + 2, mp.w - 4, 3);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(mp.x, mp.y, mp.w, mp.h);
  }

  // 5. Goal Wayshrine Portal
  drawGoalShrine(
    ctx,
    world.stage.goalTile.x * TILE_SIZE,
    world.stage.goalTile.y * TILE_SIZE,
    pal.accent,
    world.enemies.some((e) => e.type === 'warden' && e.state !== 'ko')
  );

  // 6. Pickups
  for (const pk of world.pickups) {
    if (!pk.collected) {
      drawPickup(ctx, pk, timeSec);
    }
  }

  // 7. Enemies
  for (const e of world.enemies) {
    drawEnemy(ctx, e);
  }

  // 8. Projectiles
  for (const pr of world.projectiles) {
    ctx.fillStyle = pr.fromPlayer ? '#fde047' : '#fb7185';
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, pr.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Protagonist: Vesper the Lantern Nomad (completely distinct from Mario)
  drawVesper(ctx, world.player, timeSec);

  // 10. Pooled Particles
  for (let i = 0; i < world.particles.length; i++) {
    const pt = world.particles[i];
    if (!pt.active) continue;
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // 11. Floating Combat / XP Text
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  for (const ft of world.floatingTexts) {
    ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // 12. Foreground Biome Weather Overlay (screen-space, minimal & atmospheric)
  drawWeatherOverlay(ctx, viewWidthVirtual, camX, timeSec, world.stage.weather);

  ctx.restore();
}

function drawSkyClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  camX: number,
  timeSec: number,
  weather: WeatherKind
) {
  if (weather === 'embers' || weather === 'steam') return;
  const isStorm = weather === 'rain' || weather === 'ash' || weather === 'snow';
  ctx.save();
  ctx.fillStyle = isStorm
    ? 'rgba(203, 213, 225, 0.14)'
    : weather === 'fireflies'
      ? 'rgba(196, 181, 253, 0.12)'
      : 'rgba(255, 255, 255, 0.18)';

  const span = width + 260;
  for (let i = 0; i < 6; i++) {
    const base = i * 210 + timeSec * (8 + (i % 3) * 3) - camX * 0.08;
    const cx = ((base % span) + span) % span - 130;
    const cy = 54 + (i % 3) * 36;
    const w = 68 + (i % 2) * 26;
    ctx.fillRect(cx, cy, w, 14);
    ctx.fillRect(cx + 12, cy - 8, w - 24, 10);
  }
  ctx.restore();
}

function drawWeatherOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  camX: number,
  timeSec: number,
  weather: WeatherKind
) {
  ctx.save();
  const wrapW = width + 80;

  if (weather === 'rain') {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 42; i++) {
      const seed = i * 73.13;
      const x =
        (((seed * 19 - timeSec * 140 - camX * 0.5) % wrapW) + wrapW) % wrapW -
        40;
      const y = ((seed * 11 + timeSec * 360) % (VIRTUAL_HEIGHT + 40)) - 20;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 14);
    }
    ctx.stroke();
  } else if (weather === 'snow') {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.72)';
    for (let i = 0; i < 36; i++) {
      const seed = i * 59.7;
      const sway = Math.sin(timeSec * 1.4 + i) * 14;
      const x =
        (((seed * 23 + sway - camX * 0.4) % wrapW) + wrapW) % wrapW - 40;
      const y = ((seed * 13 + timeSec * 48) % (VIRTUAL_HEIGHT + 20)) - 10;
      const size = i % 3 === 0 ? 3 : 2;
      ctx.fillRect(x, y, size, size);
    }
  } else if (weather === 'leaves') {
    for (let i = 0; i < 20; i++) {
      const seed = i * 91.3;
      const sway = Math.sin(timeSec * 1.8 + i * 1.1) * 18;
      const x =
        (((seed * 27 - timeSec * 28 + sway - camX * 0.45) % wrapW) + wrapW) %
          wrapW -
        40;
      const y = ((seed * 17 + timeSec * 38) % (VIRTUAL_HEIGHT + 20)) - 10;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(132, 204, 22, 0.55)' : 'rgba(217, 119, 6, 0.55)';
      ctx.fillRect(x, y, 5, 3);
    }
  } else if (weather === 'mist') {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.12)';
    for (let i = 0; i < 5; i++) {
      const span = width + 320;
      const x =
        (((i * 260 - timeSec * 16 - camX * 0.25) % span) + span) % span - 160;
      const y = 315 + (i % 3) * 44;
      ctx.fillRect(x, y, 160 + (i % 2) * 50, 14);
    }
  } else if (weather === 'dust') {
    ctx.fillStyle = 'rgba(253, 186, 116, 0.42)';
    for (let i = 0; i < 26; i++) {
      const seed = i * 47.9;
      const x =
        (((seed * 29 - timeSec * 65 - camX * 0.45) % wrapW) + wrapW) % wrapW -
        40;
      const y = ((seed * 17 + Math.sin(timeSec + i) * 12) % (VIRTUAL_HEIGHT - 60)) + 30;
      ctx.fillRect(x, y, 2.5, 2);
    }
  } else if (weather === 'fireflies') {
    for (let i = 0; i < 22; i++) {
      const seed = i * 67.3;
      const x =
        (((seed * 31 + Math.sin(timeSec * 0.7 + i) * 18 - camX * 0.4) % wrapW) +
          wrapW) %
          wrapW -
        40;
      const y =
        110 +
        ((seed * 19 + Math.cos(timeSec * 0.9 + i * 1.7) * 16) %
          (VIRTUAL_HEIGHT - 170));
      const glow = 0.35 + 0.4 * Math.sin(timeSec * 2.2 + i);
      ctx.fillStyle = `rgba(253, 224, 71, ${glow.toFixed(2)})`;
      ctx.fillRect(x, y, 3, 3);
    }
  } else if (weather === 'embers' || weather === 'ash') {
    for (let i = 0; i < 28; i++) {
      const seed = i * 83.7;
      const isEmber = weather === 'embers' || i % 3 === 0;
      const speedY = isEmber ? -42 : 34;
      const x =
        (((seed * 23 + Math.sin(timeSec + i) * 10 - camX * 0.4) % wrapW) +
          wrapW) %
          wrapW -
        40;
      const rawY = (seed * 17 + timeSec * speedY) % VIRTUAL_HEIGHT;
      const y = rawY < 0 ? rawY + VIRTUAL_HEIGHT : rawY;
      ctx.fillStyle = isEmber
        ? 'rgba(251, 146, 60, 0.65)'
        : 'rgba(148, 163, 184, 0.45)';
      ctx.fillRect(x, y, isEmber ? 2.5 : 3, 2.5);
    }
  } else if (weather === 'steam') {
    ctx.fillStyle = 'rgba(226, 232, 240, 0.16)';
    for (let i = 0; i < 14; i++) {
      const seed = i * 101.1;
      const x =
        (((seed * 21 - camX * 0.45) % wrapW) + wrapW) % wrapW - 40;
      const rawY = (seed * 13 - timeSec * 36) % VIRTUAL_HEIGHT;
      const y = rawY < 0 ? rawY + VIRTUAL_HEIGHT : rawY;
      ctx.fillRect(x, y, 16, 7);
    }
  } else if (weather === 'clouds') {
    // Gentle sunlit pollen motes
    ctx.fillStyle = 'rgba(254, 249, 195, 0.48)';
    for (let i = 0; i < 18; i++) {
      const seed = i * 53.1;
      const x =
        (((seed * 29 + timeSec * 14 - camX * 0.4) % wrapW) + wrapW) % wrapW -
        40;
      const y = 70 + ((seed * 19 + Math.sin(timeSec + i) * 10) % 330);
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.restore();
}

function drawParallaxLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  offsetX: number,
  color: string,
  baseY: number,
  amp: number,
  period: number
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, VIRTUAL_HEIGHT);
  for (let sx = 0; sx <= width + 32; sx += 32) {
    const wx = sx + offsetX;
    const h =
      Math.sin(wx / period) * amp * 0.55 +
      Math.cos(wx / (period * 0.48)) * amp * 0.35;
    ctx.lineTo(sx, baseY - Math.abs(h));
  }
  ctx.lineTo(width + 32, VIRTUAL_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function drawGoalShrine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accent: string,
  locked: boolean
) {
  const baseY = y + TILE_SIZE;
  // Stone arch pillars
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - 2, baseY - 58, 8, 58);
  ctx.fillRect(x + 26, baseY - 58, 8, 58);
  // Capstone
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 6, baseY - 64, 44, 10);

  // Inner shrine light
  ctx.fillStyle = locked ? 'rgba(100,116,139,0.4)' : accent;
  ctx.globalAlpha = locked ? 0.5 : 0.72;
  ctx.fillRect(x + 7, baseY - 52, 18, 52);
  ctx.globalAlpha = 1;

  if (!locked) {
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(x + 16, baseY - 34, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPickup(
  ctx: CanvasRenderingContext2D,
  pk: PickupEntity,
  timeSec: number
) {
  const bob = pk.fromChest ? 0 : Math.round(Math.sin(timeSec * 2.5 + pk.bobOffset) * 1.5);
  const cx = pk.x + pk.w / 2;
  const cy = pk.y + pk.h / 2 + bob;

  if (pk.kind === 'coin') {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 1.5, cy - 4, 3, 8);
  } else if (pk.kind === 'xp_gem') {
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 7, cy);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx - 7, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(cx - 2, cy - 3, 3, 4);
  } else if (pk.kind === 'potion') {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(cx - 3, cy - 8, 6, 4);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.fillRect(cx - 2, cy - 2, 2, 4);
  } else if (pk.kind === 'relic') {
    ctx.fillStyle = '#fde047';
    ctx.fillRect(cx - 8, cy - 8, 16, 16);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 8, cy - 8, 16, 16);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVesper(
  ctx: CanvasRenderingContext2D,
  p: PlayerEntity,
  timeSec: number
) {
  if (p.invulnTimer > 0 && Math.floor(timeSec * 14) % 2 === 0 && p.hurtFlashTimer <= 0) {
    ctx.globalAlpha = 0.45;
  }

  const cx = Math.round(p.x + p.w / 2);
  const footY = Math.round(p.y + p.h);
  const dir = p.facing;
  const flash = p.hurtFlashTimer > 0;

  // Minimal 2-pose stride when walking on ground
  const stepPose =
    p.grounded && Math.abs(p.vx) > 20 ? Math.floor(p.walkDistance / 18) % 2 : 0;

  // Boots (minimal 2-pose offset)
  ctx.fillStyle = flash ? '#ffffff' : '#2c2420';
  if (!p.grounded) {
    ctx.fillRect(cx - 7, footY - 6, 5, 5);
    ctx.fillRect(cx + 2, footY - 8, 5, 5);
  } else if (stepPose === 1) {
    ctx.fillRect(cx - 8, footY - 5, 5, 5);
    ctx.fillRect(cx + 3, footY - 5, 5, 5);
  } else {
    ctx.fillRect(cx - 6, footY - 5, 5, 5);
    ctx.fillRect(cx + 1, footY - 5, 5, 5);
  }

  // Ivory traveler tunic beneath cloak
  const crouchDrop = p.crouching ? 4 : 0;
  ctx.fillStyle = flash ? '#ffffff' : '#ede6d6';
  ctx.fillRect(cx - 6, footY - 14 + crouchDrop, 12, 9 - crouchDrop * 0.5);

  // Deep teal hooded cloak (distinct non-Mario silhouette)
  ctx.fillStyle = flash ? '#ffffff' : '#1b5e68';
  ctx.beginPath();
  ctx.moveTo(cx - 9 * dir, footY - 8);
  ctx.lineTo(cx - 7 * dir, footY - 24 + crouchDrop);
  ctx.lineTo(cx + 7 * dir, footY - 22 + crouchDrop);
  ctx.lineTo(cx + 8 * dir, footY - 10);
  ctx.closePath();
  ctx.fill();

  // Brass satchel strap
  ctx.strokeStyle = flash ? '#ffffff' : '#c98a32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * dir, footY - 20 + crouchDrop);
  ctx.lineTo(cx + 5 * dir, footY - 11);
  ctx.stroke();

  // Pointed travel hood & face shadow
  ctx.fillStyle = flash ? '#ffffff' : '#154a52';
  ctx.beginPath();
  ctx.moveTo(cx - 9 * dir, footY - 21 + crouchDrop);
  ctx.lineTo(cx - 3 * dir, footY - 31 + crouchDrop);
  ctx.lineTo(cx + 8 * dir, footY - 27 + crouchDrop);
  ctx.lineTo(cx + 7 * dir, footY - 19 + crouchDrop);
  ctx.closePath();
  ctx.fill();

  // Face / pale eye slit
  ctx.fillStyle = flash ? '#ffffff' : '#f3e7d3';
  ctx.fillRect(cx + (dir === 1 ? 2 : -6), footY - 25 + crouchDrop, 5, 5);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx + (dir === 1 ? 5 : -5), footY - 24 + crouchDrop, 2, 2);

  // Oak Lantern Staff held forward
  const staffX = cx + dir * 11;
  ctx.strokeStyle = flash ? '#ffffff' : '#7c4d2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(staffX, footY - 2);
  ctx.lineTo(staffX, footY - 24 + crouchDrop);
  ctx.stroke();

  // Warm amber spirit-lantern
  ctx.fillStyle = flash ? '#ffffff' : '#f59e0b';
  ctx.fillRect(staffX - 2.5, footY - 25 + crouchDrop, 5, 6);
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(staffX - 1, footY - 23 + crouchDrop, 2, 3);

  ctx.globalAlpha = 1;
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: EnemyEntity) {
  const flash = e.hurtFlashTimer > 0;
  ctx.save();
  if (e.state === 'ko') {
    ctx.globalAlpha = Math.max(0.2, e.koTimer / 0.35);
  }

  if (e.type === 'slime') {
    ctx.fillStyle = flash ? '#ffffff' : '#3f8f4e';
    ctx.beginPath();
    ctx.arc(e.x + e.w / 2, e.y + e.h - 2, e.w / 2, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    const eyeX = e.x + (e.facing === 1 ? 15 : 6);
    ctx.fillRect(eyeX, e.y + 10, 3, 3);
    ctx.fillRect(eyeX + 5, e.y + 10, 3, 3);
  } else if (e.type === 'hopper') {
    const crouch = e.state === 'windup' ? 5 : 0;
    ctx.fillStyle = flash ? '#ffffff' : e.state === 'windup' ? '#d97706' : '#7c3f2c';
    ctx.fillRect(e.x + 2, e.y + 4 + crouch, e.w - 4, e.h - 4 - crouch);
    // Pointed ears/horns
    ctx.fillStyle = flash ? '#ffffff' : '#572a1c';
    ctx.fillRect(e.x + 2, e.y + crouch, 5, 5);
    ctx.fillRect(e.x + e.w - 7, e.y + crouch, 5, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(e.x + (e.facing === 1 ? 16 : 5), e.y + 9 + crouch, 4, 3);
  } else if (e.type === 'wisp') {
    // Telegraph ring when winding up shot
    if (e.state === 'windup') {
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 16, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = flash ? '#ffffff' : '#7e22ce';
    ctx.beginPath();
    ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (e.type === 'sentinel') {
    if (e.state === 'windup') {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(e.x + e.w / 2 - 2, e.y - 8, 4, 4);
    }
    ctx.fillStyle = flash ? '#ffffff' : '#334155';
    ctx.fillRect(e.x + 2, e.y + 4, e.w - 4, e.h - 4);
    // Helmet crest
    ctx.fillStyle = flash ? '#ffffff' : '#94a3b8';
    ctx.fillRect(e.x + 6, e.y, e.w - 12, 6);
    // Visor
    ctx.fillStyle = e.state === 'windup' || e.state === 'attack' ? '#fb7185' : '#fbbf24';
    ctx.fillRect(e.x + (e.facing === 1 ? 14 : 4), e.y + 10, 9, 3);
  } else if (e.type === 'warden') {
    const variant = e.bossVariant ?? 'ash_warden';
    if (e.state === 'windup') {
      ctx.strokeStyle =
        e.bossAttack === 'charge'
          ? '#fbbf24'
          : e.bossAttack === 'leap_slam'
            ? '#38bdf8'
            : '#fb7185';
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x - 4, e.y - 4, e.w + 8, e.h + 8);
      if (e.bossAttack === 'charge') {
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y + e.h / 2);
        ctx.lineTo(e.x + e.w / 2 + e.facing * 90, e.y + e.h / 2);
        ctx.stroke();
      }
    }

    const bodyColor =
      variant === 'frost_monarch'
        ? '#1e3a5f'
        : variant === 'brass_titan'
          ? '#57422c'
          : '#4c1d24';
    const crownColor =
      variant === 'frost_monarch'
        ? '#7dd3fc'
        : variant === 'brass_titan'
          ? '#d97706'
          : '#b45309';
    const coreColor =
      e.phase === 2
        ? '#fb7185'
        : variant === 'frost_monarch'
          ? '#38bdf8'
          : variant === 'brass_titan'
            ? '#fde047'
            : '#f59e0b';

    ctx.fillStyle = flash ? '#ffffff' : bodyColor;
    ctx.fillRect(e.x + 2, e.y + 8, e.w - 4, e.h - 8);

    // Distinct Crown / Silhouette per randomized variant
    ctx.fillStyle = flash ? '#ffffff' : crownColor;
    if (variant === 'frost_monarch') {
      // Three glacial spires
      ctx.fillRect(e.x + 6, e.y + 2, 6, 8);
      ctx.fillRect(e.x + 19, e.y - 2, 6, 12);
      ctx.fillRect(e.x + e.w - 12, e.y + 2, 6, 8);
    } else if (variant === 'brass_titan') {
      // Wide flat shoulder plates & central gear dome
      ctx.fillRect(e.x - 2, e.y + 10, 6, 14);
      ctx.fillRect(e.x + e.w - 4, e.y + 10, 6, 14);
      ctx.fillRect(e.x + 14, e.y + 2, 16, 8);
    } else {
      // Ash Warden twin horns
      ctx.fillRect(e.x + 4, e.y, 7, 10);
      ctx.fillRect(e.x + e.w - 11, e.y, 7, 10);
    }

    // Glowing core & visor
    ctx.fillStyle = coreColor;
    ctx.fillRect(e.x + 12, e.y + 16, e.w - 24, 4);
    ctx.fillRect(e.x + 17, e.y + 26, 10, 10);
  }

  // Mini HP bar above multi-HP non-boss enemies if damaged
  if (e.type !== 'warden' && e.hp < e.maxHp && e.state !== 'ko') {
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(e.x, e.y - 6, e.w, 3);
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(e.x, e.y - 6, Math.max(2, (e.w * e.hp) / e.maxHp), 3);
  }

  ctx.restore();
}
