/**
 * Contenido de un programa para usarlo como base de uno nuevo:
 * se conserva todo salvo la fecha, que vuelve a ser la de hoy.
 */
export function plantillaDesde(programa) {
  return {
    tipo: programa.tipo,
    preside: programa.preside,
    dirige: programa.dirige,
    himno_inicial: programa.himno_inicial,
    primera_oracion: programa.primera_oracion,
    pensamiento: programa.pensamiento,
    anuncios: programa.anuncios,
    tiempos: [...(programa.tiempos ?? [])],
    relevos: programa.relevos,
    sostenimientos: programa.sostenimientos,
    ultima_oracion: programa.ultima_oracion,
  }
}
