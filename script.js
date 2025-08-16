document.addEventListener('DOMContentLoaded', function() {
  fetch('datos.json')
    .then(response => response.json())
    .then(eventos => {
      const coloresPorTipo = {
        "Salida de campo": "#1E90FF",
        "Etapa UGEL": "#32CD32",
        "Etapa DREC": "#FFD700",
        "Etapa Nacional": "#8A2BE2",
        "Parcial": "#FF6347" ,
        "Etapa Internacional": "#000000",
        "Etapa Mundial": "#FF0000",
        "Final": "#FF69B4"
      };

      // Crear leyenda
      const leyendaDiv = document.getElementById('leyenda');
      for (const [tipo, color] of Object.entries(coloresPorTipo)) {
        const item = document.createElement('div');
        item.classList.add('legend-item');
        item.innerHTML = `<span class="legend-color" style="background:${color}"></span>${tipo}`;
        leyendaDiv.appendChild(item);
      }

      // Función para detectar solapamientos
      // Consideramos rango fechas: start - end (end incluido)
      function haySolapamiento(a, b) {
        // Convertir a fechas
        const startA = new Date(a.start);
        const endA = a.end ? new Date(a.end) : startA;
        const startB = new Date(b.start);
        const endB = b.end ? new Date(b.end) : startB;

        // El solapamiento existe si:
        // startA <= endB && startB <= endA
        return startA <= endB && startB <= endA;
      }

      // Mapear eventos para FullCalendar y guardar para análisis
      const eventosParaCalendar = eventos.map(e => ({
        title: `${e.concurso} - ${e.tipo}`,
        start: e.fecha || e.fecha_inicio,
        end: e.fecha_fin ? new Date(new Date(e.fecha_fin).getTime() + 86400000).toISOString().split('T')[0] : undefined,
        allDay: true,
        color: coloresPorTipo[e.tipo] || '#3788d8',
        raw: e // guardamos el objeto original para mostrar en choques
      }));

      // Detectar choques
      const choques = [];
      for (let i = 0; i < eventosParaCalendar.length; i++) {
        for (let j = i + 1; j < eventosParaCalendar.length; j++) {
          if (haySolapamiento(eventosParaCalendar[i], eventosParaCalendar[j])) {
            choques.push([eventosParaCalendar[i], eventosParaCalendar[j]]);
          }
        }
      }

      // Mostrar resumen de choques
      const avisosDiv = document.getElementById('avisos');
      if (choques.length > 0) {
        avisosDiv.innerHTML = `<h3>Eventos con fechas que se superponen:</h3>`;
        const ul = document.createElement('ul');
        choques.forEach(pair => {
          const [e1, e2] = pair;
          ul.innerHTML += `<li><b>${e1.title}</b> (del ${e1.start}${e1.end ? ' al ' + e1.end : ''}) 
            se superpone con <b>${e2.title}</b> (del ${e2.start}${e2.end ? ' al ' + e2.end : ''})</li>`;
          console.warn(`Choque entre: "${e1.title}" y "${e2.title}"`);
        });
        avisosDiv.appendChild(ul);
      } else {
        avisosDiv.innerHTML = `<p>No se detectaron eventos con fechas superpuestas.</p>`;
      }

      // Inicializar calendario
      const calendarEl = document.getElementById('calendar');
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek'
        },
        events: eventosParaCalendar
      });
      calendar.render();
    })
    .catch(error => console.error('Error cargando los eventos:', error));
});
