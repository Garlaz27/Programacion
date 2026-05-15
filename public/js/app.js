const API_BASE = "http://localhost:3000";

/* ---- Funciones auxiliares ---- */
function showElement(id) {
  document.getElementById(id)?.removeAttribute("hidden");
}
function hideElement(id) {
  document.getElementById(id)?.setAttribute("hidden", "");
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-gob" aria-hidden="true"></span>Consultando...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.original || "Consultar";
  }
}

function renderTramites(tramites, gridClass = "col-12") {
  if (!tramites.length) return "";
  const htmlCards = tramites
    .map(
      (t) => `
    <div class="${gridClass}">
      <article class="result-card h-100 d-flex flex-column" aria-label="Trámite: ${t.nombre}">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
          <div>
            <span class="tramite-id">${t.id}</span>
            <h4>${t.nombre}</h4>
            <span class="badge-entidad">${t.entidad}</span>
          </div>
          <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1"
                aria-label="Estado: ${t.estado}">${t.estado}</span>
        </div>
        <div class="result-meta mt-auto pt-2" role="list">
          <span role="listitem" class="d-block mb-1"><strong>Plazo:</strong> ${t.plazo}</span>
          <span role="listitem" class="d-block"><strong>Costo:</strong> ${t.costo}</span>
        </div>
      </article>
    </div>`
    )
    .join("");
  return `<div class="row g-3 align-items-stretch">${htmlCards}</div>`;
}

function renderAlert(tipo, mensaje) {
  const icons = { 
    success: '<i class="bi bi-check-circle-fill" aria-hidden="true"></i>', 
    warning: '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>', 
    danger: '<i class="bi bi-x-circle-fill" aria-hidden="true"></i>', 
    info: '<i class="bi bi-info-circle-fill" aria-hidden="true"></i>' 
  };
  return `<div class="alert alert-${tipo} alert-result" role="alert" aria-live="polite">
            ${icons[tipo] || icons.info} ${mensaje}
          </div>`;
}

/* ---- Validación del formulario ---- */
function validarFormulario(termino, tipo) {
  let errores = [];
  if (!termino || termino.trim().length < 2) {
    errores.push("Ingrese al menos 2 caracteres en el campo de búsqueda.");
  }
  if (!tipo) {
    errores.push("Seleccione un tipo de consulta.");
  }
  return errores;
}

function mostrarErrores(errores) {
  const container = document.getElementById("form-errores");
  if (!errores.length) {
    container.innerHTML = "";
    container.setAttribute("hidden", "");
    return;
  }
  const lista = errores.map((e) => `<li>${e}</li>`).join("");
  container.innerHTML = `<div class="alert alert-danger alert-result" role="alert" aria-live="assertive">
    <i class="bi bi-x-circle-fill" aria-hidden="true"></i> <strong>Por favor corrija los siguientes errores:</strong>
    <ul class="mb-0 mt-1">${lista}</ul>
  </div>`;
  container.removeAttribute("hidden");
  container.focus();
}

/* ---- Consulta POST /consulta ---- */
async function buscarTramite(termino) {
  const res = await fetch(`${API_BASE}/consulta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ termino }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensaje || "Error al conectar con el servidor.");
  }
  return res.json();
}

/* ---- Consulta GET /tramites ---- */
async function cargarTodosLosTramites() {
  const container = document.getElementById("lista-tramites");
  if (!container) return;

  container.innerHTML = `<p class="text-muted" aria-live="polite">
    <span class="spinner-gob" style="border-color:rgba(13,59,122,.2);border-top-color:var(--gob-primary)" aria-hidden="true"></span>
    Cargando trámites disponibles...
  </p>`;

  try {
    const res = await fetch(`${API_BASE}/tramites`);
    const json = await res.json();
    container.innerHTML = renderTramites(json.data, "col-sm-6 col-lg-3");
  } catch {
    container.innerHTML = renderAlert(
      "warning",
      "No se pudo conectar con el servidor. Verifique que el back-end esté en ejecución."
    );
  }
}

/* ---- Envío del formulario ---- */
document.getElementById("form-consulta")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const termino = document.getElementById("termino").value.trim();
  const tipo = document.getElementById("tipo-consulta").value;
  const resultados = document.getElementById("resultados");

  const errores = validarFormulario(termino, tipo);
  mostrarErrores(errores);
  if (errores.length) return;

  const btn = document.getElementById("btn-consultar");
  setLoading(btn, true);
  resultados.innerHTML = "";

  try {
    const json = await buscarTramite(termino);

    if (json.total === 0) {
      resultados.innerHTML = renderAlert(
        "info",
        `No se encontraron trámites para <strong>"${termino}"</strong>. Intente con otro término.`
      );
    } else {
      resultados.innerHTML = `
        <p class="text-success fw-semibold mb-3" aria-live="polite">
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i> Se encontraron <strong>${json.total}</strong> resultado(s):
        </p>
        ${renderTramites(json.data)}`;
    }
  } catch (err) {
    resultados.innerHTML = renderAlert("danger", err.message);
  } finally {
    setLoading(btn, false);
    resultados.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

/* ---- Inicio ---- */
document.addEventListener("DOMContentLoaded", cargarTodosLosTramites);
