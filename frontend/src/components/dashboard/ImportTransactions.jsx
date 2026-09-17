import { useRef, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Card } from '../ui/Card.jsx'
import { transactionService } from '../../services/api.js'

const HEADER_ALIASES = {
  date:        ['fecha', 'date', 'transaction_date', 'fecha_transaccion'],
  amount:      ['monto', 'valor', 'amount', 'importe'],
  debit:       ['debito', 'debit', 'gasto', 'egreso'],
  credit:      ['credito', 'credit', 'ingreso'],
  type:        ['tipo', 'type', 'naturaleza'],
  description: ['descripcion', 'description', 'concepto', 'detalle'],
  category:    ['categoria', 'category']
}

const normalize = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()
  .replace(/[\s-]+/g, '_')

const findValue = (row, aliases) => {
  const key = Object.keys(row).find(header => aliases.includes(normalize(header)))
  return key ? row[key] : ''
}

const hasValue = value => value !== '' && value !== null && value !== undefined

const parseAmount = value => {
  if (typeof value === 'number') return value

  let clean = String(value ?? '').trim()
  const negative = clean.startsWith('-') || /^\(.*\)$/.test(clean)
  clean = clean.replace(/[^\d.,]/g, '')

  const lastComma = clean.lastIndexOf(',')
  const lastDot = clean.lastIndexOf('.')

  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.'
    const thousands = decimal === ',' ? /\./g : /,/g
    clean = clean.replace(thousands, '').replace(decimal, '.')
  } else if (lastComma >= 0) {
    const decimals = clean.length - lastComma - 1
    clean = decimals > 0 && decimals <= 2 ? clean.replace(',', '.') : clean.replace(/,/g, '')
  } else if (lastDot >= 0) {
    const dots = (clean.match(/\./g) || []).length
    const decimals = clean.length - lastDot - 1
    if (dots > 1 || decimals === 3) clean = clean.replace(/\./g, '')
  }

  const amount = Number(clean)
  if (!Number.isFinite(amount)) return NaN
  return negative ? -amount : amount
}

const isValidDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const parseDate = value => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'number') {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000)
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
  }

  const text = String(value ?? '').trim()
  if (isValidDate(text)) return text

  const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (match) {
    const [, day, month, year] = match
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    return isValidDate(date) ? date : null
  }

  return null
}

const parseType = value => {
  const type = normalize(value)
  if (['income', 'ingreso', 'credito', 'credit', 'abono'].includes(type)) return 'income'
  if (['expense', 'gasto', 'egreso', 'debito', 'debit', 'cargo'].includes(type)) return 'expense'
  return null
}

const parseRow = (row, index) => {
  const debit = findValue(row, HEADER_ALIASES.debit)
  const credit = findValue(row, HEADER_ALIASES.credit)
  const rawAmount = hasValue(debit) ? debit : hasValue(credit) ? credit : findValue(row, HEADER_ALIASES.amount)
  const parsedAmount = parseAmount(rawAmount)
  const date = parseDate(findValue(row, HEADER_ALIASES.date))
  const explicitType = parseType(findValue(row, HEADER_ALIASES.type))
  const type = hasValue(debit)
    ? 'expense'
    : hasValue(credit)
      ? 'income'
      : explicitType || (parsedAmount < 0 ? 'expense' : null)

  const errors = []
  if (!date) errors.push('fecha inválida')
  if (!Number.isFinite(parsedAmount) || parsedAmount === 0) errors.push('monto inválido')
  if (!type) errors.push('tipo sin reconocer')

  if (errors.length) {
    return { error: `Fila ${index + 2}: ${errors.join(', ')}` }
  }

  return {
    transaction: {
      transaction_date: date,
      amount: Math.abs(parsedAmount),
      type,
      description: String(findValue(row, HEADER_ALIASES.description) || 'Movimiento importado').trim(),
      category_name: String(findValue(row, HEADER_ALIASES.category) || '').trim() || undefined
    }
  }
}

export const ImportTransactions = ({ onImported }) => {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [transactions, setTransactions] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const readCsv = async file => {
    const module = await import('papaparse')
    const Papa = module.default || module

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: result => result.errors.length ? reject(new Error(result.errors[0].message)) : resolve(result.data),
        error: reject
      })
    })
  }

  const readExcel = async file => {
    const { default: readXlsxFile } = await import('read-excel-file')
    const grid = await readXlsxFile(file)
    if (!grid.length) return []

    const [headers, ...data] = grid
    return data
      .filter(row => row.some(hasValue))
      .map(row => Object.fromEntries(headers.map((header, index) => [String(header || ''), row[index] ?? ''])))
  }

  const selectFile = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setFileName(file.name)
    setTransactions([])
    setErrors([])
    setMessage('')

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      const rows = extension === 'csv' ? await readCsv(file) : await readExcel(file)

      if (!rows.length) {
        setErrors(['El archivo está vacío o no tiene una fila de encabezados.'])
        return
      }

      const parsed = rows.map(parseRow)
      const valid = parsed.flatMap(item => item.transaction ? [item.transaction] : [])
      const invalid = parsed.flatMap(item => item.error ? [item.error] : [])

      if (valid.length > 1000) {
        setErrors([`El archivo tiene ${valid.length} filas válidas. El máximo permitido por importación es 1000.`])
        return
      }

      setTransactions(valid)
      setErrors(invalid)
    } catch {
      setErrors(['No se pudo leer el archivo. Verifica que sea CSV o XLSX.'])
    }
  }

  const importFile = async () => {
    try {
      setLoading(true)
      setMessage('')
      const { data } = await transactionService.importMany(transactions)
      const result = data.data
      setMessage(`${result.imported} movimientos guardados${result.uncategorized ? ` · ${result.uncategorized} sin categoría` : ''}.`)
      setTransactions([])
      setErrors([])
      setFileName('')
      await onImported?.()
    } catch (error) {
      setErrors([error.response?.data?.message || 'No se pudieron importar los movimientos.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="fade-up-1 mb-6">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={selectFile}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-dim tracking-[1px] mb-1">IMPORTAR MOVIMIENTOS</div>
          <div className="text-sm text-muted">
            Carga tu historial desde CSV o Excel (.xlsx). Máximo 1000 filas por archivo.
          </div>
        </div>
        <Button variant="ghost" onClick={() => inputRef.current?.click()}>
          ↑ Cargar CSV o Excel
        </Button>
      </div>

      {fileName && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm text-white mb-2">{fileName}</div>
          <div className="text-xs text-muted mb-3">
            {transactions.length} filas listas
            {errors.length > 0 && ` · ${errors.length} filas con errores`}
          </div>

          {errors.length > 0 && (
            <div className="bg-danger/10 border border-danger/30 rounded-md p-3 mb-3 text-xs text-danger">
              {errors.slice(0, 5).map(error => <div key={error}>• {error}</div>)}
              {errors.length > 5 && <div>• Y {errors.length - 5} errores más</div>}
            </div>
          )}

          {transactions.length > 0 && (
            <Button loading={loading} onClick={importFile}>
              Guardar {transactions.length} movimientos
            </Button>
          )}
        </div>
      )}

      {message && <div className="mt-4 text-sm text-success">✓ {message}</div>}

      <div className="mt-3 text-[11px] text-dim">
        Columnas: fecha, monto, tipo (ingreso/gasto), descripción y categoría. También acepta columnas débito y crédito.
      </div>
    </Card>
  )
}
