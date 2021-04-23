export interface Reference<T = any> {
  recordId: string
  contentType: string
  peerId?: string
  record?: T
  peer?: any
}
