// portalGun.js — Multi-layer portal placement and teleportation

const PortalGun = (() => {
  // Portal cell now includes layerIdx
  let portals = { A: null, B: null };  // {x, z, layerIdx}

  function reset() {
    portals.A = null;
    portals.B = null;
    Renderer.updatePortal('A', null, 0);
    Renderer.updatePortal('B', null, 0);
    // Stop portal swirl particles if Particles module is available
    if (typeof Particles !== 'undefined') {
      Particles.stopPortalSwirl?.('A');
      Particles.stopPortalSwirl?.('B');
    }
    _updateHUD();
  }

  /**
   * Shoot portal A or B in the player's facing direction.
   * @param {'A'|'B'} which
   * @param {{x,z}}   origin  — Player grid position
   * @param {{dx,dz}} dir     — Facing direction
   * @param {number}  layerIdx  — player's current layer
   */
  function shoot(which, origin, dir, layerIdx = 0) {
    const hit = Physics.castPortalRay(origin.x, origin.z, dir, layerIdx);

    if (!hit) { 
      EventBus.emit('portal:miss', { which });
      return; 
    }

    const other = which === 'A' ? 'B' : 'A';
    if (portals[other] && portals[other].x === hit.x && portals[other].z === hit.z && portals[other].layerIdx === hit.layerIdx) {
      EventBus.emit('portal:miss', { which }); 
      return;
    }

    portals[which] = hit;  // {x, z, layerIdx, faceDir}
    Renderer.updatePortal(which, hit, hit.layerIdx);
    _updateHUD();
    EventBus.emit('portal:placed', { which, cell: hit });

    if (portals.A && portals.B) 
      EventBus.emit('portal:both', { which, cell: hit });
    else if (portals.A)
      EventBus.emit('portal:first', { which, cell: hit });
  }

  /**
   * Check if a move from (px,pz) towards (nx,nz) enters a portal.
   * If both portals are placed and the target cell is a portal, teleport.
   *
   * @returns {{exitX,exitZ,exitDir}|null}
   */
  function checkTeleport(currentPos, nx, nz, dir, layerIdx = 0) {
    if (!portals.A || !portals.B) return null;

    // Check if moving into portal A
    if (portals.A.x === nx && portals.A.z === nz && (portals.A.layerIdx ?? 0) === layerIdx) {
      return Physics.getPortalExit(portals.A, portals.B, dir);
    }
    // Check if moving into portal B
    if (portals.B.x === nx && portals.B.z === nz && (portals.B.layerIdx ?? 0) === layerIdx) {
      return Physics.getPortalExit(portals.B, portals.A, dir);
      }
      return null;
  }

  function _updateHUD() {
    const dotA = document.getElementById('portal-a');
    const dotB = document.getElementById('portal-b');
    dotA?.classList.toggle('active-a', !!portals.A);
    dotB?.classList.toggle('active-b', !!portals.B);
  }

  return { reset, shoot, checkTeleport, getPortals: () => ({ ...portals }) };
})();
