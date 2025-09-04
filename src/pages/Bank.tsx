import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

type ExpenseItem = {
  id: string
  name: string
  amount: number // 正数表示支出
  date: string // ISO 日期
}

const STORAGE_KEYS = {
  balance: 'bank:balance',
  expenses: 'bank:expenses',
}

export default function BankPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number>(() => {
    const v = localStorage.getItem(STORAGE_KEYS.balance)
    return v ? Number(v) : NaN
  })
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const v = localStorage.getItem(STORAGE_KEYS.expenses)
    try {
      return v ? JSON.parse(v) : []
    } catch {
      return []
    }
  })
  const [showInit, setShowInit] = useState<boolean>(() => isNaN(balance))
  const [initInput, setInitInput] = useState<string>('')

  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addAmount, setAddAmount] = useState('')
  const [editing, setEditing] = useState<ExpenseItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses))
  }, [expenses])


  const monthSpent = useMemo(() => {
    const m = dayjs().format('YYYY-MM')
    return expenses.filter(it => it.date.startsWith(m)).reduce((s, it) => s + it.amount, 0)
  }, [expenses])

  const weekSpent = useMemo(() => {
    const start = dayjs().startOf('week')
    const end = dayjs().endOf('week')
    return expenses.filter(it => dayjs(it.date).isAfter(start.subtract(1,'millisecond')) && dayjs(it.date).isBefore(end.add(1,'millisecond'))).reduce((s, it) => s + it.amount, 0)
  }, [expenses])

  const todaySpent = useMemo(() => {
    const d = dayjs().format('YYYY-MM-DD')
    return expenses.filter(it => it.date.startsWith(d)).reduce((s, it) => s + it.amount, 0)
  }, [expenses])

  function handleInitSubmit() {
    const n = Number(initInput)
    if (!isFinite(n) || n < 0) return alert('请输入有效的初始余额')
    setBalance(n)
    localStorage.setItem(STORAGE_KEYS.balance, String(n))
    setShowInit(false)
  }

  function handleAddExpense() {
    setShowAdd(true)
  }

  function saveAdd() {
    const n = Number(addAmount)
    if (!addName.trim()) return alert('请输入名称')
    if (!isFinite(n) || n <= 0) return alert('请输入有效的花费金额')
    const item: ExpenseItem = {
      id: `${Date.now()}`,
      name: addName.trim(),
      amount: n,
      date: dayjs().format('YYYY-MM-DD HH:mm'),
    }
    setExpenses(prev => [item, ...prev])
    setAddName('')
    setAddAmount('')
    setShowAdd(false)
  }

  function cancelAdd() {
    setShowAdd(false)
  }

  // 剩餘總額：僅用於統計展示時可擴展，目前列表逐條按「餘額 - 該筆金額」計算

  function openEdit(item: ExpenseItem) {
    setEditing(item)
    setEditName(item.name)
    setEditAmount(String(item.amount))
    setEditDate(item.date)
  }

  function saveEdit() {
    if (!editing) return
    const n = Number(editAmount)
    if (!editName.trim()) return alert('请输入名称')
    if (!isFinite(n) || n <= 0) return alert('请输入有效的花费金额')
    const newItem: ExpenseItem = { ...editing, name: editName.trim(), amount: n, date: editDate || editing.date }
    setExpenses(prev => prev.map(it => it.id === editing.id ? newItem : it))
    setEditing(null)
  }

  function cancelEdit() {
    setEditing(null)
  }

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginRight: 16 }}>
            <Icon name="ic-back" size={20} alt="返回" />
          </button>
          <div style={{ fontSize: 16, fontWeight: 600 }}>存钱罐</div>
        </div>
        <button onClick={handleAddExpense} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <Icon name="ic-add" size={20} alt="添加" />
        </button>
      </header>

      {/* 顶部统计 */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard title="总金额" value={isNaN(balance) ? '-' : balance.toFixed(2)} highlight />
        <StatCard title="本月花费" value={monthSpent.toFixed(2)} />
        <StatCard title="本周花费" value={weekSpent.toFixed(2)} />
        <StatCard title="当天花费" value={todaySpent.toFixed(2)} />
      </section>

      {/* 新增弹层 */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '86%', maxWidth: 440, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>新增支出</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="名称" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }} />
              <input value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="花费金额" inputMode="decimal" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={cancelAdd} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>取消</button>
              <button onClick={saveAdd} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#1677ff', color: '#fff', cursor: 'pointer' }}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {expenses.length === 0 ? (
          <div style={{ color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 }}>暂无记录，添加一笔试试～</div>
        ) : (
          expenses.map(it => (
            <div key={it.id} onClick={() => openEdit(it)} style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{it.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, color: '#d32029', fontWeight: 600 }}>-¥{it.amount.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: '#666' }}>剩余：¥{((isNaN(balance) ? 0 : balance) - it.amount).toFixed(2)}</div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* 初始化余额弹层 */}
      {showInit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '86%', maxWidth: 420, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>设置初始余额</div>
            <input value={initInput} onChange={(e) => setInitInput(e.target.value)} placeholder="请输入金额" inputMode="decimal" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => navigate(-1)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>取消</button>
              <button onClick={handleInitSubmit} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#1677ff', color: '#fff', cursor: 'pointer' }}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑弹层 */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '86%', maxWidth: 440, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>编辑记录</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="名称" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }} />
              <input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="花费金额" inputMode="decimal" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }} />
              <input value={editDate} onChange={(e) => setEditDate(e.target.value)} placeholder="日期（如 2025-01-01 12:30）" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={cancelEdit} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>取消</button>
              <button onClick={saveEdit} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#1677ff', color: '#fff', cursor: 'pointer' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,.06)', textAlign: 'center', border: highlight ? '1px solid #1677ff' : undefined }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
    </div>
  )
}


