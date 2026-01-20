import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-primary-100 bg-white shadow-elegant">
        <div className="container mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Пума-Каратэ</h1>
                <p className="text-sm font-semibold text-primary-600">Спортивный центр</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/auth')}
                className="px-6 py-2.5 bg-white border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Вход
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <section className="relative bg-gradient-to-br from-white via-red-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23dc2626%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        </div>
        <div className="container mx-auto px-8 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Информационная система
                <span className="block text-primary-600 mt-2">спортивного центра</span>
              </h1>
              
              <p className="text-xl text-gray-700 mb-12 leading-relaxed font-medium">
                Профессиональное решение для управления тренировочным процессом, 
                организации соревнований и ведения электронного журнала
              </p>
              
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-10 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-elegant-lg hover:shadow-xl transform hover:scale-105"
                >
                  Начать работу
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary-500 font-bold text-xl">ПК</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Пума-Каратэ</h3>
                  <p className="text-gray-400">Спортивный центр</p>
                </div>
              </div>
              <p className="text-gray-400">
                Профессиональная система управления спортивным центром
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}