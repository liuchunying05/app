/**
 * 文件名: src/utils/weather.ts
 * 分类: 工具方法
 * 作用: 天气相关的工具函数或数据映射，供页面/组件调用。
 */
// WMO 天气代码到中文描述的简要映射
export function wmoToZhDesc(code?: number): string | undefined {
  if (code == null) return undefined
  if (code === 0) return '晴'
  if ([1].includes(code)) return '多云'
  if ([2, 3].includes(code)) return '阴'
  if ([45, 48].includes(code)) return '雾'
  if ([51, 53, 55].includes(code)) return '毛毛雨'
  if ([61, 63, 65].includes(code)) return '小/中/大雨'
  if ([66, 67].includes(code)) return '冻雨'
  if ([71, 73, 75].includes(code)) return '小/中/大雪'
  if ([77].includes(code)) return '雪粒'
  if ([80, 81, 82].includes(code)) return '阵雨'
  if ([85, 86].includes(code)) return '阵雪'
  if ([95, 96, 99].includes(code)) return '雷暴'
  return '多云'
}


