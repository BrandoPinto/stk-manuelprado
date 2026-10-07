import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NOMBRE_ESTACA } from './constants'

export function formatFechaPrograma(fecha) {
  const label = format(new Date(`${fecha}T00:00:00`), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Filas (etiqueta, valor) del cuerpo del programa, en orden.
 * Preside y Dirige van aparte, en el encabezado.
 * Relevos y sostenimientos solo aparecen si están habilitados (no nulos).
 */
export function filasPrograma(p) {
  const filas = [
    ['1er himno', p.himno_inicial],
    ['1era oración', p.primera_oracion],
    ['Pensamiento del Ven, Sígueme', p.pensamiento],
    ['Anuncios', p.anuncios],
    ...(p.tiempos ?? []).map((t, i) => [`Tiempo ${i + 1}`, t]),
  ]
  if (p.relevos != null) filas.push(['Relevos', p.relevos, true])
  if (p.sostenimientos != null) filas.push(['Sostenimientos', p.sostenimientos, true])
  filas.push(['Última oración', p.ultima_oracion])
  return filas
}

// Paleta (RGB)
const VERDE = [21, 101, 58]
const TEXTO = [35, 38, 48]
const GRIS = [103, 114, 140]
const GRIS_CLARO = [170, 176, 190]
const LINEA = [222, 226, 233]
const FONDO = [244, 247, 245]

/** Genera y descarga el programa en PDF (jsPDF se carga solo al exportar). */
export async function exportarProgramaPdf(programa) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ancho = doc.internal.pageSize.getWidth()
  const alto = doc.internal.pageSize.getHeight()
  const margen = 22
  const anchoUtil = ancho - margen * 2
  const etiquetaW = 46
  const valorX = margen + etiquetaW + 6
  const valorW = anchoUtil - etiquetaW - 6
  const limiteY = alto - 24
  const interlineado = 5.6

  const color = (c) => doc.setTextColor(c[0], c[1], c[2])
  const lineas = (texto, w, size = 11.5, font = 'helvetica', estilo = 'normal') => {
    doc.setFont(font, estilo)
    doc.setFontSize(size)
    return doc.splitTextToSize(texto, w)
  }
  const vacio = (v) => !(v ?? '').trim()

  // ---------- Encabezado (primera página) ----------
  doc.setFillColor(...VERDE)
  doc.rect(0, 0, ancho, 9, 'F')

  let y = 27
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  color(GRIS)
  doc.text(NOMBRE_ESTACA.toUpperCase(), ancho / 2, y, { align: 'center', charSpace: 1.2 })
  y += 10

  color(TEXTO)
  lineas(programa.tipo, anchoUtil, 23, 'times', 'bold').forEach((l) => {
    doc.text(l, ancho / 2, y, { align: 'center' })
    y += 9.5
  })

  y += 1
  doc.setDrawColor(...VERDE)
  doc.setLineWidth(0.7)
  doc.line(ancho / 2 - 16, y, ancho / 2 + 16, y)
  y += 8

  doc.setFont('times', 'italic')
  doc.setFontSize(13)
  color(GRIS)
  doc.text(formatFechaPrograma(programa.fecha), ancho / 2, y, { align: 'center' })
  y += 12

  // ---------- Preside / Dirige ----------
  const colW = (anchoUtil - 8 - 12) / 2
  const presideL = lineas(vacio(programa.preside) ? '—' : programa.preside.trim(), colW, 12.5, 'helvetica', 'bold')
  const dirigeL = lineas(vacio(programa.dirige) ? '—' : programa.dirige.trim(), colW, 12.5, 'helvetica', 'bold')
  const nLineas = Math.max(presideL.length, dirigeL.length)
  const altoBloque = 15 + nLineas * 5.6

  doc.setFillColor(...FONDO)
  doc.setDrawColor(...LINEA)
  doc.setLineWidth(0.3)
  doc.roundedRect(margen, y, anchoUtil, altoBloque, 2, 2, 'FD')
  doc.setFillColor(...VERDE)
  doc.rect(margen, y + 2, 1.2, altoBloque - 4, 'F')

  const bloque = (x, etiqueta, ls, vacioFlag) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    color(GRIS)
    doc.text(etiqueta.toUpperCase(), x, y + 7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12.5)
    color(vacioFlag ? GRIS_CLARO : TEXTO)
    ls.forEach((l, i) => doc.text(l, x, y + 13 + i * 5.6))
  }
  bloque(margen + 8, 'Preside', presideL, vacio(programa.preside))
  bloque(margen + 8 + colW + 12, 'Dirige', dirigeL, vacio(programa.dirige))
  y += altoBloque + 10

  // ---------- Cuerpo ----------
  const nuevaPagina = () => {
    doc.addPage()
    doc.setFillColor(...VERDE)
    doc.rect(0, 0, ancho, 4, 'F')
    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    color(GRIS)
    doc.text(`${programa.tipo} · ${formatFechaPrograma(programa.fecha)}`, margen, 18)
    doc.setDrawColor(...LINEA)
    doc.setLineWidth(0.3)
    doc.line(margen, 21, margen + anchoUtil, 21)
    y = 30
  }

  filasPrograma(programa).forEach(([etiqueta, valor, destacada]) => {
    const sinValor = vacio(valor)
    const ls = lineas(sinValor ? '—' : valor.trim(), valorW)
    const etiquetaLs = lineas(etiqueta.toUpperCase(), etiquetaW, 8.5, 'helvetica', 'bold')
    const alturaTexto = Math.max(ls.length * interlineado, etiquetaLs.length * 4.2)
    const altura = alturaTexto + 7

    // Una fila larga puede partirse entre páginas; las cortas nunca
    if (y + Math.min(altura, 30) > limiteY) nuevaPagina()

    doc.setDrawColor(...LINEA)
    doc.setLineWidth(0.3)
    doc.line(margen, y, margen + anchoUtil, y)

    // Etiqueta
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    color(destacada ? VERDE : GRIS)
    etiquetaLs.forEach((l, i) => doc.text(l, margen, y + 6.6 + i * 4.2))

    // Valor (puede continuar en la página siguiente)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11.5)
    color(sinValor ? GRIS_CLARO : TEXTO)
    let yy = y + 6.6
    ls.forEach((l) => {
      if (yy > limiteY) {
        nuevaPagina()
        yy = y + 6.6
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11.5)
        color(TEXTO)
      }
      doc.text(l, valorX, yy)
      yy += interlineado
    })
    y = Math.max(yy - interlineado + 5, y + altura)
  })

  doc.setDrawColor(...LINEA)
  doc.setLineWidth(0.3)
  doc.line(margen, y, margen + anchoUtil, y)

  // ---------- Pie de página ----------
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(...LINEA)
    doc.setLineWidth(0.3)
    doc.line(margen, alto - 16, margen + anchoUtil, alto - 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    color(GRIS_CLARO)
    doc.text(NOMBRE_ESTACA, margen, alto - 11)
    doc.text(`Página ${i} de ${total}`, margen + anchoUtil, alto - 11, { align: 'right' })
  }

  const nombre = `${programa.tipo} ${programa.fecha}`.replace(/[^\p{L}\p{N}]+/gu, '_')
  doc.save(`${nombre}.pdf`)
}
