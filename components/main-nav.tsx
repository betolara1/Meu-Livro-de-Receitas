"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Search, Heart, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileNav } from "./mobile-nav"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/buscar", label: "Buscar", icon: Search },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
  ]

  return (
    <header className="border-b border-border bg-card book-page sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/" className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Meu Livro de Receitas</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 mr-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            <Link href="/nova-receita">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Receita</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
