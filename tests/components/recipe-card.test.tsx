import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecipeCard } from '@/components/recipe-card'
import React from 'react'

// Mock de Next/Link
vi.mock('next/link', () => {
    return {
        default: ({ children, href }: { children: React.ReactNode, href: string }) => {
            return <a href={href}>{children}</a>
        },
    }
})

const mockRecipe = {
    id: '1',
    title: 'Bolo de Cenoura',
    description: 'Um bolo delicioso de cenoura com cobertura de chocolate.',
    image: '/bolo.jpg',
    prepTime: '20min',
    cookTime: '40min',
    totalTime: '1h',
    servings: 8,
    difficulty: 'Fácil',
    rating: 4.5,
    category: 'Sobremesas',
    tags: ['doce', 'chocolate', 'caseiro'],
    isFavorite: true,
}

describe('RecipeCard Component', () => {
    it('should render the recipe title', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        expect(screen.getByText('Bolo de Cenoura')).toBeDefined()
    })

    it('should render the recipe description', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        expect(screen.getByText(mockRecipe.description)).toBeDefined()
    })

    it('should render the number of servings', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        expect(screen.getByText('8 porções')).toBeDefined()
    })

    it('should render the rating', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        expect(screen.getByText('4.5')).toBeDefined()
    })

    it('should render the first two tags', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        expect(screen.getByText('doce')).toBeDefined()
        expect(screen.getByText('chocolate')).toBeDefined()
    })
})
