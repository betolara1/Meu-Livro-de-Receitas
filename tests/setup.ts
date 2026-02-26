import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de variáveis de ambiente
process.env.DB_HOST = 'localhost'
process.env.DB_USER = 'root'
process.env.DB_PASSWORD = ''
process.env.DB_NAME = 'test_db'
