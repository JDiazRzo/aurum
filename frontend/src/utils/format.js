export const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(new Date(date))

export const currentMonth = () => new Date().getMonth() + 1
export const currentYear  = () => new Date().getFullYear()

export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
