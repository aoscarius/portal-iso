// ============================================================
// portalGun.js — Portal placement, rendering, and teleportation
// ============================================================

const PortalGun = (() => {
  // Current portal positions (null = not placed)
  let portals = { A: null, B: null };

  function reset() {
    portals.A = null;
    portals.B = null;
    Renderer.updatePortal('A', null);
    Renderer.updatePortal('B', null);
    // Stop portal swirl particles if Particles module is available
    if (typeof Particles !== 'undefined') {
      Particles.stopPortalSwirl('A');
      Particles.stopPortalSwirl('B');
    }
    _updateHUD();
  }

  /**
   * Shoot portal A or B in the player's facing direction.
   * @param {'A'|'B'} which
   * @param {{x,z}}   origin  — Player grid position
   * @param {{dx,dz}} dir     — Facing direction
   */
  function shoot(which, origin, dir) {
    const hit = Physics.castPortalRay(origin.x, origin.z, dir);

    if (!hit) {
      EventBus.emit('portal:miss', { which });
      return;
    }

    // Can't place both portals on the same wall cell
    const other = which === 'A' ? 'B' : 'A';
    if (portals[other] && portals[other].x === hit.x && portals[other].z === hit.z) {
      EventBus.emit('portal:miss', { which });
      return;
    }

    portals[which] = { x: hit.x, z: hit.z };
    Renderer.updatePortal(which, hit);
    _updateHUD();
    EventBus.emit('portal:placed', { which, cell: hit });
  }

  /**
   * Check if a move from (px,pz) towards (nx,nz) enters a portal.
   * If both portals are placed and the target cell is a portal, teleport.
   *
   * @returns {{exitX,exitZ,exitDir}|null}
   */
  function checkTeleport(currentPos, nx, nz, dir) {
    if (!portals.A || !portals.B) return null;

    // Check if moving into portal A
    if (portals.A.x === nx && portals.A.z === nz) {
      return Physics.getPortalExit(portals.A, portals.B, dir);
    }
    // Check if moving into portal B
    if (portals.B.x === nx && portals.B.z === nz) {
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
