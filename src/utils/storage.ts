export type Profile = {
  nickname?: string
  avatar?: string
}

export type Friend = {
  nickname?: string
  avatar?: string
}

export function getProfile(): Profile {
  return {
    nickname: localStorage.getItem('myNickname') || undefined,
    avatar: localStorage.getItem('myAvatar') || undefined,
  }
}

export function setProfile(patch: Partial<Profile>) {
  if (patch.nickname !== undefined) localStorage.setItem('myNickname', patch.nickname)
  if (patch.avatar !== undefined) localStorage.setItem('myAvatar', patch.avatar)
}

export function getFriend(): Friend {
  return {
    nickname: localStorage.getItem('friendNickname') || undefined,
    avatar: localStorage.getItem('friendAvatar') || undefined,
  }
}

export function setFriend(patch: Partial<Friend>) {
  if (patch.nickname !== undefined) localStorage.setItem('friendNickname', patch.nickname)
  if (patch.avatar !== undefined) localStorage.setItem('friendAvatar', patch.avatar)
}

export function getMetAt(): string | undefined {
  return localStorage.getItem('metAt') || undefined
}

export function setMetAt(dateISO: string) {
  localStorage.setItem('metAt', dateISO)
}


