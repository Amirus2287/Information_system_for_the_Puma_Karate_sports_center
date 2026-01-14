import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Trophy, Calendar, Users, TrendingUp, Award } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Электронный журнал',
      description: 'Ведение подробных записей о тренировках и прогрессе учеников',
      color: 'bg-red-50 text-primary-600'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Соревнования',
      description: 'Организация и проведение спортивных соревнований',
      color: 'bg-red-50 text-primary-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Группы и тренировки',
      description: 'Управление группами и расписанием тренировок',
      color: 'bg-red-50 text-primary-600'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Аналитика',
      description: 'Детальная статистика и отчетность',
      color: 'bg-red-50 text-primary-600'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Достижения',
      description: 'Отслеживание спортивных достижений и наград',
      color: 'bg-red-50 text-primary-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Безопасность',
      description: 'Защита персональных данных и конфиденциальность',
      color: 'bg-red-50 text-primary-600'
    }
  ]
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ПК</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Пума-Каратэ</h1>
                <p className="text-sm text-gray-600">Спортивный центр</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Вход
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="px-6 py-2 border border-primary-500 text-primary-500 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-red-50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Информационная система
                <span className="text-primary-500"> спортивного центра</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Профессиональное решение для управления тренировочным процессом, 
                организации соревнований и ведения электронного журнала
              </p>
              
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  Начать работу
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
                >
                  Узнать больше
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Основные возможности
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Полный цикл управления спортивным центром в одной системе
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card p-8 hover:border-primary-200"
              >
                <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">24/7</div>
              <p className="text-gray-600">Доступность системы</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">100%</div>
              <p className="text-gray-600">Надежность данных</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">50+</div>
              <p className="text-gray-600">Тренировок в месяц</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">200+</div>
              <p className="text-gray-600">Участников системы</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Готовы оптимизировать работу спортивного центра?
          </h2>
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
            Присоединяйтесь к современной системе управления уже сегодня
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-10 py-4 bg-white text-primary-500 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-2xl"
          >
            Запросить доступ
          </button>
        </div>
      </section>
      
      {/* Footer */}
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
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">© 2024 Пума-Каратэ</p>
              <p className="text-gray-400">Все права защищены</p>
              <p className="text-gray-400 mt-2">contact@pumakarate.ru</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}