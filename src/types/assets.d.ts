interface StaticImageData {
  src: string
  width: number
  height: number
  blurDataURL?: string
  blurWidth?: number
  blurHeight?: number
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: StaticImageData
  export default content
}

declare module '*.jpg' {
  const content: StaticImageData
  export default content
}

declare module '*.jpeg' {
  const content: StaticImageData
  export default content
}

declare module '*.gif' {
  const content: StaticImageData
  export default content
}

declare module '*.ico' {
  const content: StaticImageData
  export default content
}

declare module '*.webp' {
  const content: StaticImageData
  export default content
}
