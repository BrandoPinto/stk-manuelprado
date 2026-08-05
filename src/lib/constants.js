// Horarios disponibles por defecto para agendar entrevistas.
// Ajusta este arreglo según el horario real de tu estaca.
export const HORARIOS = [
  '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
]

export const DIAS_SEMANA_LABEL = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export const BARRIOS = [
  'Manuel Prado',
  'Mariano Melgar',
  'Alto Misti',
  '15 de Agosto',
  'Miraflores',
  'Ferroviarios',
]

export const PREFIJO_CELULAR = '+51'

export const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
]

export function formatHora(hora) {
  // hora viene como "HH:MM:SS" desde Supabase (tipo time)
  return hora?.slice(0, 5) ?? hora
}

/**
 * Día por defecto al abrir la Agenda: las entrevistas son los martes,
 * así que si hoy es martes se prioriza hoy; si no, el próximo martes.
 */
export function proximoDiaEntrevistas(desde = new Date()) {
  const dia = new Date(desde)
  const diasHastaMartes = (2 - dia.getDay() + 7) % 7
  dia.setDate(dia.getDate() + diasHastaMartes)
  return dia
}
