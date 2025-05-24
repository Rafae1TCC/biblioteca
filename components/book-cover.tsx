import Image from "next/image"

interface BookCoverProps {
  imageUrl: string | null
  title: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
}

export function BookCover({
  imageUrl,
  title,
  width = 300,
  height = 450,
  priority = false,
  className = "",
}: BookCoverProps) {
  const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(`Portada de ${title}`)}`
  const finalImageUrl = imageUrl || placeholderUrl

  // Determinar si la imagen es local o externa
  const isLocalImage = finalImageUrl.startsWith("/") || finalImageUrl.startsWith("data:")

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`} style={{ aspectRatio: "2/3" }}>
      {isLocalImage ? (
        <Image
          src={finalImageUrl || "/placeholder.svg"}
          alt={`Portada de ${title}`}
          fill
          className="object-cover"
          priority={priority}
        />
      ) : (
        <img
          src={finalImageUrl || "/placeholder.svg"}
          alt={`Portada de ${title}`}
          className="object-cover w-full h-full"
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  )
}
