/**
 * 文件名: src/components/TabBar.tsx
 * 分类: 布局组件
 * 作用: 底部导航栏，承载主要页面切换
 */
import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

export function TabBar() {
  return (
    <nav className="app-tab-bar">
      <Tab to="/" label="首页" icon="tab-home" activeIcon="tab-home-active" />
      <Tab to="/friend" label="好友" icon="tab-friend" activeIcon="tab-friend-active" />
      <Tab to="/moment" label="动态" icon="tab-moment" activeIcon="tab-moment-active" />   
      <Tab to="/me" label="我的" icon="tab-me" activeIcon="tab-me-active" />
    </nav>
  )
}

function Tab({ to, label, icon, activeIcon }: { to: string; label: string; icon: string; activeIcon?: string }) {
  return (
    <NavLink
      to={to}
      className="touch-feedback"
      style={({ isActive }) => ({
        color: isActive ? '#1677ff' : '#333',
        textDecoration: 'none',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px',
        borderRadius: 8,
        minWidth: 60,
        justifyContent: 'center'
      })}
      end
    >
      {({ isActive }) => (
        <>
          <Icon name={isActive && activeIcon ? activeIcon : icon} size={24} alt={label} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default TabBar

