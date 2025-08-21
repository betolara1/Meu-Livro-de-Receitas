"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BookOpen, Search, Heart, Plus, Menu, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/buscar", label: "Buscar", icon: Search },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/nova-receita", label: "Nova Receita", icon: Plus },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 book-page">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Meu Livro de Receitas</h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-12">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">Seu livro de receitas digital personalizado</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
