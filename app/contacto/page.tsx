import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata = {
  title: "Contacto | BibliotecaHub",
  description: "Ponte en contacto con el equipo de BibliotecaHub",
}

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold mb-6">Contacto</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Estamos aquí para ayudarte. Completa el formulario o utiliza cualquiera de nuestros canales de contacto y
              te responderemos a la brevedad posible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Correo Electrónico</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:info@bibliotecahub.com" className="hover:text-primary">
                      cia@uabc.edu.mx
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Teléfono</h3>
                  <p className="text-muted-foreground">(686) 551-82-70</p>
                  <p className="text-sm text-muted-foreground">Lunes a Viernes, 9:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Dirección</h3>
                  <p className="text-muted-foreground">
                    Blvd Universitario 1000
                    <br />
                    Unidad Valle de Las Palmas, 22260 Tijuana, B.C.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Horario de Atención</h3>
                  <p className="text-muted-foreground">
                    Lunes a Viernes: 9:00 - 20:00
                    <br />
                    Sábados: 10:00 - 14:00
                    <br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario a continuación y nos pondremos en contacto contigo lo antes posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nombre" className="text-sm font-medium">
                      Nombre
                    </label>
                    <Input id="nombre" placeholder="Tu nombre" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="apellido" className="text-sm font-medium">
                      Apellido
                    </label>
                    <Input id="apellido" placeholder="Tu apellido" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico
                  </label>
                  <Input id="email" type="email" placeholder="tu@email.com" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="asunto" className="text-sm font-medium">
                    Asunto
                  </label>
                  <Input id="asunto" placeholder="¿En qué podemos ayudarte?" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mensaje" className="text-sm font-medium">
                    Mensaje
                  </label>
                  <Textarea id="mensaje" placeholder="Escribe tu mensaje aquí..." rows={5} required />
                </div>

                <Button type="submit" className="w-full">
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <div className="rounded-lg overflow-hidden h-[400px] border border-border/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3367.3918302584693!2d-116.6754024!3d32.4354452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d910e90f3446a9%3A0xf000d2603ee1eece!2sFacultad%20de%20Ciencias%20de%20la%20Ingenier%C3%ADa%20y%20Tecnolog%C3%ADa!5e0!3m2!1ses!2smx!4v1747640583240!5m2!1ses!2smx"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de BibliotecaHub"
              aria-label="Mapa mostrando la ubicación de BibliotecaHub"
            ></iframe>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
