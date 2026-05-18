/**
 * Recuperación si falla la carga de chunks de Next.js en Vercel (404 en _next/static).
 * Evita pantalla negra del navegador ("This page couldn't load").
 */
export function ChunkLoadRecovery() {
  const script = `
(function () {
  var RELOAD_KEY = "__amc_chunk_reload";
  function shouldReload() {
    try {
      var n = sessionStorage.getItem(RELOAD_KEY);
      if (n && Number(n) >= 2) return false;
      sessionStorage.setItem(RELOAD_KEY, String(Number(n || 0) + 1));
      return true;
    } catch (e) {
      return true;
    }
  }
  function showFallback(msg) {
    var root = document.getElementById("__amc_boot_error");
    if (!root) {
      root = document.createElement("div");
      root.id = "__amc_boot_error";
      root.setAttribute("role", "alert");
      root.style.cssText =
        "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:#0c0c0e;color:#f4f4f5;font-family:system-ui,sans-serif;text-align:center;";
      document.body.appendChild(root);
    }
    root.innerHTML =
      '<div style="max-width:22rem"><h1 style="font-size:1.125rem;margin:0 0 0.5rem">No se pudo cargar la aplicación</h1><p style="font-size:0.875rem;color:#a1a1aa;margin:0 0 1rem">' +
      msg +
      '</p><button type="button" style="background:#a78bfa;color:#0c0c0e;border:none;border-radius:0.5rem;padding:0.625rem 1.25rem;font-weight:600;cursor:pointer" onclick="location.reload()">Recargar</button></div>';
  }
  window.addEventListener("error", function (ev) {
    var t = ev.target;
    if (t && t.tagName === "SCRIPT" && t.src && t.src.indexOf("/_next/static/") !== -1) {
      if (shouldReload()) {
        location.reload();
      } else {
        showFallback("Error al cargar recursos. Prueba recargar o limpiar caché del navegador.");
      }
    }
  }, true);
  window.addEventListener("unhandledrejection", function (ev) {
    var reason = ev.reason && (ev.reason.message || String(ev.reason));
    if (reason && /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(reason)) {
      if (shouldReload()) {
        location.reload();
      } else {
        showFallback("Error de carga de módulos. Recarga la página.");
      }
    }
  });
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
