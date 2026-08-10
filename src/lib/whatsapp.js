import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatHora } from './constants'

/**
 * Arma el texto de la agenda del día, agrupado por presidente,
 * listo para pegar en WhatsApp (usa su sintaxis: *negrita*, _cursiva_).
 */
export function construirTextoAgendaWhatsApp(fecha, presidentes, citasPorPresidente) {
  const dateObj = new Date(`${fecha}T00:00:00`)
  const labelFecha = format(dateObj, "EEEE dd 'de' MMMM", { locale: es })
  const labelFechaCap = labelFecha.charAt(0).toUpperCase() + labelFecha.slice(1)

  const lineas = [`📋 *Agenda de entrevistas*`, `🗓️ ${labelFechaCap}`, '']

  presidentes.forEach((presidente) => {
    const citas = [...citasPorPresidente(presidente.id)].sort((a, b) =>
      formatHora(a.hora).localeCompare(formatHora(b.hora))
    )

    lineas.push(`👤 *${presidente.nombre}*`)

    if (citas.length === 0) {
      lineas.push('_Sin citas agendadas_')
    } else {
      citas.forEach((c) => {
        const modalidadLabel = c.modalidad === 'virtual' ? 'Virtual' : 'Presencial'
        let linea = `🕐 ${formatHora(c.hora)} – ${c.nombre_persona}`
        if (c.barrio) linea += ` (${c.barrio})`
        linea += ` · ${modalidadLabel}`
        if (c.modalidad === 'virtual' && c.celular) linea += ` ${c.celular}`
        lineas.push(linea)
        if (c.motivo) lineas.push(`     ${c.motivo}`)
      })
    }

    lineas.push('')
  })

  return lineas.join('\n').trim()
}

/**
 * Copia texto al portapapeles, con fallback para navegadores/webviews
 * sin soporte de la Clipboard API.
 */
export async function copiarAlPortapapeles(texto) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto)
      return
    } catch {
      // sigue al fallback
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = texto
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
