export const CORES = {
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-300',  text: 'text-indigo-700',  badge: 'bg-indigo-500',  btn: 'bg-indigo-600 hover:bg-indigo-700',  dot: 'bg-indigo-500',  label: 'Índigo' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', dot: 'bg-emerald-500', label: 'Verde' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',   badge: 'bg-amber-500',   btn: 'bg-amber-600 hover:bg-amber-700',   dot: 'bg-amber-500',   label: 'Âmbar' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-700',    badge: 'bg-rose-500',    btn: 'bg-rose-600 hover:bg-rose-700',    dot: 'bg-rose-500',    label: 'Rosa' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-700',  badge: 'bg-violet-500',  btn: 'bg-violet-600 hover:bg-violet-700',  dot: 'bg-violet-500',  label: 'Violeta' },
  cyan:    { bg: 'bg-cyan-50',    border: 'border-cyan-300',    text: 'text-cyan-700',    badge: 'bg-cyan-500',    btn: 'bg-cyan-600 hover:bg-cyan-700',    dot: 'bg-cyan-500',    label: 'Ciano' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-700',    badge: 'bg-blue-500',    btn: 'bg-blue-600 hover:bg-blue-700',    dot: 'bg-blue-500',    label: 'Azul' },
  green:   { bg: 'bg-green-50',   border: 'border-green-300',   text: 'text-green-700',   badge: 'bg-green-500',   btn: 'bg-green-600 hover:bg-green-700',   dot: 'bg-green-500',   label: 'Verde Escuro' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-700',  badge: 'bg-orange-500',  btn: 'bg-orange-600 hover:bg-orange-700',  dot: 'bg-orange-500',  label: 'Laranja' },
  red:     { bg: 'bg-red-50',     border: 'border-red-300',     text: 'text-red-700',     badge: 'bg-red-500',     btn: 'bg-red-600 hover:bg-red-700',     dot: 'bg-red-500',     label: 'Vermelho' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-300',  text: 'text-purple-700',  badge: 'bg-purple-500',  btn: 'bg-purple-600 hover:bg-purple-700',  dot: 'bg-purple-500',  label: 'Roxo' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-300',    text: 'text-teal-700',    badge: 'bg-teal-500',    btn: 'bg-teal-600 hover:bg-teal-700',    dot: 'bg-teal-500',    label: 'Teal' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-300',    text: 'text-pink-700',    badge: 'bg-pink-500',    btn: 'bg-pink-600 hover:bg-pink-700',    dot: 'bg-pink-500',    label: 'Pink' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-700',     badge: 'bg-sky-500',     btn: 'bg-sky-600 hover:bg-sky-700',     dot: 'bg-sky-500',     label: 'Céu' },
}

export const CORES_LISTA = Object.entries(CORES).map(([key, val]) => ({ key, ...val }))

export const getCor = (key) => CORES[key] || CORES.indigo
