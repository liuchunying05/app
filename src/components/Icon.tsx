/**
 * 文件名: src/components/Icon.tsx
 * 分类: 通用组件
 * 作用: 渲染 public/icon 目录下的 SVG 图标
 */
type IconProps = {
  name: string
  size?: number
  alt?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 24, alt = '', style }: IconProps) {
  return <img src={`/icon/${name}.svg`} width={size} height={size} alt={alt} style={style} />
}

export default Icon


