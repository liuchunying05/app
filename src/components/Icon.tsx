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


