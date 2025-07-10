let ramos = [];
const estado = {};

const container = document.getElementById('malla');
const boton = document.getElementById('toggle-tema');

// Cargar datos
fetch('data/ramos.json')
  .then((res) => res.json())
  .then((data) => {
    ramos = data;

    // Cargar estado guardado de ramos
    const savedEstado = localStorage.getItem('estadoRamos');
    if (savedEstado) {
      Object.assign(estado, JSON.parse(savedEstado));
    }

    renderMalla();
  })
  .catch((error) => console.error("Error cargando ramos:", error));

// Al cargar la página, aplicar modo noche si está guardado
const modoNocheGuardado = localStorage.getItem('modoNoche');
if (modoNocheGuardado === 'true') {
  document.body.classList.add('modo-noche');
  boton.textContent = '☀️ Modo Claro';
} else {
  boton.textContent = '🌙 Modo Noche';
}

function renderMalla() {
  container.innerHTML = '';

  const porSemestre = {};
  for (let i = 1; i <= 11; i++) porSemestre[i] = [];

  ramos.forEach((ramo) => {
    if (porSemestre[ramo.semestre]) {
      porSemestre[ramo.semestre].push(ramo);
    }
  });

  for (let semestre = 1; semestre <= 11; semestre++) {
    const columna = document.createElement('div');
    columna.className = 'semestre';

    const titulo = document.createElement('h2');
    titulo.textContent = `${semestre}`;
    columna.appendChild(titulo);

    porSemestre[semestre].forEach((ramo) => {
      const div = crearElementoRamo(ramo);
      div.id = ramo.id;

      const prereqsListos = ramo.prereqs.every((id) => estado[id]);
      // FIX: Si no cumple el prerequisito, se bloquea y limpiamos estado
      if(!prereqsListos){
        div.classList.add('bloqueado');
        estado[ramo.id] = false; // Fuerza que no esté aprobado
      } else if (estado[ramo.id]) {
        div.classList.add('tachado');
      }

      div.addEventListener('click', () => {
        if (estado[ramo.id]) {
          estado[ramo.id] = false;
        } else if (prereqsListos) {
          estado[ramo.id] = true;
        }

        localStorage.setItem('estadoRamos', JSON.stringify(estado));
        renderMalla();
      });

      columna.appendChild(div);
    });
    container.appendChild(columna);
  }
  localStorage.setItem('estadoRamos', JSON.stringify(estado)); // Se guarda el estado corregido (FIX)
}

function eliminarTildes(texto){
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function crearElementoRamo(ramo) {
  const div = document.createElement("div");
  div.classList.add("ramo");

  let area = ramo.area?.toLowerCase() || "";
  area = eliminarTildes(area).replace(/\s+/g, "-");

  if (area) {
    div.classList.add(area);
  }

  div.textContent = ramo.nombre;
  return div;
}

// Toggle modo noche y guardar estado
boton.addEventListener('click', () => {
  const modoNocheActivo = document.body.classList.toggle('modo-noche');
  boton.textContent = modoNocheActivo ? '☀️ Modo Claro' : '🌙 Modo Noche';
  localStorage.setItem('modoNoche', modoNocheActivo);
});
