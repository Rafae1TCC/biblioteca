import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Clock, Award, BookMarked, GraduationCap } from "lucide-react"

export const metadata = {
  title: "Sobre Nosotros | BibliotecaHub",
  description: "Conoce más sobre BibliotecaHub y nuestra misión",
}

export default function SobreNosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Sobre BibliotecaHub</h1>
              <p className="text-xl text-muted-foreground">Conectando lectores con el conocimiento desde 2022</p>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Nuestra Misión</h2>
                <p className="text-muted-foreground mb-4">
                  En BibliotecaHub, nuestra misión es democratizar el acceso al conocimiento y fomentar el amor por la
                  lectura en nuestra comunidad. Creemos que el acceso a los libros y recursos educativos es un derecho
                  fundamental que enriquece vidas y fortalece sociedades.
                </p>
                <p className="text-muted-foreground">
                  Nos esforzamos por crear un espacio acogedor donde los lectores de todas las edades puedan descubrir,
                  explorar y compartir ideas a través de nuestra extensa colección de libros y recursos digitales.
                </p>
              </div>
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/uabc-edificio.jpg"
                  alt="Nuestra biblioteca"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Nuestros Valores</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Accesibilidad</h3>
                    <p className="text-muted-foreground">
                      Creemos que el conocimiento debe ser accesible para todos, independientemente de su origen o
                      circunstancias.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Comunidad</h3>
                    <p className="text-muted-foreground">
                      Fomentamos un sentido de pertenencia y conexión entre nuestros usuarios, creando espacios para
                      compartir ideas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Excelencia</h3>
                    <p className="text-muted-foreground">
                      Nos esforzamos por ofrecer servicios de la más alta calidad y mantener una colección diversa y
                      actualizada.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <BookMarked className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Diversidad</h3>
                    <p className="text-muted-foreground">
                      Valoramos la diversidad de perspectivas y nos comprometemos a ofrecer recursos que representen
                      múltiples voces.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Innovación</h3>
                    <p className="text-muted-foreground">
                      Adoptamos nuevas tecnologías y enfoques para mejorar continuamente la experiencia de nuestros
                      usuarios.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Aprendizaje</h3>
                    <p className="text-muted-foreground">
                      Promovemos el aprendizaje continuo y el desarrollo personal a través de nuestros recursos y
                      programas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Nuestra Historia</h2>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  BibliotecaHub nació en 2022 con la visión de transformar la experiencia tradicional de biblioteca
                  mediante la integración de tecnología moderna y servicios centrados en el usuario. Lo que comenzó como
                  un pequeño proyecto local ha crecido hasta convertirse en una plataforma integral que sirve a miles de
                  lectores.
                </p>
                <p className="text-muted-foreground">
                  Fundada por un grupo de bibliotecarios y desarrolladores apasionados, BibliotecaHub surgió de la
                  necesidad de hacer que los recursos bibliotecarios fueran más accesibles en la era digital. Nuestra
                  primera versión se lanzó con una colección modesta de 5,000 libros y una interfaz básica.
                </p>
                <p className="text-muted-foreground">
                  A lo largo de los años, hemos expandido nuestra colección a más de 50,000 títulos, implementado
                  sistemas avanzados de gestión de préstamos, y desarrollado funcionalidades que facilitan la
                  exploración y descubrimiento de nuevos libros. Hoy, BibliotecaHub es reconocida como una de las
                  bibliotecas digitales más innovadoras, combinando lo mejor de la tradición bibliotecaria con la
                  tecnología moderna.
                </p>
                <p className="text-muted-foreground">
                  Nuestro compromiso con la comunidad sigue siendo el núcleo de todo lo que hacemos, y continuamos
                  evolucionando para satisfacer las necesidades cambiantes de nuestros usuarios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Nuestro Equipo</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Emmanuel Gomez",
                  role: "Director",
                  image: "El mero boss",
                },
                {
                  name: "Dali Leonardo",
                  role: "Jefe de Desarrollo",
                  image: "El leo",
                },
                {
                  name: "Rafael Cabrera",
                  role: "Jefe de mejora continua",
                  image: "El Rafa",
                },
              ].map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={`/abstract-geometric-shapes.png?height=128&width=128&query=${member.image}`}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
